# Map clarity — 1.16.0

Exploration: eight original background edits reduce small vegetation and decorative clutter while retaining road/bridge composition. Existing node anchors unchanged. SALA labels, challenge icons and concise captions identify rooms. Locked nodes open a preview of the authored hint and actual boss card, but launch stays disabled. Main enemy level comes from authored enemies.

Adventure: FASE labels and challenge badges; nine wood/stone passages connect actual world boundaries. Existing 100 stages and rewards retained. Exploration has 20 rooms. No save migration or gameplay unlock changes.

Art: built-in imagegen edited each existing v2 forest/river portrait/landscape background separately. Prompt requested fewer flowers/ferns/pebbles and calmer grass, same style, no UI/text, road/clearing/bridge positions retained. The 65% removal target was a prompt, not measured output. Eight WebP hashes/dimensions in trail-clean-v3-manifest.json. Code anchors unchanged; visual alignment still requires browser review.

Validation: TypeScript passed; 40 tests in six relevant files passed; official production build passed (existing large chunk warning). Includes locked-preview/launch guards, real card text, caption collision checks and asset hashes. No full playthrough or physical phone test. Supported local preview unavailable; publication authorized for user testing, followed by cloud browser checks.

Research: W3C APG Read Me First and MDN aria-disabled informed distinction between selectable preview and unavailable launch. No external art copied.

Publication pending. Rollback: product1.15.3 / Sites79, version appgprj_6ac40994d8d881919d46203a60801e46~appgver_336e6cb901e48191954923c714d47418; source7cc32d3abc935038e95c81ffcd69c15d225e911f.

## Publication and cloud review

Published successfully: Sites80, source6269e4bd01946e77aa311fbfe14359a79ea6d82e; deployment appgdep_6ad507e5ddbc819183c7905f57b02282. GitHub implementation6e12360ca57cde5f59af4d2d5d48dfe9cb9a9806.

Both maps inspected in cloud iframe390x844 and844x390. New backgrounds and labels loaded; Exploration room10 showed actual Coração dos Troncos effect and disabled launch; Adventure phase11 showed Arco de Flores and disabled launch. No saves unlocked. No full playthrough or physical phone validation. The cloud home3D WebGL limitation is unchanged;2D map review worked.
