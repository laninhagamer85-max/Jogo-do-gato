"""Interactive, local-only acceptance helper. No writes to physics, saves or completion.
Requires Python Playwright and Chromium CDP. Every command uses browser UI inputs.
Example: python3 scripts/qa-adventure-acceptance.py --output /tmp/pet-qa
Commands are JSON lines: move{x}, jump{x}, sequence{steps}, inspect, click{selector},
shot{name}, save{name}, finish. A pause between observations is an ordinary Escape.
"""
import argparse, asyncio, json, subprocess, time
from pathlib import Path
from urllib.parse import urlparse
from playwright.async_api import async_playwright

LOCATE = """()=>{const el=document.querySelector('.platform-adventure');let f=el[Object.keys(el).find(k=>k.startsWith('__reactFiber'))];while(f){if(f.type?.name==='PlatformAdventure'){let h=f.memoizedState;while(h){if(h.memoizedState?.current?.getAutoPilotSnapshot){window.__qaObservedEngine=h.memoizedState.current;return}h=h.next}}f=f.return}throw Error('QA engine missing')}"""
READ = """()=>{const e=window.__qaObservedEngine;let state=null;const el=document.querySelector('.platform-adventure');let f=el?.[Object.keys(el).find(k=>k.startsWith('__reactFiber'))];while(f){if(f.type?.name==='Review'){state=f.memoizedState.memoizedState;break}f=f.return}return {engine:e?{...e.getAutoPilotSnapshot(),vx:e.player.vx,vy:e.player.vy,input:{...e.input},jumpLatched:e.jumpLatched,invulnerableFor:e.invulnerableFor,elapsed:e.elapsed,paused:e.paused,running:e.running,coins:e.coinsCollected,items:e.worldItemsCollected,cameraX:e.cameraX,checkpoint:e.checkpointReached}:null,state,dialog:document.querySelector('.pa-game-overlay')?.innerText??null,won:!!document.querySelector('.pa-game-overlay.won'),failed:!!document.querySelector('.pa-game-overlay.failed'),stage:document.querySelector('.pa-playfield')?.getAttribute('aria-label'),storage:{local:Object.keys(localStorage),session:Object.keys(sessionStorage)}}}"""

