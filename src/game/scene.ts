import { Camera } from "@babylonjs/core/Cameras/camera";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { CURRENT_SAVE_KEY, type CompanionId, type PetGender } from "./PetGame";
import { GAME_ASSETS } from "./assets";

type PetActionEvent = CustomEvent<{ action?: string; sleeping?: boolean }>;
type PetSkinEvent = CustomEvent<{ skinId?: string }>;
type PetLevelEvent = CustomEvent<{ level?: number }>;
type PetProfileEvent = CustomEvent<{ gender?: PetGender }>;
type PetCompanionEvent = CustomEvent<{ companionId?: CompanionId | null }>;

export type GameHandle = { scene: Scene; dispose: () => void };
export type ScenePetState = { level: number; skin: string; sleeping: boolean; gender: PetGender | null; companion: CompanionId | null };

const SKIN_TINTS: Record<string, string> = {
  tigrinho: "#ffffff",
  laranja: "#fff2e3",
  pretinho: "#eef0ff",
  fantasia: "#f8efff",
};

function readSave(): ScenePetState {
  try {
    const saved = localStorage.getItem(CURRENT_SAVE_KEY);
    if (!saved) return { level: 1, skin: "tigrinho", sleeping: false, gender: null, companion: null };
    const parsed = JSON.parse(saved) as { level?: number; skin?: string; sleeping?: boolean; profile?: { gender?: PetGender } | null; activeCompanionId?: CompanionId | null };
    return {
      level: Math.max(1, Math.min(10, Math.round(parsed.level ?? 1))),
      skin: parsed.skin ?? "tigrinho",
      sleeping: parsed.sleeping === true,
      gender: parsed.profile?.gender === "menino" || parsed.profile?.gender === "menina" ? parsed.profile.gender : null,
      companion: parsed.activeCompanionId === "mimi" || parsed.activeCompanionId === "tico" ? parsed.activeCompanionId : null,
    };
  } catch {
    return { level: 1, skin: "tigrinho", sleeping: false, gender: null, companion: null };
  }
}

function imageSprite(scene: Scene, name: string, url: string, width: number, height: number): { mesh: Mesh; material: StandardMaterial; texture: Texture } {
  const mesh = MeshBuilder.CreatePlane(name, { width, height }, scene);
  const texture = new Texture(url, scene, false, true, Texture.TRILINEAR_SAMPLINGMODE);
  texture.hasAlpha = true;
  const material = new StandardMaterial(`${name}-material`, scene);
  material.disableLighting = true;
  material.diffuseTexture = texture;
  material.emissiveTexture = texture;
  material.useAlphaFromDiffuseTexture = true;
  material.backFaceCulling = false;
  mesh.material = material;
  return { mesh, material, texture };
}

