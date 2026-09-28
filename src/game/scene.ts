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
import { GAME_ASSETS } from "./assets";

type PetActionEvent = CustomEvent<{ action?: string }>;
type PetSkinEvent = CustomEvent<{ skinId?: string }>;

export type GameHandle = {
  scene: Scene;
  dispose: () => void;
};

const SKIN_TINTS: Record<string, string> = {
  tigrinho: "#ffffff",
  laranja: "#ffd2a1",
  pretinho: "#b7c2dc",
  fantasia: "#e5d8ff",
};

export async function createGameScene(engine: Engine, _canvas: HTMLCanvasElement): Promise<GameHandle> {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.06, 0.09, 0.17, 1);
  const camera = new FreeCamera("room-camera", new Vector3(0, 0, -12), scene);
  camera.setTarget(Vector3.Zero());
  camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
  camera.minZ = 0.1;
  camera.maxZ = 100;
  scene.activeCamera = camera;

  const background = MeshBuilder.CreatePlane("sunlit-cat-room", { width: 14, height: 8 }, scene);
  background.position.z = 3;
  const roomTexture = new Texture(GAME_ASSETS.room, scene, false, true, Texture.TRILINEAR_SAMPLINGMODE);
  const roomMaterial = new StandardMaterial("room-material", scene);
  roomMaterial.disableLighting = true;
  roomMaterial.emissiveTexture = roomTexture;
  roomMaterial.backFaceCulling = false;
  background.material = roomMaterial;

  const kitten = MeshBuilder.CreatePlane("pudim-the-kitten", { width: 3.35, height: 3.35 }, scene);
  kitten.position.set(0, -1.12, 0);
  const kittenTexture = new Texture(GAME_ASSETS.kitten, scene, false, true, Texture.TRILINEAR_SAMPLINGMODE);
  kittenTexture.hasAlpha = true;
  const kittenMaterial = new StandardMaterial("kitten-material", scene);
  kittenMaterial.disableLighting = true;
  kittenMaterial.diffuseTexture = kittenTexture;
  kittenMaterial.emissiveTexture = kittenTexture;
  kittenMaterial.useAlphaFromDiffuseTexture = true;
  kittenMaterial.backFaceCulling = false;
  kitten.material = kittenMaterial;

  let reactionUntil = 0;
  let sleeping = false;
  const viewHeight = 8.2;
  let baseY = -1.12;
  let petWidth = 3.35;
  let sceneAspect = 0;
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
    kitten.scaling.set(petWidth / 3.35, petWidth / 3.35, 1);
  };
  resizeScene();

  const savedSkin = (() => {
    try {
      const saved = localStorage.getItem("meu-pet-virtual-save-v1");
      return saved ? (JSON.parse(saved) as { skin?: string }).skin : "tigrinho";
    } catch {
      return "tigrinho";
    }
  })();
  try {
    const saved = localStorage.getItem("meu-pet-virtual-save-v1");
    sleeping = saved ? (JSON.parse(saved) as { sleeping?: boolean }).sleeping === true : false;
  } catch {
    sleeping = false;
  }
  kittenMaterial.diffuseColor = Color3.FromHexString(SKIN_TINTS[savedSkin || "tigrinho"] ?? "#ffffff");

  const onAction = (event: Event) => {
    const action = (event as PetActionEvent).detail?.action;
    reactionUntil = performance.now() + 950;
    if (action === "sleep") sleeping = !sleeping;
    else sleeping = false;
  };
  const onSkin = (event: Event) => {
    const skinId = (event as PetSkinEvent).detail?.skinId ?? "tigrinho";
    kittenMaterial.diffuseColor = Color3.FromHexString(SKIN_TINTS[skinId] ?? "#ffffff");
    reactionUntil = performance.now() + 600;
  };
  window.addEventListener("pet:action", onAction);
  window.addEventListener("pet:skin", onSkin);

  const renderObserver = scene.onBeforeRenderObservable.add(() => {
    const aspect = engine.getRenderWidth() / Math.max(1, engine.getRenderHeight());
    if (Math.abs(aspect - sceneAspect) > 0.01) resizeScene();
    const now = performance.now();
    const wave = Math.sin(now / (sleeping ? 1200 : 520)) * (sleeping ? 0.035 : 0.085);
    kitten.position.y = baseY + wave;
    kitten.rotation.z = Math.sin(now / 1700) * (sleeping ? 0.008 : 0.018);
    const reacting = now < reactionUntil;
    const pulse = reacting ? 1 + Math.sin(now / 55) * 0.035 : 1;
    kitten.scaling.x = (petWidth / 3.35) * pulse;
    kitten.scaling.y = (petWidth / 3.35) * pulse;
  });

  return {
    scene,
    dispose: () => {
      window.removeEventListener("pet:action", onAction);
      window.removeEventListener("pet:skin", onSkin);
      scene.onBeforeRenderObservable.remove(renderObserver);
      scene.dispose();
    },
  };
}
