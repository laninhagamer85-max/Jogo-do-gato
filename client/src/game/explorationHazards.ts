import type {CampaignHazard} from './explorationCampaign';
/** Fixed active-play clock: pause/save retain exactly the same hazard phase. */
export function hazardPhase(h:CampaignHazard,time:number):'safe'|'warning'|'active'{
 const phase=((time+h.offset)%h.period+h.period)%h.period;
 return phase<h.activeMs?'active':phase>=h.period-1000?'warning':'safe';
}
