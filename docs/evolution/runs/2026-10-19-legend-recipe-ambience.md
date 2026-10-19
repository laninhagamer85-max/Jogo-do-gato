# Exploration 1.23.0 — Legendary awakening, NPC variants and chapter ambience

User scope: extend the 1.22.0 HUD/HP update with a costly Legendary unlock above level 5, more simple biome NPC variants, a level-up aura and stronger distinct ambience per chapter.

New unlocks require level 6 (1000 XP), room 1 completed, 180 fibers, 60 amber, 6 woodland crystals and 8 luminous sap. All prerequisites are checked before any mutation; carried materials are used before banked materials, once only. Gender compatibility remains enforced. Already-owned heroes remain owned without retroactive charging. The backpack lists owned/required materials and disables an unavailable unlock. Spending the last equipped crystal also clears its attack bonus.

Each existing painted NPC family can appear in two additional biome palettes/sizes (forest Musgo/Casca, river Turquesa/Ardósia, autumn Dourado/Castanho); positions, enemy IDs, HP and loot rolls remain stable. Smaller variants move 12% faster, larger variants 6% slower. Masters retain their identity. Bestiary groups variants under the original species and lists their appearance names.

An earned level increase triggers a 2.6-second golden halo with soft particles around the actual cat or Legendary. Reduced-motion mode keeps a static fading halo. Effects are transient and excluded from saved progress.

Ambience replaces the old two-note drone with a filtered procedural nature bed, slow gust modulation and sparse biome calls. Forest: leaves/birds; river: water/bubbles; autumn: deeper wind/soft resonances. Default ambient slider 18%→48%; existing user preferences remain intact. Ambient bus gain .018→.22, with smooth mute/unmute. Volume buses for NPC/effects remain separate. Audio starts only after interaction and is muted when paused. One loop bed and LFO per chapter, disposed on chapter switch/unmount; no independent background timers. These are synthesized approximations, not field recordings or licensed music.

QA laboratory adds explicit nonpersistent preparations for unlock recipe and level-up reproduction. It does not write player profiles or bank resources to accounts.

Validation before publication: 552/552 offline tests (56 files), TypeScript passed. Firebase Admin staging integration excluded because its credential is unavailable. Production build and final published browser checks pending. Prior HUD published as105 with final joystick dimensions verified in both orientations.
