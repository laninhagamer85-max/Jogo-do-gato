/** Authored atlas bounds: rows are not an evenly spaced grid. */
export const BASE_ART_RECTS = [
 [[24,20,332,324],[371,7,338,338],[725,5,342,344]],
 [[26,368,329,323],[374,355,340,339],[734,361,332,334]],
 [[24,712,329,336],[370,704,340,350],[727,714,342,347]],
 [[23,1062,335,353],[370,1060,346,361],[733,1064,336,367]],
] as const;
export const baseArtRect=(column:number,room:number)=>BASE_ART_RECTS[Math.min(3,Math.floor(room/10))][column as 0|1|2];
