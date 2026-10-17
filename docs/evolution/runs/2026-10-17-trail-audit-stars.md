# Trail audit, glow and room efficiency —1.13.1

User requested scrolling through the entire selection to inspect generation/composition, a bright effect at current progress and three stars below each room number. Reused evolution/Sites skills; preserve campaign/replays/auth.

Observed production1.13.0 cloud Chrome: native horizontal scrolling through both chapters to true end (scrollLeft2022=max), finalmaster and expansionlabel visible; no crash/scrolllock. Found70px blankgreen end and goldroute retained in lockedbiome. Fix backgrounds to cover exactworldend without finalfade; graypath over lockedchapter with nestedSVGviewport; keep sharedcontinuousgeometry. No new playable chapters.

Currentstage goldhalo pulse2.4s; reducedmotion static. Three small stars below each roomnumber; grayunearned, gold earned. Stars record best completion:1finished;2no roomdefeats;3no roomdefeats plus cumulative incomingdamage<=25%maxHP atcompletion. Consumablehealing cannot erase damage. Nextroom resets attemptmetrics; save/reload retains; replay mergesbestonlywithoutmovingmaincheckpoint. Existing state4/schema2 maintained with additiveoptional roomStars/roomPerformance. Legacy completion gets no invented efficiency; UI explains replay for evaluation. Legacy in-progress attempts remain unrated until fresh replay/newroom.

Checks: TypeScript passed;423offline tests/40files passed. Firebase staging integration notrun (credentialabsentpreviously). New tests completionthreshold,roundtrip,nextroomreset,legacy,no mutation,invalidratings,replaybest. Build pending. Cloud postpublication inspection pending; phoneportrait/landscape pending. No false full-game playthrough claim.

Research2026-10-17: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion for static fallback; https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/clipPath for clippingprinciple; implemented nestedSVGviewport without sharedIDs.

Base Site025e642e64e6cafdc9d471ea1b98f3e204c6864d (product1.13.0, Sites62). GitHubparentd772be3502432a4984b36f95344052739f2b458f branchreview/grass-option3-20261016. Rollbackprevioussavedversion62 preserving latercollaborators and saves. No newassets/dependencies/backendchanges.
