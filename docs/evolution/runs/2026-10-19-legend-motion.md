# Legendary cutouts, illustrated weapons and mystery carousel1.18.2

David supplied three live-phone screenshots showing Kael's clipped boots/scarf, neighboring frame fragments and flat geometric sword/bow. Requested complete movement frames, natural equipped items, slider with unreleased heroes concealed. Base1.18.1/Sites90 source3689761aa0f4a61db79a00c73d525352ebfd3e5f, GitHub6b23805e194f035131347b0692f3027e22c7300c. Existing production/domain/audience retained.

## Cause and correction

Previous metadata assumed uniform columns, then computed per-cell bounds including neighboring pose pieces. Low alpha110 also joined two Kael poses vertically. Replaced with global connected-component analysis at alpha160: exactly64Lyra and56Kael complete primary components. Metadata stores true bounds and silhouette path with2px padding. Native offscreenCanvas prepares each masked pose once using source-in; bounded6MP cache. No per-frame scans, filters or PNG encoding; original hero PNG files unchanged. Source boundary recovery frame uses idle, and southeast uses mirrored complete southwest rather than reading the clipped Lyra footer. Source-in masks remove all unrelated component fragments, including those inside the bounding rectangle.

New built-in imagegen illustrated steel/leather/wood sword, dagger, bow and arrow; new original weapons-v1.png. Masks remove faint generation backdrop; no flat geometric weapon overlay remains. Grip landmarks follow each source pose/phase and are mirrored with body; swing/sway and front/back depth follow facing. Bow nocked/flight arrow uses illustrated asset; skip melee slash cue for bow. This remains a four-frame stylized equipment rig over existing body poses, not a full new skeletal/archery animation set. User feedback may still require hand-pose refinement. Damage, recipes, cooldowns and saves unchanged.

Future roster entries use anonymous blurred silhouette/lock,??? and generic accessible labels, no future name/portrait/title displayed. Starter pair remains visible. Horizontal scroll-snap carousel with arrows, center tracking and reduced-motion support replaces eight-card grid. Six future heroes have no equipment panel or unlock action. Original source image still includes all8 for existing starter portrait rendering; concealment is UX, not asset-access security.

## Verification

TypeScript passed;501game tests in43files passed before final render-only swipe exclusion. Focused9tests cover complete component bounds/paths,8direction/mirror mapping,native body+weapon preparation reused, no future identity in accessible/visible markup, existing crafting/unlock/progression contracts. Two-pixel transparent padding allowed past original image bounds; drawImage uses full-source compositing, not an invalid source crop.

Research2026-10-19: MDN globalCompositeOperation https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation (source-in masking); MDN scroll-snap-type https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-snap-type . Managed local preview unavailable; user authorized publication/test; postpublish cloud verification below. No physical phone FPS claim or complete gameplay certification.
