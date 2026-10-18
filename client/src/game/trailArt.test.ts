import {expect,it,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {trailArtKind,trailArtSource,trailArtAnchors} from './trailArt';
import {explorationTrailLayout} from './explorationTrail';
import NaturalTrail from '../components/NaturalTrail';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
vi.stubGlobal('React',React);

it('ships twelve distinct original assets with matching hashes and authored aspect ratios',()=>{
 const manifest=JSON.parse(readFileSync('docs/evolution/trail-art-v2-manifest.json','utf8')) as {path:string;sha256:string;width:number;height:number;orientation:string}[];
 expect(manifest).toHaveLength(12);expect(new Set(manifest.map(a=>a.sha256)).size).toBe(12);
 for(const a of manifest){const bytes=readFileSync(a.path);expect(bytes.toString('ascii',8,12)).toBe('WEBP');expect(createHash('sha256').update(bytes).digest('hex')).toBe(a.sha256);expect(a.width/a.height).toBeCloseTo(a.orientation==='portrait'?2/3:3/2,6);}
});
it('uses separate orientation assets and keeps the eight unauthored Adventure worlds',()=>{
 expect(trailArtKind('adventure',0)).toBe('home');expect(trailArtKind('adventure',5)).toBe('forest');expect(Array.from({length:10},(_,i)=>trailArtKind('adventure',i)).filter(Boolean)).toHaveLength(2);
 expect(trailArtKind('exploration',0)).toBe('forest');expect(trailArtKind('exploration',1)).toBe('river');expect(trailArtKind('exploration',2)).toBeUndefined();
 expect(trailArtSource('river',true,1)).toContain('portrait-b');expect(trailArtSource('river',false,1)).toContain('landscape-b');
});
it('positions every stage at its plate clearing without nonuniform scaling',()=>{
 for(const mode of ['exploration','adventure'] as const)for(const vertical of [true,false]){
  const l=explorationTrailLayout(vertical?390:844,vertical?600:220,mode==='exploration'?20:100,vertical,mode);
  expect(l.tileSpan/(vertical?l.width:l.height)).toBe(1.5);
  l.points.forEach((p,i)=>{const c=Math.floor(i/10),s=Math.floor(i%10/5),a=trailArtAnchors(mode,c,s,vertical)[i%5],start=vertical?(l.chapters-1-c)*l.chapterSpan+(1-s)*l.tileSpan:c*l.chapterSpan+s*l.tileSpan;
   expect(p.x).toBeCloseTo(vertical?l.width*a[0]:start+l.tileSpan*a[0],6);expect(p.y).toBeCloseTo(vertical?start+l.tileSpan*a[1]:l.height*a[1],6);
  });
 }
});
it('does not paint an extra connector over the integrated Exploration path',()=>{const html=renderToStaticMarkup(React.createElement(NaturalTrail,{layout:explorationTrailLayout(390,600,20),mode:'exploration',locked:()=>false}));expect(html).not.toContain('<path');expect(html).not.toContain('<pattern');});

it('blends internal and chapter edges in both orientations without changing clearing positions',async()=>{
 const {default:TrailSeams}=await import('../components/TrailSeams');
 for(const vertical of [true,false]){const layout=explorationTrailLayout(vertical?390:844,vertical?600:220,20,vertical),before=JSON.stringify(layout.points),html=renderToStaticMarkup(React.createElement(TrailSeams,{layout,mode:'exploration',locked:(chapter:number)=>chapter===1}));
  expect(html.match(/class="trail-seam/g)).toHaveLength(3);expect(html).toContain(vertical?'to bottom':'to right');expect(html).toContain('is-locked');expect(JSON.stringify(layout.points)).toBe(before);
 }
});
