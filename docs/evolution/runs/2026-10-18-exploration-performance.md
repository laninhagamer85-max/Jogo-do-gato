# Exploração1.17.4 — desempenho e configurações antes da sala

David reports freezing during Exploration and requests settings before entry rather than in the active room. Latest live was1.17.2/Sites84; saved1.17.3/Sites85 never deployed due prior turn interruption. Source recovered from pushed1628f59f124fc87ab536407ccf8787fd3b531521 after workspace maintenance, preserving its overview label fix.

## Diagnosis and changes

Cloud isolated live room loaded and exposed no game exception. One console error was browser-extension metadata, not the game. Code showed seeded enemy placement and room foliage rebuilt every simulation/render/minimap call, polygon bounds remapped on collision checks, canvas drawing continued during pause, audio gain automation repeated unchanged, and closed pause dialog could retain guide content in the gameplay React tree. These are verified workloads; they are not proof of the sole cause on David’s physical phone.

Cache enemy definitions by normalized room/seed with64-entry LRU; garden data by immutable room; polygon bounds by immutable polygon. Runtime HP stays in independent combat state. Limit active simulation/draw scheduling to at most30Hz, keep elapsed-ms movement/combat and existing high-resolution canvas/art. Repaint paused/overview only on state/viewport/zoom changes. Avoid identical audio mix automation. Saves, NPC stats, collisions and rewards unchanged.

Extract ExplorationSettings to the chapter screen and explicit pre-entry isolated test screen. Audio, guide, bestiary and room manuals remain available there. Remove gear/tab panels from active room; pause now offers resume or save/return to chapters. Inventory and lens controls retained. QA route exposes DOM draw-count/game-clock attributes only for inspection, not global hidden-state access.

## Measured limits and checks

Before/after,2000 enemy+garden lookups: room1 2.63→2.19ms; room11 963.4→3.22ms; room30 175.65→1.89ms. Single-process NodeCPU microbenchmark, not FPS/phone benchmark.

TypeScript passed;490tests in40gamefiles passed (including cache isolation, eviction determinism, shoreline separation,60/120Hz scheduling cap, paused redraw and settings/room separation). Production build recorded below. No supported local preview available; user authorized correction/publication and post-publish cloud verification. Physical phone performance remains user acceptance.

Research2026-10-18: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas — avoid repeated work/state changes and redraw only changing content. No new art or dependencies.

Rollback: live1.17.2/Sites84 appgprj_6ac40994d8d881919d46203a60801e46~appgver_f02816c17d18819186e3f27109f94708, source8f048e6359bc3e49f81f8b70fe6beaee937cf1ef. New chapter saves campaignVersion3 retain their forward-version safety gate.

Production build passed26.28s; existing chunk-size warning.