export async function createGameScene(engine: Engine, _canvas: HTMLCanvasElement, initialState?: ScenePetState): Promise<GameHandle> {
  const saved = initialState ?? readSave();
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.06, 0.09, 0.17, 1);
  const camera = new FreeCamera("home-adventure-camera", new Vector3(0, 0, -12), scene);
  camera.setTarget(Vector3.Zero());
  camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
  camera.minZ = 0.1;
  camera.maxZ = 100;
  scene.activeCamera = camera;

  const background = MeshBuilder.CreatePlane("storybook-level-background", { width: 14, height: 8 }, scene);
  background.position.z = 3;
  const backgroundMaterial = new StandardMaterial("level-background-material", scene);
  backgroundMaterial.disableLighting = true;
  backgroundMaterial.backFaceCulling = false;
  background.material = backgroundMaterial;
  let backgroundTexture = new Texture(GAME_ASSETS.levels[saved.level - 1] ?? GAME_ASSETS.levels[0], scene, false, true, Texture.TRILINEAR_SAMPLINGMODE);
  backgroundMaterial.emissiveTexture = backgroundTexture;

  const { mesh: kitten, material: kittenMaterial } = imageSprite(scene, "the-named-pet", GAME_ASSETS.kitten, 3.35, 3.35);
  kitten.position.set(0, -1.12, 0);
  kittenMaterial.diffuseColor = Color3.FromHexString(SKIN_TINTS[saved.skin] ?? "#ffffff");

  const boyHat = imageSprite(scene, "boy-pet-cap", GAME_ASSETS.accessories.boy, 1.0, 1.0);
  const girlBow = imageSprite(scene, "girl-pet-bow", GAME_ASSETS.accessories.girl, 0.8, 0.8);
  boyHat.mesh.position.z = -0.22;
  girlBow.mesh.position.z = -0.22;
  boyHat.mesh.isVisible = saved.gender === "menino";
  girlBow.mesh.isVisible = saved.gender === "menina";

  let companionSprite: ReturnType<typeof imageSprite> | null = null;
  let companionId: CompanionId | null = null;
  let companionBaseX = 2.2;
  const setCompanion = (id: CompanionId | null) => {
    if (id === companionId) return;
    companionSprite?.mesh.dispose(false, true);
    companionSprite = null;
    companionId = id;
    if (!id) return;
    const url = GAME_ASSETS.companions[id];
    companionSprite = imageSprite(scene, `friend-${id}`, url, 1.62, 1.62);
    companionSprite.mesh.position.z = 0.12;
  };
  setCompanion(saved.companion);

  let baseY = -1.12;
  let petWidth = 3.35;
  let sceneAspect = 0;
  const viewHeight = 8.2;
  const resizeScene = () => {
    const width = Math.max(1, engine.getRenderWidth());
    const height = Math.max(1, engine.getRenderHeight());
    const aspect = width / height;
    sceneAspect = aspect;
    camera.orthoTop = viewHeight / 2;
    camera.orthoBottom = -viewHeight / 2;
    camera.orthoLeft = (-viewHeight * aspect) / 2;
    camera.orthoRight = (viewHeight * aspect) / 2;
    const viewWidth = viewHeight * aspect;
    const roomRatio = 16 / 9;
    const bgHeight = Math.max(viewHeight, viewWidth / roomRatio);
    const bgWidth = Math.max(viewWidth, viewHeight * roomRatio);
    background.scaling.set(bgWidth / 14, bgHeight / 8, 1);

    baseY = aspect < 0.7 ? 0.55 : aspect < 1.15 ? -0.35 : -1.12;
    petWidth = aspect < 0.7 ? Math.min(2.45, viewWidth * 0.65) : Math.min(3.35, viewWidth * 0.48);
    kitten.position.y = baseY;
    const scale = petWidth / 3.35;
    kitten.scaling.set(scale, scale, 1);
    boyHat.mesh.position.set(-0.12 * scale, baseY + 1.42 * scale, -0.22);
    boyHat.mesh.scaling.set(scale, scale, 1);
    girlBow.mesh.position.set(0.62 * scale, baseY + 1.40 * scale, -0.22);
    girlBow.mesh.scaling.set(scale, scale, 1);
    companionBaseX = aspect < 0.7 ? Math.min(1.35, viewWidth * 0.28) : aspect < 1.15 ? 1.8 : 2.45;
    if (companionSprite) {
      companionSprite.mesh.position.set(companionBaseX, baseY - 0.55 * scale, 0.12);
      const companionScale = scale * (aspect < 0.7 ? 0.84 : 1);
      companionSprite.mesh.scaling.set(companionScale, companionScale, 1);
    }
  };
  resizeScene();

  let sleeping = saved.sleeping;
  let reactionStart = performance.now();
  let reactionKind = "idle";
  const onAction = (event: Event) => {
    const detail = (event as PetActionEvent).detail;
    const action = detail?.action ?? "love";
    sleeping = action === "sleep" ? detail?.sleeping ?? !sleeping : false;
    reactionKind = action === "play" ? "play" : action;
    reactionStart = performance.now();
  };
  const onSkin = (event: Event) => {
    const skinId = (event as PetSkinEvent).detail?.skinId ?? "tigrinho";
    kittenMaterial.diffuseColor = Color3.FromHexString(SKIN_TINTS[skinId] ?? "#ffffff");
    reactionKind = "happy";
    reactionStart = performance.now();
  };
  const onLevel = (event: Event) => {
    const level = Math.max(1, Math.min(10, Math.round((event as PetLevelEvent).detail?.level ?? 1)));
    const texture = new Texture(GAME_ASSETS.levels[level - 1] ?? GAME_ASSETS.levels[0], scene, false, true, Texture.TRILINEAR_SAMPLINGMODE);
    backgroundMaterial.emissiveTexture = texture;
    const old = backgroundTexture;
    backgroundTexture = texture;
    old.dispose();
    reactionKind = "level";
    reactionStart = performance.now();
  };
  const onProfile = (event: Event) => {
    const gender = (event as PetProfileEvent).detail?.gender;
    boyHat.mesh.isVisible = gender === "menino";
    girlBow.mesh.isVisible = gender === "menina";
    reactionKind = "happy";
    reactionStart = performance.now();
  };
  const onCompanion = (event: Event) => setCompanion((event as PetCompanionEvent).detail?.companionId ?? null);
  window.addEventListener("pet:action", onAction);
  window.addEventListener("pet:skin", onSkin);
  window.addEventListener("pet:level", onLevel);
  window.addEventListener("pet:profile", onProfile);
  window.addEventListener("pet:companion", onCompanion);

  const renderObserver = scene.onBeforeRenderObservable.add(() => {
    const aspect = engine.getRenderWidth() / Math.max(1, engine.getRenderHeight());
    if (Math.abs(aspect - sceneAspect) > 0.01) resizeScene();
    const now = performance.now();
    const elapsed = now - reactionStart;
    const wave = Math.sin(now / (sleeping ? 1200 : 520)) * (sleeping ? 0.026 : 0.075);
    let jump = 0;
    let moveX = 0;
    if (!sleeping && elapsed >= 0 && elapsed < 1000) {
      const progress = elapsed / 1000;
      if (reactionKind === "level") {
        jump = Math.max(0, Math.sin(progress * Math.PI * 4)) * (1 - progress) * 0.52;
        moveX = Math.sin(progress * Math.PI * 2) * 0.34;
      } else {
        jump = Math.sin(progress * Math.PI) * 0.24;
        moveX = Math.sin(progress * Math.PI * 2) * 0.13;
      }
    }
    kitten.position.set(moveX, baseY + wave + jump, 0);
    kitten.rotation.z = Math.sin(now / 1450) * (sleeping ? 0.012 : 0.028) + (reactionKind === "level" && elapsed < 950 ? Math.sin(now / 58) * 0.045 : 0);
    const pulse = 1 + Math.max(0, 1 - elapsed / 650) * (reactionKind === "level" ? 0.045 : 0.02);
    const scale = (petWidth / 3.35) * pulse;
    kitten.scaling.set(scale, scale, 1);
    const accessoryScale = petWidth / 3.35;
    boyHat.mesh.position.set(moveX - 0.12 * accessoryScale, baseY + wave + jump + 1.42 * accessoryScale, -0.22);
    boyHat.mesh.rotation.z = kitten.rotation.z * 0.65;
    girlBow.mesh.position.set(moveX + 0.62 * accessoryScale, baseY + wave + jump + 1.40 * accessoryScale, -0.22);
    girlBow.mesh.rotation.z = kitten.rotation.z * 0.6;
    if (companionSprite) {
      companionSprite.mesh.position.x = companionBaseX + Math.sin(now / 820 + 1.2) * 0.07;
      companionSprite.mesh.position.y = baseY - 0.55 * (petWidth / 3.35) + Math.sin(now / 640 + 1.4) * 0.045;
    }
  });

  return {
    scene,
    dispose: () => {
      window.removeEventListener("pet:action", onAction);
      window.removeEventListener("pet:skin", onSkin);
      window.removeEventListener("pet:level", onLevel);
      window.removeEventListener("pet:profile", onProfile);
      window.removeEventListener("pet:companion", onCompanion);
      scene.onBeforeRenderObservable.remove(renderObserver);
      scene.dispose();
    },
  };
}
