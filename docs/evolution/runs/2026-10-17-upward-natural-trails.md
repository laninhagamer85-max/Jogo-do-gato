# Upward progression and natural trails —1.14.1

User rejected smooth flatribbon and approved two-mode naturalterrain visualpreview, requested bottom-to-top progression in portrait ANDlandscape, then authorized applying/publishing. Resumedafterenvironmentreset; publicationstill1.14.0/Sites66. Sourceopenedfrom93c29583ba447fad56d12341cc130ac3a1cd3e1b; GitHubparentaf1f78ba9466124b5d13b00876cb37cf8b6ddb1f. SameSitepublic/branchreview/grass-option3-20261016; no save/backend/auth/physicschanges.

Both maps now use verticalupwardcoordinates for anyscreenorientation. Chapter order/recentering/backgroundmasks/scrolllabel follow reverseworldY; currentroomcentered onopen, Meu progresso returns checkpoint. StageIDs,inventory,replays,ratings and unlockgates unchanged. Chapter1440px with128pxminstageinterval; preservecoordinatesrelativetoworldbottomifnewchaptersadded. Continuous numbering1..100/1..20 retained.

NaturalTrail replaces old stroke-bank ribbon with rastermaterialpattern and irregular displacementedge/softearthcontact, sparse pebbles/grass. Separate stone,leafyforest,riverpebble materials; futureworldsgray. Perchapterpathsegments boundfilterarea ratherthan filteringwhole100stageworldrepeatedly. NewfirstAdventurebackgroundhomefloor/turquoiserug/petbowlsopensintoflowergarden, openwalkablecentre. Existingotherworldbackgrounds/pets/rewards retained. This is implemented dynamicartcomposition; approvedboard was illustrative, not embeddedUI or a screenshot.

Originalbuilt-inimagegenassets: squareseamless topdownground materials, no UI/labels/characters/pathshape; homeportrait elevatedstorybookpetroom opensintogarden withclearcentralground, plants/fences/flowers atedges, no UI/numbers/characters. OriginalPNGs preserved in generated_images; RGBWebP quality82method4. Assets:
- path-stone-v1.webp: (1254, 1254), 417854bytes, SHA256 8754435c92678717b26f5380e1fb279c1a891f72c28b8a234747617ce5879e31.
- path-forest-v1.webp: (1254, 1254), 497082bytes, SHA256 6253f7a5f8ad098403a1df16cf5884c61b1ade822c078dfb6b577461d41721b6.
- path-river-v1.webp: (1254, 1254), 473734bytes, SHA256 c57f14da02593cc0a7e3f810397c2a246c99375eb1fbcdb6e6621ad62abb4dbd.
- home-trail-scene-v1.webp: (1024, 1536), 496102bytes, SHA256 c5ed5b11720e49afdfbfe5fabe778126c7e41565af78fe449f75e8b32f49558b.

Validation: TypeScriptpassed;431offline tests/42files passed. Fiveviewportgeometrytests now assert allnextY decreases, chapterjoins andbottomanchoredexpansion across320x570/390x600/768x900/844x220/1280x540; SSRchecks naturalmaterialuse/noflatroute andexisting100rewards. These are simulatedgeometry/SSR, notphonebrowserchecks. Firebaseintegrationexcluded absentstagingcredential. Buildinprogress. Localbrowserpreview unavailable under managedSites/control-browserrule; userauthorizedpublishingfortest. Cloudpostdeploycheckpending. No100levelplaythroughclaim.

Research MDN https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDisplacementMap and https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/pattern usedforrastermaterialandorganicborder. RollbacklastSite66onlyifimmediatepredecessor;preserveplayersavesandlatercollaborators. Newartboundtoexistingproject; no paidexternalservice/permissionchanges.

Published1.14.1 Sites67 succeeded; source26a8ca219529a6f6f0883cf60f70c637eff57979; savedversionappgprj_6ac40994d8d881919d46203a60801e46~appgver_a7d504e96f3881919a14f52292cd515d; deploymentappgdep_6ad4349411f88191961fcd322eb25cc9. Buildpassed. CloudChrome previous tab/session expired; newtab loginpage clearlydisplays1.14.1. Authenticatedmaps NOTvisuallyvalidatedthisrelease; userphone/loginreviewpending. No fakebrowserclaim; generatedtextures/background inspectedlocally, geometry/SSRpassed. No accountcreation/login/savemanipulation thiscycle.
