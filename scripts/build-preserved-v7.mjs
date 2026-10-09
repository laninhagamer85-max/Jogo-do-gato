import { createHash } from "node:crypto";
import { cp, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Small recovery build: keeps the v7 account UI, icon atlas and game engine.
// The older editable source remains separate until the missing changes are reconciled.
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const baseline = resolve(root, "recovery/published-v7");
const output = resolve(root, "out");
const manifest = JSON.parse(await readFile(resolve(root, "recovery/v7-manifest.json"), "utf8"));
const hash = data => createHash("sha256").update(data).digest("hex");
for (const [path, expected] of Object.entries(manifest.files)) {
  if (hash(await readFile(resolve(baseline, path))) !== expected) throw new Error(`Baseline changed: ${path}`);
}
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(baseline, output, { recursive: true });

const entry = "assets/index-DenPAa8K.js";
const oldScroll = 'document.getElementById(`pa-stage-${Ee}`)?.scrollIntoView({behavior:"smooth",block:"nearest",inline:"center"})';
const newScroll = '((card)=>{const carousel=card?.parentElement;if(card&&carousel)carousel.scrollTo({left:card.offsetLeft-carousel.offsetLeft-(carousel.clientWidth-card.clientWidth)/2,behavior:"smooth"})})(document.getElementById(`pa-stage-${Ee}`))';
const original = await readFile(resolve(output, entry), "utf8");
if (original.split(oldScroll).length !== 2) throw new Error("Expected v7 scroll expression was not found exactly once");
// Keep module names together: lazy chunks import the entry's shared exports.
const updated = original.replace(oldScroll, newScroll);
await writeFile(resolve(output, entry), updated);
const css = await readFile(resolve(root, "client/src/components/AdventureMobile.css"));
const cssName = `assets/adventure-mobile-${hash(css).slice(0, 12)}.css`;
await writeFile(resolve(output, cssName), css);
// A new directory gives the complete module graph one fresh, consistent URL space.
const assetDirectory = `assets-recovery-${hash(Buffer.concat([Buffer.from(updated), css])).slice(0, 12)}`;
await rename(resolve(output, "assets"), resolve(output, assetDirectory));
// Vite's preload tables are root-relative, unlike normal module imports.
for (const name of ["GameCanvas-DAvpSf3L.js", "envTextureLoader-DEnELRmA.js"]) {
  const file = resolve(output, assetDirectory, name);
  const text = await readFile(file, "utf8");
  if (!text.startsWith("const __vite__mapDeps=") || !text.includes('"assets/')) throw new Error(`Unexpected preload table: ${name}`);
  await writeFile(file, text.replaceAll('"assets/', `"${assetDirectory}/`));
}
let html = await readFile(resolve(output, "index.html"), "utf8");
html = html.replace("</head>", `  <link rel="stylesheet" href="/${cssName}" />\n  </head>`);
html = html.replaceAll("/assets/", `/${assetDirectory}/`);
await writeFile(resolve(output, "index.html"), html);
console.log(`Verified ${Object.keys(manifest.files).length} v7 baseline files; applied mobile CSS, map-scroll fix and matching preload paths.`);
