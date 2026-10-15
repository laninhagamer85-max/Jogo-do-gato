import { cleanWalkAtlas, homeWalkDirection } from "./petFrameCleanup";
import { petWalkAtlas, walkFrame } from "./petWalkAtlas";
import { roamCompanion, type CompanionRoam } from "./companionMotion";
import { Camera } from "@babylonjs/core/Cameras/camera";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import "@babylonjs/core/Shaders/default.vertex.js";
import "@babylonjs/core/Shaders/default.fragment.js";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { CURRENT_SAVE_KEY, SKINS, type CompanionId, type DecorationPlacement, type PetCharacterId, type PetGender } from "./PetGame";
import { GAME_ASSETS } from "./assets";

type PetActionEvent = CustomEvent<{ action?: string; sleeping?: boolean }>;
type PetSkinEvent = CustomEvent<{ skinId?: string }>;
type PetLevelEvent = CustomEvent<{ level?: number }>;
type PetProfileEvent = CustomEvent<{ gender?: PetGender; characterId?: PetCharacterId | null }>;
type PetCompanionEvent = CustomEvent<{ companionId?: CompanionId | null }>;
type PetRoomEvent = CustomEvent<{ room?: number }>;
type PetMoveEvent = CustomEvent<{ x?: number; y?: number }>;
type PetBlinkEvent = CustomEvent<Record<string, never>>;
type PetDecorationsEvent = CustomEvent<{ placements?: DecorationPlacement[] }>;

export type GameHandle = { scene: Scene; dispose: () => void };
export type ScenePetState = { level: number; room?: number; skin: string; sleeping: boolean; gender: PetGender | null; characterId?: PetCharacterId | null; companion: CompanionId | null };

const skinTint = (id: string) => SKINS.find((skin) => skin.id === id)?.tint ?? "#ffffff";

