# Legendary cutouts, illustrated weapons and mystery carousel1.18.2

David supplied three live-phone screenshots showing Kael's clipped boots/scarf, neighboring frame fragments and flat geometric sword/bow. Requested complete movement frames, natural equipped items, slider with unreleased heroes concealed. Base1.18.1/Sites90 source3689761aa0f4a61db79a00c73d525352ebfd3e5f, GitHub6b23805e194f035131347b0692f3027e22c7300c. Existing production/domain/audience retained.

## Cause and correction

Previous metadata assumed uniform columns, then computed per-cell bounds including neighboring pose pieces. Low alpha110 also joined two Kael poses vertically. Replaced with global connected-component analysis at alpha160: exactly64Lyra and56Kael complete primary components. Metadata stores true bounds and silhouette path with2px padding. Native offscreenCanvas prepares each masked pose once using source-in; bounded6MP cache. No per-frame scans, filters or PNG encoding; original hero PNG files unchanged. Source boundary recovery frame uses idle, and southeast uses mirrored complete southwest rather than reading the clipped Lyra footer. Source-in masks remove all unrelated component fragments, including those inside the bounding rectangle.

New built-in imagegen illustrated steel/leather/wood sword, dagger, bow and arrow; new original weapons-v1.png. Masks remove faint generation backdrop; no flat geometric weapon overlay remains. Grip landmarks follow each source pose/phase and are mirrored with body; swing/sway and front/back depth follow facing. Bow nocked/flight arrow uses illustrated asset; skip melee slash cue for bow. This remains a four-frame stylized equipment rig over existing body poses, not a full new skeletal/archery animation set. User feedback may still require hand-pose refinement. Damage, recipes, cooldowns and saves unchanged.

Future roster entries use anonymous blurred silhouette/lock,??? and generic accessible labels, no future name/portrait/title displayed. Starter pair remains visible. Horizontal scroll-snap carousel with arrows, center tracking and reduced-motion support replaces eight-card grid. Six future heroes have no equipment panel or unlock action. Original source image still includes all8 for existing starter portrait rendering; concealment is UX, not asset-access security.

## Verification

TypeScript passed;501game tests in43files passed before final render-only swipe exclusion. Focused9tests cover complete component bounds/paths,8direction/mirror mapping,native body+weapon preparation reused, no future identity in accessible/visible markup, existing crafting/unlock/progression contracts. Two-pixel transparent padding allowed past original image bounds; drawImage uses full-source compositing, not an invalid source crop.

Research2026-10-19: MDN globalCompositeOperation https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation (source-in masking); MDN scroll-snap-type https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-snap-type . Managed local preview unavailable; user authorized publication/test; postpublish cloud verification below. No physical phone FPS claim or complete gameplay certification.

## Equipment reference followup1.18.3
User requested equipment composition inspired by reference: original legendary character central, illustrated weapon slots around body, selected item's description/recipe/action below; landscape places detail alongside. Reuses actual sword/dagger/bow ownership and crafting, no invented armor functionality. Removed scroll-driven selection debounce: programmatic scroll was selecting the first card and overriding initial Kael. Arrows/taps explicitly select; swiping browses cards without changing equipment or active hero. Production publication and browser acceptance pending.


1.18.3 published successfully Sites92, source e2606f9e82e6bcc38357c25df10b6fad0a37963e, deploy appgdep_6ad5b38cc8708191906e8ff0ca4f622f; GitHub1f53e0db5585d380cd502792f5511c2400f5436d. Browser isolated male/Kael persisted8of8, unlock worked, selected sword detail visible.

User steering1.18.4: active (or eligible starter before selection) pinned left; other seven heroes slide right. Future heroes retain real names/titles, with black blurred silhouettes of their own portraits. Expandable item library below equipment panel. Same underlying game ownership/crafting. TypeScript and9focusedtests passed.


## Two-card loadout and unlocked powers1.19.0
User added two rare-card slots and unlocked power selection. Added optional secondaryCard/activePower, retaining legacy activeCard and save version4; older single-card saves migrate to one occupied slot. Server-independent immutable equip commands reject unowned cards/powers and prevent duplicate cards. Both card effects apply to Q; identical selected power effect uses OR (no duplicate healing/bonus). Existing boss cards unlock thematic power options: roots extends power range2.2 and slow, tide heals15, amber25% damage; all25energy and existing1000mscooldown. Initial burst retained. Portal/replay/snapshot paths preserve loadout. New boss reward fills vacant card slot rather than replacing a chosen full loadout. Added3tests for ownership, two simultaneous effects/nonstacking, save migration and portal/replay continuity. All504game tests44files passed.
Pinned94 CSS correction saved but not deployed; included in final1.19.0 instead. Last live1.18.4/Sites93.
