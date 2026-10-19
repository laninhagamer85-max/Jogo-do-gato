# Equipment composition and pointer drag1.20.0

User reference uploaded9c242e4861e88208c247fa3423f773fc.jpg inspected: central character, flank slots, right bag grid. Original item/hero art retained; no third-party sprites incorporated. Base live1.19.0/Sites95 source36c6827f2749c29a696bf7acf623bd53ea42b54f; GitHub7f5f1f4b3898c4a5cf910e0b916465f73f74fb1d.

New paperdoll panel has weapon,two rare cards,power around character; grid bag beside in landscape and below in portrait. Pointer capture and8px drag threshold for mouse/touch/pen; fixed ghost ignores hit testing; compatible targets highlighted; drop validated against active hero, type, ownership and card capacity. Character drop uses first empty rare-card slot; a full pair requires explicit replacement slot. Already-equipped drops are idempotent. Pointer cancellation makes no equipment mutation. Invalid drop displays informative modal. Touch/click fallback selects item then target; keyboard buttons retained. Workshop retains crafting and cost feedback, owned items only in main bag, expansion after6entries. Original combat/save rules unchanged.

TypeScript and12focused tests passed. Managed local browser preview unavailable in this environment; user authorized publish/test. Postpublish pointer and responsive QA pending; no physical-device claim.

User steering while packaging: remove roster card frames, larger highlighted active hero, explicit female-only Lyra label. Included before final deployment. Initial1.20.0 package saved but not deployed.
