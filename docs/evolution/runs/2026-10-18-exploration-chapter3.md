# Exploração — Capítulo3 / 1.17.0

## Scope and user decision

David approved Exploration art/trail in1.16.0, deferred Adventure visual simplification, requested new Exploration chapters with settings, guide, bestiary and inventory. First bounded release adds Bosque do Âmbar, rooms21–30. Existing chapters1–2 art/anchors and Adventure composition preserved. Chapters4–6 stay planned; each future chapter must be authored, tested and published separately. David selected gradual progression over literal5× exponential NPC scaling. New ordinary NPC HP grows112–192; last master800HP, five times room30 ordinary160HP. Existing levels and pet progression preserved; live campaign difficulty is not yet physically playtested.

## Architecture / adapted implementation brief

- explorationChapter3.ts: ten distinct authored rooms, collection, keys, ordered plates, pond, bridge, consumable recovery, final master; seeded NPC variations share existing atlas, color/size/range stats differ. Existing campaign geometry fits each objective on a reachable cell.
- explorationCampaign.ts: composition/enemy catalogue, stable seeded populations, drop rules.
- explorationHazards.ts: deterministic active-time warning/safe/active phases for brambles and steam. Rendering and damage share same phase; cooldown and safe camp guard; hazards do not block sole path.
- explorationCombat.ts: existing battle/inventory/save engine; master grants Coração do Âmbar once, equip toggles, power adds25% damage with existing25energy cost. Permanent rewards idempotent. Late-biome saves campaignVersion3 reject older2reader to avoid truncating progress on rollback; old saves still accepted.
- explorationGuide.ts: bestiary aggregates actual authored/seeded definitions; drops, levels, HP and chances derived, lore is original descriptive content.
- ExplorationFieldGuide.tsx: tutorial, native details bestiary and room-specific world-space overview (collision, water, bridge, props, NPC, hazards, objectives), preview only with no unlock actions.
- ExplorationCombatPilot: pause/configuration tabs and native modal focus; current controls/inventory retained.
- explorationAudio.ts: dedicated NPC/ambient/action gain buses with per-browser bounded preferences, pause/mute lifecycle, explicit user-gesture unlock, context cleanup. No shared Adventure mixer modification. New synthesized cues and soft two-note ambient bed, not recorded creature voices.
- ExplorationLab.tsx /qa-exploration-lab: explicit memory-only fixture for rooms21–30, no account, persistence or earned rewards. /qa-exploration-viewport.html offers390×844 and844×390 fixture checks. This is not a campaign unlock.

## Art

Eight original built-in imagegen edits of approved forest/forest-river art. Fourmap plates plus fourinternal/chapter seam plates, quality90WebP, original proportions. Prompt: preserve exact road/camera/clearings/bridge/entryports; change only season to restrained golden ochre/copper woodland, calmer olivegrass, few amberstones, noUI/text/numbers/characters; seam lowerblue→uppergold / leftblue→rightgold. Invariants visually reviewed, not mathematical pixel identity claim. Hashes/dimensions recorded in autumn-art-v1-manifest.json. New art in client/public/forest-adventure/*autumn*-v1.webp. NPCs are original project atlas color variations, not wholly new species drawings.

## Research

2026-10-18: https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/setTargetAtTime — gain smoothing; https://www.w3.org/WAI/WCAG22/Techniques/html/H102 — native modal focus/inert/Escape. No external art copied.

## Checks and publication

Typecheck/build and game tests recorded at publication. Offline path/duel simulations are not online playthroughs. Supported local preview unavailable; user explicitly requested publication for tests, followed by cloud QA. No actual player save modified to unlock chapter. Physical phone acceptance pending.

Rollback predecessor1.16.0/Sites80: appgprj_6ac40994d8d881919d46203a60801e46~appgver_10d48e493c988191823d8445cf0c0b23, source6269e4bd01946e77aa311fbfe14359a79ea6d82e. Do not load new chapter saves into older code: reader safety gate will ask for update.

Validation completed before publication: TypeScript passed;484tests in39gamefiles passed; production build passed18.86s, existing chunk-size warning.

## Sites81 browser review and1.17.1 followup

Initial1.17.0 deployment succeeded Sites81 source9fd2d98d21c8a16e88aebf3a6ba716fbd439faab, deployment appgdep_6ad50eb732848191a262c8b1457b7a5d. Cloud390×844/844×390: settings opened native modal with independent55/18/72 sliders; NPC slider keyboard changed; bestiary displayed master800HP and true rare/card rewards; room30 manual rendered collision/water/goal map with blocked preview; room21 loaded sprite/ground and power spent25energy.

Found inherited map title used40%viewport focal position while horizontal recenter used50%, causing room21 to show chapter2 title. Followup uses same focal point as recentering and tests chapters1/2/3 in both orientations. Isolated test page header height now flexes, preserving available canvas/map height instead of fixed70px subtraction. Hazard warning footprint changed from visual ellipse to circular area matching collision geometry. Product1.17.1. No room anchors/backgrounds or actual campaign saves moved.

## Final isolated-lab correction1.17.2

Sites82 succeeded, sourcec50de3f25be6f90292fd4f53115a9f5272df4a6f, deployment appgdep_6ad50ffa0e588191a2d4107d08d0be71. Browser confirmed corrected Chapter3 heading. A test-lab-only nested flex/min-height feedback enlarged its embedded map viewport; normal campaign map was unaffected. Removed that redundant map from the lab: it now launches room21 directly, dropdown chooses21–30, exit opens a simple resume panel. Normal game remains the campaign/trail entry point. Header/canvas use a definite two-row grid. Browser main account check still room1,0/30 completed and350coins; no lab rewards reached the account.

1.17.1 typecheck,48 focused tests and build19.20s passed. Final1.17.2 typecheck and production build also passed before publication. Full engine suite484/39files passed for chapter release; no new gameplay change in lab-only fix.