async def main(args):
    if urlparse(args.url).hostname not in ('localhost', '127.0.0.1', '::1'):
        raise ValueError('This memory-only QA helper must not target a public site')
    commit=subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()
    out=Path(args.output).resolve();out.mkdir(parents=True,exist_ok=True)
    async with async_playwright() as p:
        browser=await p.chromium.connect_over_cdp(args.cdp)
        context=await browser.new_context(viewport={'width':480,'height':980},has_touch=True,record_video_dir=str(out/'raw-video'),record_video_size={'width':480,'height':980})
        await context.route('**/*',lambda r:r.continue_() if r.request.url.startswith(args.url) else r.abort())
        page=await context.new_page();errors=[];requests=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
        page.on('request',lambda r:requests.append({'method':r.method,'url':r.url}))
        await page.goto(args.url+'/qa-review.html');await page.select_option('select',args.size);frame=page.frames[1]
        await frame.locator('.pa-entry-play').wait_for(state='visible')
        initial=await frame.evaluate(READ)
        assert initial['state'] is not None, 'Initial memory state must be observed before play'
        await page.locator('iframe').screenshot(path=str(out/'entry-initial.png'))
        await frame.locator('.pa-entry-play').click();await frame.locator('canvas').click(position={'x':8,'y':8});await frame.evaluate(LOCATE)
        await frame.evaluate("""()=>{window.__qaTrace=[];window.__qaStart=performance.now();window.__qaSample=setInterval(()=>{const e=window.__qaObservedEngine;if(!e)return;const last=window.__qaTrace.at(-1);if((e.paused||!e.running)&&last?.paused===e.paused&&last?.running===e.running)return;window.__qaTrace.push({wallMs:performance.now()-window.__qaStart,elapsed:e.elapsed,x:e.player.x,y:e.player.y,vx:e.player.vx,vy:e.player.vy,grounded:e.player.grounded,hearts:e.hearts,coins:e.coinsCollected,items:e.worldItemsCollected,checkpoint:e.checkpointReached,cameraX:e.cameraX,input:{...e.input},jumpLatched:e.jumpLatched,invulnerableFor:e.invulnerableFor,paused:e.paused,running:e.running,enemies:e.getAutoPilotSnapshot().enemies})},20)}""")
        commands=[];started=time.monotonic()
        async def snapshot():return await frame.evaluate(READ)
        async def action(cmd):
            kind=cmd['action'];before=await snapshot()
            if kind=='sequence':
                for step in cmd['steps']:await action(step)
                return
            if kind=='resume':
                assert before['engine']['paused'];await page.keyboard.press('Escape')
                await frame.wait_for_function('()=>!__qaObservedEngine.paused')
            elif kind=='pause':
                assert not before['engine']['paused'];await page.keyboard.press('Escape')
                await frame.wait_for_function('()=>__qaObservedEngine.paused')
            elif kind in ['move','jump']:
                e=before['engine'];assert e['running'] and not e['paused']
                if kind=='jump':
                    assert e['grounded'],'Jump must start while grounded'
                    await page.keyboard.down('Space')
                direction='ArrowRight' if cmd['x']>e['x'] else 'ArrowLeft'
                await page.keyboard.down(direction);jump_start=time.monotonic();deadline=jump_start+4
                while time.monotonic()<deadline:
                    s=(await snapshot())['engine']
                    if not s['running'] or s['hearts']<e['hearts']:break
                    if (direction=='ArrowRight' and s['x']>=cmd['x']) or (direction=='ArrowLeft' and s['x']<=cmd['x']):break
                    await page.wait_for_timeout(20)
                await page.keyboard.up(direction)
                if kind=='jump':
                    await page.wait_for_timeout(max(0,370-(time.monotonic()-jump_start)*1000));await page.keyboard.up('Space')
                    await frame.wait_for_function('()=>__qaObservedEngine.player.grounded||!__qaObservedEngine.running',timeout=2500)
                after=await snapshot()
                if after['engine']['hearts']<e['hearts']:print('DAMAGE '+json.dumps({'before':e['x'],'after':after['engine']['x'],'hearts':after['engine']['hearts']}),flush=True)
                if cmd.get('pause') and after['engine']['running']:await action({'action':'pause'})
            elif kind=='click':await frame.locator(cmd['selector']).click();await page.wait_for_timeout(180)
            elif kind=='wait':await page.wait_for_timeout(cmd.get('ms',300))
            elif kind=='shot':await page.locator('iframe').screenshot(path=str(out/(cmd['name']+'.png')))
            elif kind in ['save','finish']:
                data={'sourceCommit':commit,'method':'agent-guided browser UI inputs; no autoplay, no synthetic progress, no physics writes','viewport':args.size,'initial':initial,'final':await snapshot(),'trace':await frame.evaluate('()=>__qaTrace'),'traceSampling':'20ms during active play; repeated paused/terminal samples omitted','commands':commands,'errors':errors,'requests':requests,'wallSeconds':time.monotonic()-started}
                (out/(cmd.get('name','acceptance')+'.json')).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
                await page.locator('iframe').screenshot(path=str(out/(cmd.get('name','acceptance')+'.png')))
            elif kind!='inspect':raise ValueError('Unsupported UI command')
            after=await snapshot();commands.append({'command':cmd,'atWall':time.monotonic()-started,'before':before['engine'],'beforeState':before['state'],'after':after['engine'],'afterState':after['state'],'won':after['won'],'dialog':after['dialog']})
            e=after['engine'];print(json.dumps({'action':kind,'x':e['x'] if e else None,'y':e['y'] if e else None,'vy':e['vy'] if e else None,'grounded':e['grounded'] if e else None,'support':e['currentSurface'] if e else None,'hearts':e['hearts'] if e else None,'coins':e['coins'] if e else None,'items':e['items'] if e else None,'elapsed':e['elapsed'] if e else None,'paused':e['paused'] if e else None,'won':after['won'],'dialog':after['dialog'],'progress':after['state']['platformProgress'] if after['state'] else None},ensure_ascii=False),flush=True)
        print('READY '+json.dumps({'commit':commit,'viewport':args.size,'progress':initial['state']['platformProgress']},ensure_ascii=False),flush=True)
        while True:
            line=await asyncio.to_thread(input)
            try:
                cmd=json.loads(line);await action(cmd)
                if cmd['action']=='finish':break
            except Exception as e:print('COMMAND_ERROR '+repr(e),flush=True)
            print('READY',flush=True)
        await context.close();await page.video.save_as(str(out/'conclusion-full-ui.webm'))
        print('VIDEO '+str(out/'conclusion-full-ui.webm'),flush=True)

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--cdp',default='http://localhost:9222');parser.add_argument('--url',default='http://localhost:5173');parser.add_argument('--size',default='390,844');parser.add_argument('--output',default='/tmp/pet-acceptance');asyncio.run(main(parser.parse_args()))
