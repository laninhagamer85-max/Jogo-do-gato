import type { ForestDirection } from './forestPuzzle';

/** Each finger and physical key owns its input until release/cancel. */
export class ForestControls {
  private keys = new Map<string, ForestDirection>();
  private pointers = new Map<number, ForestDirection>();
  keyDown(key: string, direction: ForestDirection) { this.keys.set(key, direction); }
  keyUp(key: string) { this.keys.delete(key); }
  pointerDown(id: number, direction: ForestDirection) { this.pointers.set(id, direction); }
  pointerUp(id: number) { this.pointers.delete(id); }
  clear() { this.keys.clear(); this.pointers.clear(); }
  snapshot(): Record<ForestDirection, boolean> {
    const held = { up: false, down: false, left: false, right: false };
    for (const direction of [...this.keys.values(), ...this.pointers.values()]) held[direction] = true;
    return held;
  }
}