function readSave(): ScenePetState {
  try {
    const saved = localStorage.getItem(CURRENT_SAVE_KEY);
    if (!saved) return { level: 1, room: 1, skin: "tigrinho", sleeping: false, gender: null, companion: null };
    const parsed = JSON.parse(saved) as { level?: number; activeRoom?: number; skin?: string; sleeping?: boolean; profile?: { gender?: PetGender; characterId?: PetCharacterId } | null; activeCompanionId?: CompanionId | null };
    return {
      level: Math.max(1, Math.min(10, Math.round(parsed.level ?? 1))),
      room: Math.max(1, Math.min(10, Math.round(parsed.activeRoom ?? parsed.level ?? 1))),
      skin: parsed.skin ?? "tigrinho",
      sleeping: parsed.sleeping === true,
      gender: parsed.profile?.gender === "menino" || parsed.profile?.gender === "menina" ? parsed.profile.gender : null,
      characterId: parsed.profile?.characterId ?? null,
      companion: parsed.activeCompanionId === "mimi" || parsed.activeCompanionId === "tico" ? parsed.activeCompanionId : null,
    };
  } catch {
    return { level: 1, room: 1, skin: "tigrinho", sleeping: false, gender: null, companion: null };
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

export async function createGameScene(engine: Engine, canvas: HTMLCanvasElement, initialState?: ScenePetState): Promise<GameHandle> {
  const saved = initialState ?? readSave();
  let currentRoom = saved.room ?? saved.level;
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
  let backgroundTexture = new Texture(GAME_ASSETS.levels[currentRoom - 1] ?? GAME_ASSETS.levels[0], scene, false, true, Texture.TRILINEAR_SAMPLINGMODE);
  backgroundMaterial.diffuseTexture = backgroundTexture;

  // One small procedural texture shared by both shadows; no external asset or per-frame redraw.
  const contactTexture = new DynamicTexture("pet-contact-shadow", { width: 128, height: 128 }, scene, false);
  contactTexture.hasAlpha = true;
  const shadowContext = contactTexture.getContext();
  const gradient = shadowContext.createRadialGradient(64, 64, 4, 64, 64, 62);
  gradient.addColorStop(0, "rgba(38, 28, 29, 0.42)");
  gradient.addColorStop(0.38, "rgba(38, 28, 29, 0.26)");
  gradient.addColorStop(0.75, "rgba(38, 28, 29, 0.08)");
  gradient.addColorStop(1, "rgba(38, 28, 29, 0)");
  shadowContext.fillStyle = gradient;
  shadowContext.fillRect(0, 0, 128, 128);
  contactTexture.update();
  const createContactShadow = (name: string) => {
    const mesh = MeshBuilder.CreatePlane(name, { width: 1, height: 1 }, scene);
    const material = new StandardMaterial(`${name}-material`, scene);
    material.disableLighting = true;
    material.diffuseTexture = contactTexture;
    material.emissiveColor = Color3.White();
    material.useAlphaFromDiffuseTexture = true;
    material.backFaceCulling = false;
    mesh.material = material;
    mesh.isPickable = false;
    mesh.alphaIndex = -1; // Behind transparent characters and decorations, above the opaque room.
    mesh.position.z = 1.9;
    return { mesh, material };
  };
  const petShadow = createContactShadow("pet-floor-contact");
  const companionShadow = createContactShadow("companion-floor-contact");
  companionShadow.mesh.isVisible = false;

  const kittenAsset = saved.characterId ? GAME_ASSETS.characters[saved.characterId] : GAME_ASSETS.kitten;
  const { mesh: kitten, material: kittenMaterial } = imageSprite(scene, "the-named-pet", kittenAsset, 3.35, 3.35);
  let characterTexture = kittenMaterial.diffuseTexture as Texture;
  let activeCharacter = saved.characterId;
  let homeWalkPhase = 0;
  let homeWalkTexture: Texture | null = null;
  let atlasLoadGeneration = 0;
  const prepareWalkTexture = () => {
    const generation = ++atlasLoadGeneration;
    homeWalkTexture?.dispose(); homeWalkTexture = null;
    const atlas = petWalkAtlas(activeCharacter); if (!atlas) return;
    const image = new Image();
    image.onload = () => {
      if (generation !== atlasLoadGeneration || scene.isDisposed) return;
      const cleaned = cleanWalkAtlas(image);
      const canvas = document.createElement('canvas'); canvas.width=canvas.height=1024;
      canvas.getContext('2d')?.drawImage(cleaned,0,0,1024,1024);
      const texture = new DynamicTexture('pet-walk-clean',canvas,scene,false,Texture.BILINEAR_SAMPLINGMODE);
      texture.hasAlpha=true; texture.uScale=.25; texture.vScale=.25; texture.update();
      homeWalkTexture=texture;
    };
    image.src=atlas;
  };
  prepareWalkTexture();
  kitten.position.set(0, -1.12, 0);
  let currentSkin = saved.skin;
  const applySkin = (skinId: string) => {
    currentSkin = skinId;
    const tint = Color3.FromHexString(skinTint(skinId));
    kittenMaterial.diffuseColor = tint;
    kittenMaterial.emissiveColor = tint.scale(skinId === "tigrinho" ? 0.06 : 0.34);
  };
  applySkin(saved.skin);

  const boyHat = imageSprite(scene, "boy-pet-cap", GAME_ASSETS.accessories.boy, 1.0, 1.0);
  const girlBow = imageSprite(scene, "girl-pet-bow", GAME_ASSETS.accessories.girl, 0.8, 0.8);
  boyHat.mesh.position.z = -0.22;
  girlBow.mesh.position.z = -0.22;
  boyHat.mesh.isVisible = saved.gender === "menino" && !saved.characterId;
  girlBow.mesh.isVisible = saved.gender === "menina" && !saved.characterId;

  let companionSprite: ReturnType<typeof imageSprite> | null = null;
  let companionId: CompanionId | null = null;
  let companionBaseX = 2.2;
  let companionRoam: CompanionRoam | null = null;
  const setCompanion = (id: CompanionId | null) => {
    if (id === companionId) return;
    companionSprite?.mesh.dispose(false, true);
    companionSprite = null;
    companionRoam = null;
    companionId = id;
    companionShadow.mesh.isVisible = Boolean(id);
    if (!id) return;
    const url = GAME_ASSETS.companions[id];
    companionSprite = imageSprite(scene, `friend-${id}`, url, 1.62, 1.62);
    companionSprite.mesh.position.z = 0.12;
  };
  setCompanion(saved.companion);

  let baseY = -1.12;
  let positionX = 0;
  let positionY = baseY;
  let targetX = positionX;
  let targetY = positionY;
  let walking = false;
  let lastFrame = performance.now();
  let petWidth = 3.35;
  let sceneAspect = 0;
  const viewHeight = 8.2;
  let backgroundWidth = 14;
  let backgroundHeight = 8;
  const decorationSprites = new Map<string, { placement: DecorationPlacement; sprite: ReturnType<typeof imageSprite> }>();
  const updateDecorationSprite = (entry: { placement: DecorationPlacement; sprite: ReturnType<typeof imageSprite> }) => {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const viewWidth = viewHeight * sceneAspect;
    const displaySize = Math.min(132, Math.max(60, window.innerWidth * 0.1));
    const worldSize = (viewWidth * displaySize) / rect.width;
    const { placement, sprite } = entry;
    sprite.material.diffuseColor = Color3.White();
    sprite.material.emissiveColor = Color3.White();
    sprite.mesh.scaling.set(worldSize, worldSize, 1);
    sprite.mesh.position.set(
      (placement.x / 100 - 0.5) * backgroundWidth,
      (0.5 - placement.y / 100) * backgroundHeight,
      1.55 - (placement.y / 100) * 0.45,
    );
    sprite.mesh.rotation.z = (placement.rotation * Math.PI) / 180;
    sprite.mesh.isPickable = true;
    sprite.mesh.metadata = { decorationId: placement.id };
  };
  const resizeScene = () => {
    const width = Math.max(1, engine.getRenderWidth());
    const height = Math.max(1, engine.getRenderHeight());
    const aspect = width / height;
    const previousBaseY = baseY;
    const previousViewWidth = viewHeight * sceneAspect;
    sceneAspect = aspect;
    camera.orthoTop = viewHeight / 2;
    camera.orthoBottom = -viewHeight / 2;
    camera.orthoLeft = (-viewHeight * aspect) / 2;
    camera.orthoRight = (viewHeight * aspect) / 2;
    const viewWidth = viewHeight * aspect;
    const roomRatio = 16 / 9;
    const bgHeight = Math.max(viewHeight, viewWidth / roomRatio);
    const bgWidth = Math.max(viewWidth, viewHeight * roomRatio);
    const usePortraitFit = aspect < 0.7;
    backgroundWidth = bgWidth;
    backgroundHeight = bgHeight;
    background.scaling.set(bgWidth / 14, bgHeight / 8, 1);
    backgroundMaterial.emissiveColor = Color3.White();
    decorationSprites.forEach(updateDecorationSprite);

    baseY = usePortraitFit ? 0.78 : aspect < 1.15 ? -0.35 : -1.12;
    petWidth = aspect < 0.7 ? Math.min(2.2, viewWidth * 0.60) : Math.min(3.35, viewWidth * 0.48);
    // Move the animation coordinates too: previously the next frame undid portrait framing.
    const verticalOffset = baseY - previousBaseY;
    positionY += verticalOffset;
    targetY += verticalOffset;
    const horizontalRatio = previousViewWidth > 0 ? viewWidth / previousViewWidth : 1;
    const horizontalLimit = Math.max(0, (viewWidth - petWidth) / 2);
    positionX = Math.max(-horizontalLimit, Math.min(horizontalLimit, positionX * horizontalRatio));
    targetX = Math.max(-horizontalLimit, Math.min(horizontalLimit, targetX * horizontalRatio));
    kitten.position.set(positionX, positionY, 0);
    const scale = petWidth / 3.35;
    kitten.scaling.set(scale, scale, 1);
    boyHat.mesh.position.set(-0.12 * scale, baseY + 1.42 * scale, -0.22);
    boyHat.mesh.scaling.set(scale, scale, 1);
    girlBow.mesh.position.set(0.62 * scale, baseY + 1.40 * scale, -0.22);
    girlBow.mesh.scaling.set(scale, scale, 1);
    companionBaseX = aspect < 0.7 ? Math.min(1.35, viewWidth * 0.28) : aspect < 1.15 ? 1.8 : 2.45;
    if (companionSprite) {
      companionRoam = null; // Re-anchor to the new floor after an orientation change.
      companionSprite.mesh.position.set(companionBaseX, baseY - 0.55 * scale, 0.12);
      const companionScale = scale * (aspect < 0.7 ? 0.84 : 1);
      companionSprite.mesh.scaling.set(companionScale, companionScale, 1);
    }
  };
  resizeScene();

  let sleeping = saved.sleeping;
  let reactionStart = performance.now();
  let blinkTriggerStart = Number.NEGATIVE_INFINITY;
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
    applySkin(skinId);
    reactionKind = "select";
    reactionStart = performance.now();
  };
  const setRoom = (room: number) => {
    currentRoom = Math.max(1, Math.min(10, Math.round(room)));
    const imageUrl = GAME_ASSETS.levels[currentRoom - 1] ?? GAME_ASSETS.levels[0];
    const texture = new Texture(imageUrl, scene, false, true, Texture.TRILINEAR_SAMPLINGMODE);
    const old = backgroundTexture;
    backgroundTexture = texture;
    backgroundMaterial.diffuseTexture = texture;
    old.dispose();
  };
  const onRoom = (event: Event) => setRoom((event as PetRoomEvent).detail?.room ?? currentRoom);
  const onDecorations = (event: Event) => {
    const placements = (event as PetDecorationsEvent).detail?.placements ?? [];
    decorationSprites.forEach((entry) => entry.sprite.mesh.dispose(false, true));
    decorationSprites.clear();
    for (const placement of placements.slice(0, 40)) {
      const url = GAME_ASSETS.decorations[placement.itemId];
      if (!url) continue;
      const sprite = imageSprite(scene, `room-decoration-${placement.id}`, url, 1, 1);
      const entry = { placement, sprite };
      decorationSprites.set(placement.id, entry);
      updateDecorationSprite(entry);
    }
  };
  const onMove = (event: Event) => {
    const detail = (event as PetMoveEvent).detail;
    const xPct = Math.max(5, Math.min(95, Number(detail?.x ?? 50))) / 100;
    const yPct = Math.max(15, Math.min(86, Number(detail?.y ?? 70))) / 100;
    const viewWidth = viewHeight * sceneAspect;
    targetX = (xPct - 0.5) * (viewWidth - petWidth * 0.55);
    targetY = Math.max(-2.2, Math.min(1.25, (0.5 - yPct) * viewHeight));
    walking = true;
    sleeping = false;
    reactionKind = "walk";
    reactionStart = performance.now();
  };
  const onLevel = (event: Event) => {
    const level = Math.max(1, Math.min(10, Math.round((event as PetLevelEvent).detail?.level ?? 1)));
    setRoom(level);
    reactionKind = "level";
    reactionStart = performance.now();
  };
  const onProfile = (event: Event) => {
    const profile = (event as PetProfileEvent).detail;
    const gender = profile?.gender;
    const characterId = profile?.characterId;
    activeCharacter = characterId;
    homeWalkPhase = 0; prepareWalkTexture();
    if (characterId && GAME_ASSETS.characters[characterId]) {
      const texture = new Texture(GAME_ASSETS.characters[characterId], scene, false, true, Texture.TRILINEAR_SAMPLINGMODE);
      texture.hasAlpha = true;
      kittenMaterial.diffuseTexture = texture;
      kittenMaterial.emissiveTexture = texture;
      characterTexture.dispose();
      characterTexture = texture;
    }
    applySkin(currentSkin);
    boyHat.mesh.isVisible = gender === "menino" && !characterId;
    girlBow.mesh.isVisible = gender === "menina" && !characterId;
    reactionKind = "select";
    reactionStart = performance.now();
  };
  const onCompanion = (event: Event) => { setCompanion((event as PetCompanionEvent).detail?.companionId ?? null); resizeScene(); };
  const onPetBlink = (_event: PetBlinkEvent) => { blinkTriggerStart = performance.now(); };
  window.addEventListener("pet:action", onAction);
  window.addEventListener("pet:skin", onSkin);
  window.addEventListener("pet:level", onLevel);
  window.addEventListener("pet:profile", onProfile);
  window.addEventListener("pet:companion", onCompanion);
  window.addEventListener("pet:room", onRoom);
  window.addEventListener("pet:decorations", onDecorations);
  window.addEventListener("pet:move", onMove);
  window.addEventListener("pet:blink", onPetBlink as EventListener);

  let lastHitbox: { x: number; y: number; width: number; height: number } | null = null;
  const renderObserver = scene.onBeforeRenderObservable.add(() => {
    const aspect = engine.getRenderWidth() / Math.max(1, engine.getRenderHeight());
    if (Math.abs(aspect - sceneAspect) > 0.01) resizeScene();
    const now = performance.now();
    const delta = Math.min(40, Math.max(0, now - lastFrame));
    lastFrame = now;
    const dx = targetX - positionX;
    const dy = targetY - positionY;
    const distance = Math.hypot(dx, dy);
    if (!sleeping && distance > 0.045) {
      const step = Math.min(distance, delta * 0.00215);
      homeWalkPhase += step / 1.6;
      positionX += (dx / distance) * step;
      positionY += (dy / distance) * step;
      walking = true;
    } else {
      if (!sleeping) { positionX = targetX; positionY = targetY; }
      walking = false;
    }
    const pilotWalking = walking && Boolean(petWalkAtlas(activeCharacter)) && homeWalkTexture?.isReady();
    const walkDirection = homeWalkDirection(dx,dy);
    if (pilotWalking && homeWalkTexture) {
      homeWalkTexture.uOffset = walkFrame(homeWalkPhase) / 4;
      homeWalkTexture.vOffset = (3-walkDirection.row) / 4;
    }
    const visibleTexture = pilotWalking ? homeWalkTexture : characterTexture;
    kittenMaterial.diffuseTexture = visibleTexture;
    kittenMaterial.emissiveTexture = visibleTexture;
    const elapsed = now - reactionStart;
    const wave = Math.sin(now / (sleeping ? 1200 : walking ? 145 : 520)) * (sleeping ? 0.026 : walking ? 0 : 0.075);
    let jump = 0;
    let moveX = 0;
    const reactionDuration = reactionKind === "select" ? 1550 : 1000;
    if (!sleeping && reactionKind !== "walk" && elapsed >= 0 && elapsed < reactionDuration) {
      const progress = elapsed / reactionDuration;
      if (reactionKind === "level") {
        jump = Math.max(0, Math.sin(progress * Math.PI * 4)) * (1 - progress) * 0.52;
        moveX = Math.sin(progress * Math.PI * 2) * 0.34;
      } else if (reactionKind === "select") {
        jump = Math.abs(Math.sin(progress * Math.PI * 3)) * (1 - progress) * 0.48;
        moveX = Math.sin(progress * Math.PI * 2) * 0.24;
      } else {
        jump = Math.sin(progress * Math.PI) * 0.24;
        moveX = Math.sin(progress * Math.PI * 2) * 0.13;
      }
    }
    kitten.position.set(positionX + moveX, positionY + wave + jump, 0);
    // The footprint stays on the floor while the pet reacts above it.
    const elevation = Math.max(0, wave + jump);
    const shadowSpread = 1 + Math.min(0.4, elevation * 0.7);
    petShadow.mesh.position.set(positionX + moveX, positionY - petWidth * 0.46, 1.9);
    petShadow.mesh.scaling.set(petWidth * 0.62 * shadowSpread, petWidth * 0.115 * shadowSpread, 1);
    petShadow.material.alpha = Math.max(0.42, 0.9 - elevation * 0.65);
    const canvasRect = canvas.getBoundingClientRect();
    const viewWidth = viewHeight * sceneAspect;
    if (canvasRect.width && canvasRect.height && viewWidth) {
      const hitbox = {
        x: canvasRect.left + ((positionX + moveX + viewWidth / 2) / viewWidth) * canvasRect.width,
        y: canvasRect.top + (0.5 - (positionY + wave + jump) / viewHeight) * canvasRect.height,
        width: (petWidth * 0.88 / viewWidth) * canvasRect.width,
        height: (petWidth * 0.98 / viewHeight) * canvasRect.height,
      };
      if (!lastHitbox || Math.abs(hitbox.x - lastHitbox.x) > 1.5 || Math.abs(hitbox.y - lastHitbox.y) > 1.5 || Math.abs(hitbox.width - lastHitbox.width) > 1 || Math.abs(hitbox.height - lastHitbox.height) > 1) {
        lastHitbox = hitbox;
        window.dispatchEvent(new CustomEvent("pet:hitbox", { detail: hitbox }));
      }
    }
    kitten.rotation.z = (walking && !pilotWalking ? (targetX < positionX ? 1 : -1) * 0.13 : 0) + Math.sin(now / 1450) * (sleeping ? 0.012 : 0.028) + (reactionKind === "level" && elapsed < 1250 ? Math.sin(now / 58) * 0.045 : 0);
    const pulse = 1 + Math.max(0, 1 - elapsed / (reactionKind === "select" ? 1450 : 900)) * (reactionKind === "level" ? 0.045 : reactionKind === "select" ? 0.12 : 0.02);
    const scale = (petWidth / 3.35) * pulse;
    const blinkPhase = (now % 4100);
    const idleBlink = blinkPhase > 1750 && blinkPhase < 1850 ? Math.sin(((blinkPhase - 1750) / 100) * Math.PI) : 0;
    const requestedBlinkElapsed = now - blinkTriggerStart;
    const requestedBlink = requestedBlinkElapsed >= 0 && requestedBlinkElapsed < 260 ? Math.sin((requestedBlinkElapsed / 260) * Math.PI) : 0;
    const blink = Math.max(idleBlink, requestedBlink);
    kitten.scaling.set((pilotWalking && walkDirection.mirror ? -1 : 1) * scale * (1 + blink * 0.07), scale * (1 - blink * 0.055), 1);
    const accessoryScale = petWidth / 3.35;
    boyHat.mesh.position.set(positionX + moveX - 0.12 * accessoryScale, positionY + wave + jump + 1.42 * accessoryScale, -0.22);
    boyHat.mesh.rotation.z = kitten.rotation.z * 0.65;
    girlBow.mesh.position.set(positionX + moveX + 0.62 * accessoryScale, positionY + wave + jump + 1.40 * accessoryScale, -0.22);
    girlBow.mesh.rotation.z = kitten.rotation.z * 0.6;
    if (companionSprite) {
      const companionWidth = 1.62 * companionSprite.mesh.scaling.x;
      const horizontalLimit = Math.max(0, (viewWidth - companionWidth) / 2);
      const initialPoint = {
        x: Math.max(-horizontalLimit, Math.min(horizontalLimit, positionX + companionBaseX)),
        y: positionY - petWidth * 0.46,
      };
      companionRoam ??= { point: initialPoint, target: null, pauseMs: 1500 };
      companionRoam = roamCompanion(companionRoam, {
        left: -horizontalLimit, right: horizontalLimit,
        bottom: -viewHeight / 2 + 0.3,
        top: Math.min(1.25 - petWidth * 0.46, viewHeight / 2 - companionWidth),
      }, delta, sleeping);
      const companionGround = companionRoam.point;
      // Sprite and shadow share a fixed foot point; no free-running vertical oscillation.
      companionSprite.mesh.position.set(companionGround.x, companionGround.y + companionWidth * 0.46, 0.12);
      companionShadow.mesh.position.set(companionGround.x, companionGround.y, 1.9);
      companionShadow.mesh.scaling.set(companionWidth * 0.66, companionWidth * 0.13, 1);
      companionShadow.material.alpha = 0.7;
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
      window.removeEventListener("pet:room", onRoom);
      window.removeEventListener("pet:decorations", onDecorations);
      window.removeEventListener("pet:move", onMove);
      window.removeEventListener("pet:blink", onPetBlink as EventListener);
      atlasLoadGeneration++; homeWalkTexture?.dispose();
      scene.onBeforeRenderObservable.remove(renderObserver);
      scene.dispose();
    },
  };
}
