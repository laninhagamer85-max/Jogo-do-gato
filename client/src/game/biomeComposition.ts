/** Layered, world-space terrain data. No game state, rewards or viewport coordinates. */
export type GroundPoint = Readonly<{x:number;y:number}>;
export type GroundRegion = Readonly<{id:string;material:'soil'|'sand'|'water';seed:number;polygon:readonly GroundPoint[]}>;
export type BiomeProp=Readonly<{x:number;y:number;index:number;width:number;height:number;blocking:false}>;
export type BiomeComposition = Readonly<{id:string;regions:readonly GroundRegion[];props?:readonly BiomeProp[]}>;

/** Sample a closed Catmull–Rom outline once; rendering and collision share these vertices. */
export function organicOutline(points:readonly GroundPoint[], subdivisions=8):GroundPoint[]{
  const result:GroundPoint[]=[];
  for(let i=0;i<points.length;i++){
    const a=points[(i+points.length-1)%points.length],b=points[i],c=points[(i+1)%points.length],d=points[(i+2)%points.length];
    for(let j=0;j<subdivisions;j++){
      const t=j/subdivisions,t2=t*t,t3=t2*t;
      const coord=(key:'x'|'y')=>.5*(2*b[key]+(-a[key]+c[key])*t+(2*a[key]-5*b[key]+4*c[key]-d[key])*t2+(-a[key]+3*b[key]-3*c[key]+d[key])*t3);
      result.push({x:coord('x'),y:coord('y')});
    }
  }
  return result;
}
const outline=(pairs:number[][])=>organicOutline(pairs.map(([x,y])=>({x,y})));

/** Reusable pond module: local coordinates stay separate from the material and blocking rule. */
export function pondComposition(id:string,origin:GroundPoint,scale=1):BiomeComposition{
  const transform=(polygon:readonly GroundPoint[])=>polygon.map(p=>({x:origin.x+p.x*scale,y:origin.y+p.y*scale}));
  return {id,props:[
    // Small loose stones are decoration, not full-size invisible obstacles.
    {x:origin.x-1.35*scale,y:origin.y-.67*scale,index:0,width:.48*scale,height:.32*scale,blocking:false},
    {x:origin.x+.9*scale,y:origin.y+.7*scale,index:0,width:.38*scale,height:.25*scale,blocking:false},
  ],regions:[
    {id:`${id}-bank`,material:'sand',seed:6201,polygon:transform(outline([[-1.8,-.55],[-1.1,-1.02],[-.1,-.85],[1.02,-.7],[1.67,-.1],[1.4,.7],[.35,.94],[-.7,.77],[-1.7,.3]]))},
    {id:`${id}-water`,material:'water',seed:6202,polygon:transform(outline([[-1.5,-.25],[-.92,-.65],[-.08,-.62],[.85,-.48],[1.35,-.03],[1.12,.45],[.28,.65],[-.65,.52],[-1.4,.2]]))},
  ]};
}
const pond=pondComposition('clearing-pond',{x:8.6,y:7.65});
export const PILOT_BIOME:BiomeComposition={id:'clearing-layered-v1',props:pond.props,regions:[
  {id:'camp-trail',material:'soil',seed:7101,polygon:outline([[1.15,1.25],[2.4,1.85],[3.15,3.6],[3.2,5.3],[4.3,6.8],[6.45,7.05],[7.3,6.3],[8.1,5.2],[8.8,4.8],[12.9,4.85],[12.9,4.25],[8.6,4.05],[7.6,4.6],[6.45,6.2],[4.7,6.25],[3.85,5.15],[3.8,3.5],[2.95,1.5],[1.3,1.05]])},
  ...pond.regions,
]};

export function regionBounds(polygon:readonly GroundPoint[]){
  const xs=polygon.map(p=>p.x),ys=polygon.map(p=>p.y);
  return {left:Math.min(...xs),top:Math.min(...ys),right:Math.max(...xs),bottom:Math.max(...ys)};
}
export function insideRegion(p:GroundPoint,polygon:readonly GroundPoint[]):boolean{
  let inside=false;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
    const a=polygon[i],b=polygon[j];
    if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)inside=!inside;
  }
  return inside;
}
function segmentDistance(p:GroundPoint,a:GroundPoint,b:GroundPoint){
  const dx=b.x-a.x,dy=b.y-a.y,length=dx*dx+dy*dy;
  const t=length?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/length)):0;
  return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);
}
export function touchesRegion(p:GroundPoint,radius:number,polygon:readonly GroundPoint[]){
  const bounds=regionBounds(polygon);
  if(p.x+radius<bounds.left||p.x-radius>bounds.right||p.y+radius<bounds.top||p.y-radius>bounds.bottom)return false;
  return insideRegion(p,polygon)||polygon.some((a,i)=>segmentDistance(p,a,polygon[(i+1)%polygon.length])<=radius);
}
export function biomeBlocks(p:GroundPoint,radius=.22,composition=PILOT_BIOME){
  return composition.regions.some(r=>r.material==='water'&&touchesRegion(p,radius,r.polygon));
}
