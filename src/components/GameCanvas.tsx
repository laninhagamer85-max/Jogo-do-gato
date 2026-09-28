import { useEffect, useRef } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { createGameScene, type GameHandle, type ScenePetState } from "@/game/scene";

type CapturePhotoRequest = CustomEvent<{ resolve: (dataUrl: string) => void; reject: (error: Error) => void }>;

export default function GameCanvas({ initialState }: { initialState?: ScenePetState }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || startedRef.current) return;
    startedRef.current = true;

    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      adaptToDeviceRatio: true,
    });
    let handle: GameHandle | null = null;
    let cancelled = false;
    let sceneReadyFrame = 0;
    const onCapturePhoto = (event: Event) => {
      const request = (event as CapturePhotoRequest).detail;
      const camera = handle?.scene.activeCamera;
      if (!camera) { request?.reject(new Error("A cena ainda está carregando.")); return; }
      try {
        handle?.scene.render();
        request.resolve(canvas.toDataURL("image/png"));
      } catch (error) {
        request.reject(error instanceof Error ? error : new Error("Falha ao capturar a cena."));
      }
    };
    window.addEventListener("pet:capture-photo", onCapturePhoto);

    createGameScene(engine, canvas, initialState).then((nextHandle) => {
      if (cancelled) {
        nextHandle.dispose();
        return;
      }
      handle = nextHandle;
      engine.runRenderLoop(() => nextHandle.scene.render());
      sceneReadyFrame = window.requestAnimationFrame(() => window.dispatchEvent(new CustomEvent("pet:scene-ready")));
    });

    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      if (sceneReadyFrame) window.cancelAnimationFrame(sceneReadyFrame);
      window.removeEventListener("pet:capture-photo", onCapturePhoto);
      window.removeEventListener("resize", onResize);
      engine.stopRenderLoop();
      handle?.dispose();
      engine.dispose();
      startedRef.current = false;
    };
  }, []);

  return <canvas ref={canvasRef} className="game-canvas" aria-hidden="true" />;
}
