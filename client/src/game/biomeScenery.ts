/** Reusable art groups; anchors are world positions, never viewport positions.
 * These are decorative templates, not collision geometry or a new playable biome.
 * Do not rotate shaded art: vary the arrangement instead of the light direction.
 */
export type SceneryProp = {x:number;y:number;index:number;width:number;height:number};
type Cluster = {x:number;y:number;scale:number;kind:'ferns'|'rock-garden'|'flowers'|'deadwood'};
const FOREST_GROUPS:Record<Cluster['kind'],SceneryProp[]>={
  ferns:[
    {x:-.47,y:-.2,index:1,width:1.1,height:.85},
    {x:.37,y:.12,index:1,width:.83,height:.72},
    {x:-.05,y:.38,index:1,width:.58,height:.49},
  ],
  'rock-garden':[
    {x:.18,y:-.13,index:0,width:1.24,height:.94},
    {x:-.58,y:.05,index:1,width:.92,height:.81},
    {x:.65,y:.3,index:1,width:.6,height:.5},
    {x:-.2,y:.37,index:3,width:.47,height:.39},
  ],
  flowers:[
    {x:-.32,y:-.17,index:1,width:1.05,height:.86},
    {x:.32,y:.19,index:3,width:.73,height:.62},
    {x:-.35,y:.38,index:1,width:.55,height:.45},
  ],
  deadwood:[
    {x:-.08,y:-.13,index:2,width:1.7,height:.82},
    {x:-.69,y:.16,index:1,width:.7,height:.65},
    {x:.56,y:.35,index:1,width:.58,height:.48},
  ],
};
export function composeForestClusters(clusters:readonly Cluster[]):SceneryProp[]{
  return clusters.flatMap(c=>FOREST_GROUPS[c.kind].map(p=>({
    x:c.x+p.x*c.scale,y:c.y+p.y*c.scale,index:p.index,
    width:p.width*c.scale,height:p.height*c.scale,
  })));
}
/** Chapter-one perimeter: uneven pockets, overlap and gaps; not an alternating fence.
 * All rock/log bases remain outside the playable [1,13] × [1,9] area.
 */
export const FOREST_EDGE_CLUSTERS:readonly Cluster[]=[
  {x:.12,y:.48,scale:1.2,kind:'rock-garden'},
  {x:2.7,y:.63,scale:.87,kind:'ferns'},
  {x:5.1,y:.51,scale:1.36,kind:'ferns'},
  {x:6.36,y:.62,scale:.74,kind:'flowers'},
  {x:10.05,y:.57,scale:1.2,kind:'deadwood'},
  {x:12.9,y:.5,scale:1.32,kind:'rock-garden'},
  {x:.11,y:3.2,scale:1.05,kind:'ferns'},
  {x:.02,y:6.45,scale:1.1,kind:'rock-garden'},
  {x:.17,y:7.65,scale:.82,kind:'flowers'},
  {x:.35,y:10.05,scale:1.34,kind:'ferns'},
  {x:3.2,y:9.97,scale:1.15,kind:'deadwood'},
  {x:6.65,y:10.09,scale:1.28,kind:'rock-garden'},
  {x:8.12,y:9.79,scale:.78,kind:'ferns'},
  {x:11.65,y:10.08,scale:1.33,kind:'flowers'},
  {x:13.92,y:2.6,scale:1.21,kind:'ferns'},
  {x:14.05,y:5.89,scale:1.03,kind:'rock-garden'},
  {x:13.91,y:8.83,scale:1.34,kind:'ferns'},
];
