# Exploration settings / bestiary 1.17.6

David requests checking all tabs, dark button text and Bestiary errors. Base live 1.17.5/Sites87, source f8b2556784ad37ada9035d53d5e79b8b7007073d; collaboration b8d5184fe0dd43dff7e8164338b78bf8da58608e. Same Site/audience, no saves or combat changes.

Cloud inspected Audio, tutorial, Bestiary expanded Escaravelho/Rã and room30 manual in844x390 isolated pre-entry fixture. Confirmed Besouro/Lagarta had no portraits. Forest atlas uses uneven first-frame bands; nominal thirds bleed the guardian crown into mushroom portrait and crop crown in guardian. Portrait-only crop uses measured original art bands0–335,335–690,690–1086, with native SVG clipping. Existing gameplay atlas handling unchanged.

Scope colors inside settings explicitly: light cream panel/dark copy; all buttons light text on dark green, selected tab gold border/underline. Existing cloud fixture computed colors were readable; reported production inheritance could differ, so scoped palette avoids chapter theme inheritance. Add visible keyboard focus, nonshrinking portraits and expandable affordance. Use both original enemy atlases for all12NPCs. Avoid repeated equal range bounds; show quantity/detection/leash ranges from variants and explicitly say when no rare drops.

TypeScript passed;16 existing focused tests in3files passed. Production build and post-publication portrait/landscape verification pending. No physical phone test and no claim that prior runtime slowness is solved.

Research2026-10-18: MDN SVG overflow https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/overflow ; W3C contrast https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html . Use clipped sprite viewport and explicit high-contrast control palette. No new art/dependencies.
