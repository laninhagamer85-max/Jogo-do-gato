type Caption={x:number;y:number;name:string;activity:string;showName:boolean;news:boolean;chat?:string;warrior:boolean;windup:boolean};
/** One caption stack per citizen. Speech sits above it, never at the name baseline. */
export function villageLabelLines(c:Pick<Caption,'name'|'activity'|'news'|'windup'>){return c.news?[c.name,'Novidade · toque para conversar']:c.windup?[`${c.name} · ${c.activity}`,'Preparando golpe · afaste-se']:[`${c.name} · ${c.activity}`];}
export function drawVillageLabels(ctx:CanvasRenderingContext2D,c:Caption){
 const lineHeight=14,labels=c.showName?villageLabelLines(c):[];ctx.save();ctx.textAlign='center';ctx.font='600 11px sans-serif';ctx.strokeStyle='#20372c';ctx.lineWidth=3;ctx.fillStyle=c.warrior?'#ffe1a4':'#e8f4d0';
 labels.forEach((line,i)=>{const y=c.y-(labels.length-1-i)*lineHeight;ctx.strokeText(line,c.x,y);ctx.fillText(line,c.x,y);});
 if(c.chat){const lines:string[]=[];let line='';for(const word of c.chat.split(' ')){if(line&&(line+' '+word).length>26){lines.push(line);line=word;}else line=line?line+' '+word:word;}if(line)lines.push(line);const h=lines.length*13+12,w=Math.min(168,Math.max(100,...lines.map(t=>t.length*5.7))),bottom=c.y-labels.length*lineHeight-8,top=bottom-h;ctx.font='11px sans-serif';ctx.fillStyle='#17352bd9';ctx.beginPath();ctx.roundRect(c.x-w/2,top,w,h,8);ctx.fill();ctx.strokeStyle='#d8cb9d88';ctx.lineWidth=1;ctx.stroke();ctx.fillStyle='#fff2cf';lines.forEach((t,i)=>ctx.fillText(t,c.x,top+16+i*13));}
 ctx.restore();
}
