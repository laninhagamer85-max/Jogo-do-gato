/** One-time move of the former room 32 to room 40; permanent economy is untouched. */
export function migrateChapter4Expansion(raw:Record<string,unknown>):Record<string,unknown>{
 if(!Object.keys(raw).length||Number(raw.campaignVersion??1)>=17)return raw;
 const roomFields=new Set(['roomIndex','portalTarget','room','destination','dayRoom']);
 const roomArrays=new Set(['completedRooms','claimedRooms','visitedRooms']);
 const roomMaps=new Set(['roomVisits','roomStars','roomAttempts','layouts']);
 const id=(value:string)=>value.replace(/\br31:/g,'r39:').replace(/\bm31:/g,'m39:').replace(/\bg31:/g,'g39:').replace(/spring-31-/g,'spring-39-').replace(/^31:([0-9]):(wood|erva)$/,'39:$1:$2');
 const visit=(value:unknown,key='',depth=0):unknown=>{
  if(depth>16)return value;
  if(typeof value==='number')return value===31&&(roomFields.has(key)||roomArrays.has(key))?39:value;
  if(typeof value==='string')return id(value);
  if(Array.isArray(value))return value.map(v=>visit(v,key,depth+1));
  if(!value||typeof value!=='object')return value;
  const source=value as Record<string,unknown>,out:Record<string,unknown>={};
  for(const [k,v] of Object.entries(source)){
   const nextKey=roomMaps.has(key)&&k==='31'?'39':id(k);
   if(key==='roomAttempts'&&typeof v==='string'){
    try{const attempt=JSON.parse(v);out[nextKey]=JSON.stringify(visit(attempt,'',depth+1));}catch{out[nextKey]=v;}
   }else out[nextKey]=visit(v,k,depth+1);
  }
  if(typeof source.roomIndex==='number'){
   out.campaignVersion=17;
   if(source.roomIndex===30&&source.portalTarget===31)out.portalTarget=31;
   if(source.roomIndex===31&&source.portalTarget===30)out.portalTarget=38;
  }
  return out;
 };
 return {...visit(raw) as Record<string,unknown>,campaignVersion:17};
}
