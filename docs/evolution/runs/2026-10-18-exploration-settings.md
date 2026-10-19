# Exploration settings / bestiary 1.17.6

David requests checking all tabs, dark button text and Bestiary errors. Base live 1.17.5/Sites87, source f8b2556784ad37ada9035d53d5e79b8b7007073d; collaboration b8d5184fe0dd43dff7e8164338b78bf8da58608e. Same Site/audience, no saves or combat changes.

Cloud inspected Audio, tutorial, Bestiary expanded Escaravelho/Rã and room30 manual in844x390 isolated pre-entry fixture. Confirmed Besouro/Lagarta had no portraits. Forest atlas uses uneven first-frame bands; nominal thirds bleed the guardian crown into mushroom portrait and crop crown in guardian. Portrait-only crop uses measured original art bands0–335,335–690,690–1086, with native SVG clipping. Existing gameplay atlas handling unchanged.

Scope colors inside settings explicitly: light cream panel/dark copy; all buttons light text on dark green, selected tab gold border/underline. Existing cloud fixture computed colors were readable; reported production inheritance could differ, so scoped palette avoids chapter theme inheritance. Add visible keyboard focus, nonshrinking portraits and expandable affordance. Use both original enemy atlases for all12NPCs. Avoid repeated equal range bounds; show quantity/detection/leash ranges from variants and explicitly say when no rare drops.

TypeScript passed;16 existing focused tests in3files passed. Production build and post-publication portrait/landscape verification pending. No physical phone test and no claim that prior runtime slowness is solved.

Research2026-10-18: MDN SVG overflow https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/overflow ; W3C contrast https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html . Use clipped sprite viewport and explicit high-contrast control palette. No new art/dependencies.

## Publication and browser check

Published1.17.6 / Sites88, source10e7cc3c7fdfb888634e79465e92907805ff594f, version appgprj_6ac40994d8d881919d46203a60801e46~appgver_46feca1d710481919b74b3a09b0c30d1, deployment appgdep_6ad57b16a16c81918b9c4f82fab630a0 succeeded. GitHub implementation686e4f09eebed9bf060d43775dbf3512a17cab56. Build17.79s and finalTypeScript passed.

Live isolated844x390 and390x844: all four tabs inspected; Besouro and Cogumelo details expanded; all12portraitSVGs present; visible Besouro/Lagarta portraits confirmed. NPC audio slider55→56 responded. Room30 manual selected and locked preview/reward shown. Portrait guide clientWidth337=scrollWidth337, long content scrolls vertically. Button computed foreground rgb255,249,233 on rgb41,75,57; selected tab rgb61,98,72 with gold boundary. Screenshot meupet-1176-bestiario.jpg. Browser console captured extension metadata errors only. No physical phone test, no combat performance claim.
