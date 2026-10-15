/** Retain the connected subject, discarding fragments from neighbouring atlas cells. */
export function isolateSprite(data: Uint8ClampedArray, width: number, height: number) {
  const labels = new Int32Array(width * height);
  const queue = new Int32Array(width * height);
  let selected = 0, largest = 0, label = 0;
  for (let start = 0; start < labels.length; start++) {
    if (labels[start] || data[start * 4 + 3] < 8) continue;
    label++; let head = 0, tail = 1; queue[0] = start; labels[start] = label;
    while (head < tail) {
      const index = queue[head++], x = index % width, y = Math.floor(index / width);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const next = ny * width + nx;
        if (!labels[next] && data[next * 4 + 3] >= 8) { labels[next] = label; queue[tail++] = next; }
      }
    }
    if (tail > largest) { largest = tail; selected = label; }
  }
  if (!selected) return null;
  let left = width, top = height, right = 0, bottom = 0;
  for (let i = 0; i < labels.length; i++) {
    if (labels[i] !== selected) { data[i * 4 + 3] = 0; continue; }
    const x = i % width, y = Math.floor(i / width);
    left = Math.min(left,x); right = Math.max(right,x); top = Math.min(top,y); bottom = Math.max(bottom,y);
  }
  return { left, top, width: right-left+1, height: bottom-top+1 };
}

const prepared = new WeakMap<HTMLImageElement, HTMLCanvasElement>();
export function cleanWalkAtlas(image: HTMLImageElement): HTMLCanvasElement | HTMLImageElement {
  const existing = prepared.get(image); if (existing) return existing;
  if (typeof document.createElement !== 'function') return image;
  const sheet = document.createElement('canvas'); sheet.width = sheet.height = 1024;
  const ctx = sheet.getContext('2d'); if (!ctx) return image;
  const frames: { canvas: HTMLCanvasElement; box: NonNullable<ReturnType<typeof isolateSprite>> }[] = [];
  const cw = image.naturalWidth/4, ch = image.naturalHeight/4;
  for(let row=0;row<4;row++) for(let col=0;col<4;col++) {
    // Include a small gutter: generated artwork may slightly cross the nominal grid.
    const sx=Math.max(0,Math.floor(col*cw-cw*.055)), sy=Math.max(0,Math.floor(row*ch-ch*.10));
    const ex=Math.min(image.naturalWidth,Math.ceil((col+1)*cw+cw*.055));
    const ey=Math.min(image.naturalHeight,Math.ceil((row+1)*ch+ch*.10));
    const canvas=document.createElement('canvas'); canvas.width=ex-sx; canvas.height=ey-sy;
    const frame=canvas.getContext('2d',{willReadFrequently:true}); if(!frame) return image;
    frame.drawImage(image,sx,sy,canvas.width,canvas.height,0,0,canvas.width,canvas.height);
    const pixels=frame.getImageData(0,0,canvas.width,canvas.height);
    const box=isolateSprite(pixels.data,canvas.width,canvas.height); if(!box) return image;
    frame.putImageData(pixels,0,0); frames.push({canvas,box});
  }
  const scale=Math.min(232/Math.max(...frames.map(f=>f.box.width)),232/Math.max(...frames.map(f=>f.box.height)));
  for(let row=0;row<4;row++) {
    const group=frames.slice(row*4,row*4+4);
    group.forEach(({canvas,box},col)=> {
      const w=box.width*scale,h=box.height*scale;
      ctx.drawImage(canvas,box.left,box.top,box.width,box.height,col*256+(256-w)/2,row*256+252-h,w,h);
    });
  }
  prepared.set(image,sheet); return sheet;
}

/** World y grows upward; diagonals choose the closest available perspective. */
export function homeWalkDirection(dx: number, dy: number) {
  if (Math.abs(dx) < Math.abs(dy)*.5) return { row: dy > 0 ? 2 : 1, mirror: false };
  if (dy > Math.abs(dx)*.35) return { row: 2, mirror: dx < 0 };
  return { row: Math.abs(dy) > Math.abs(dx)*.35 ? 3 : 0, mirror: dx < 0 };
}
