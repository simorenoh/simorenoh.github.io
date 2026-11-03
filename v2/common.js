(() => {
  'use strict';
  const dialog = document.querySelector('#effect-viewer');
  const content = document.querySelector('#effect-content');
  let trigger;
  let request = 0;
  let catalog = [];
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }
  const ready = fetch('/effects.json').then(response => {
    if (!response.ok) throw new Error('The effects catalog could not be loaded.');
    return response.json();
  }).then(data => {
    catalog = data;
    document.querySelectorAll('[data-catalog-count]').forEach(node => {node.textContent = String(data.length);});
    return data;
  });
  ready.catch(() => {
    document.querySelectorAll('.catalog-state').forEach(node => {node.textContent = 'Preview data is unavailable. Reload to try again.';});
  });
  async function openEffect(id, button) {
    trigger = button;
    const token = ++request;
    content.replaceChildren(element('p', 'viewer-error', 'Opening the effect…'));
    document.querySelector('#effect-title').textContent = 'Effect preview';
    dialog.showModal();
    try {
      await ready;
      if (!dialog.open || token !== request) return;
      const effect = catalog.find(item => item.id === id);
      if (!effect) throw new Error('This effect is unavailable.');
      document.querySelector('#effect-title').textContent = effect.name;
      const layout = element('div', 'viewer-layout');
      const media = element('div', 'viewer-media');
      const video = element('video');
      video.controls = true; video.playsInline = true; video.muted = true; video.preload = 'metadata';
      video.poster = `/media/effects/${effect.id}.jpg`;
      video.src = `/media/effects/${effect.id}.mp4`;
      video.addEventListener('error', () => {
        media.replaceChildren(element('p','viewer-error','The preview could not load. The prompt is still available.'));
      });
      media.append(video);
      const info = element('div','viewer-info');
      info.append(element('p','mono',`${effect.group} · ${effect.dur.toFixed(1)} sec`), element('p','',effect.use));
      info.append(element('p','viewer-credit',effect.credit ? `Visual inspiration: ${effect.credit}. Implementation: Simon’s editing engine.` : 'From Simon’s editing experiments. Implementation: his own editing engine.'));
      const details = element('details');
      const prompt = element('pre','',effect.prompt || 'No recreate prompt is available.');
      const copy = element('button','copy-prompt','Copy prompt'); copy.type = 'button';
      const status = element('p','viewer-credit');status.setAttribute('role','status');
      copy.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(effect.prompt); status.textContent = 'Prompt copied.'; }
        catch { const range = document.createRange();range.selectNodeContents(prompt); const selection = getSelection();selection.removeAllRanges();selection.addRange(range);status.textContent = 'Prompt selected. Use your device’s Copy command.'; }
      });
      details.append(element('summary','','Prompt to recreate it'), element('p','','This is a build brief for a coding agent. The prompt describes the setup, assets and timing it needs.'),prompt,copy,status);
      info.append(details);layout.append(media,info);content.replaceChildren(layout);
      // Playback is an explicit second action, keeping the initial comparison quiet.
    } catch(error) {content.replaceChildren(element('p','viewer-error',error.message));}
  }
  document.addEventListener('click',event => {
    const button = event.target.closest('[data-effect]');
    if (button) openEffect(button.dataset.effect,button);
  });
  document.querySelector('#close-effect').addEventListener('click',() => dialog.close());
  dialog.addEventListener('click',event => {if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',() => {
    request++;
    const video=content.querySelector('video');if(video){video.pause();video.removeAttribute('src');video.load();}
    content.replaceChildren();if(trigger?.isConnected)trigger.focus();
  });

  const grid=document.querySelector('#library-grid');
  if(grid){
    const search=document.querySelector('#library-search'), category=document.querySelector('#library-category'), more=document.querySelector('#library-more');
    let limit=24;
    function render(){
      const query=search.value.trim().toLowerCase();
      const matches=catalog.filter(e=>(category.value==='all'||e.group===category.value)&&[e.name,e.use,e.prompt,e.credit].join(' ').toLowerCase().includes(query));
      grid.replaceChildren();
      matches.slice(0,limit).forEach(effect=>{
        const card=element('article','library-card');const button=element('button','effect-trigger');button.dataset.effect=effect.id;button.setAttribute('aria-label',`Open ${effect.name} preview`);
        const image=element('img');image.src=`/media/effects/${effect.id}.jpg`;image.alt=`${effect.name} preview`;image.loading='lazy';image.width=360;image.height=640;
        const play=element('span','','▶');play.setAttribute('aria-hidden','true');button.append(image,play);
        card.append(button,element('h2','',effect.name),element('p','',`${effect.group} · ${effect.dur.toFixed(1)} sec`));grid.append(card);
      });
      if(!matches.length)grid.append(element('p','library-empty','No experiments found. Try another word or collection.'));
      document.querySelector('#library-results').textContent=`${matches.length} experiments · ${Math.min(limit,matches.length)} shown`;
      more.hidden=limit>=matches.length;
    }
    search.addEventListener('input',()=>{limit=24;render();});category.addEventListener('change',()=>{limit=24;render();});
    more.addEventListener('click',()=>{limit+=24;render();});
    ready.then(()=>{[...new Set(catalog.map(e=>e.group))].sort().forEach(group=>{const option=element('option','',group);option.value=group;category.append(option);});render();}).catch(()=>{document.querySelector('#library-results').textContent='The collection could not load. Refresh to try again.';});
  }

  const rail = document.querySelector('#cinema-rail');
  if (rail) {
    const cards=[...rail.querySelectorAll('[data-scene]')];
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const motion=document.querySelector('#scene-motion');
    const count=cards.length;
    const wrap=value=>((value%count)+count)%count;
    let phase=2, selected=-1, rotating=!reduced.matches, inView=true, lastTime=null, tween=null, frame;
    document.querySelector('#scene-total').textContent=String(count).padStart(2,'0');
    function updateMotion(){motion.textContent=rotating?'Pause rotation':'Resume rotation';motion.setAttribute('aria-pressed',String(rotating));}
    function paint(){
      const nearest=wrap(Math.round(phase));
      cards.forEach((card,i)=>{
        // A single fractional phase drives every card, including both visible edges.
        // Recycling occurs half a complete collection away, outside the clipped viewport.
        const offset=wrap(i-phase+count/2)-count/2;
        card.style.setProperty('--offset',offset.toFixed(5));
        card.setAttribute('aria-pressed',String(i===nearest));card.tabIndex=i===nearest?0:-1;
      });
      if(nearest!==selected){
        selected=nearest;const card=cards[selected];
        document.querySelector('#scene-name').textContent=card.dataset.name;
        document.querySelector('#scene-number').textContent=String(selected+1).padStart(2,'0');
        document.querySelector('#scene-play').dataset.effect=card.dataset.scene;
        document.querySelector('#scene-play').setAttribute('aria-label',`Open ${card.dataset.name} preview`);
      }
    }
    function choose(index){
      const delta=wrap(index-phase+count/2)-count/2;
      rotating=false;updateMotion();
      if(reduced.matches){phase+=delta;tween=null;paint();}
      else tween={from:phase,to:phase+delta,start:performance.now()};
    }
    cards.forEach((card,i)=>card.addEventListener('click',()=>choose(i)));
    document.querySelector('#scene-prev').addEventListener('click',()=>choose(Math.round(phase)-1));
    document.querySelector('#scene-next').addEventListener('click',()=>choose(Math.round(phase)+1));
    rail.addEventListener('keydown',event=>{
      if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){
        event.preventDefault();const index=event.key==='Home'?0:event.key==='End'?count-1:wrap(Math.round(phase)+(event.key==='ArrowRight'?1:-1));
        choose(index);cards[index].focus({preventScroll:true});
      }
    });
    let start=null;
    rail.addEventListener('pointerdown',event=>{if(event.pointerType!=='mouse')start=event.clientX;});
    rail.addEventListener('pointerup',event=>{if(start!==null&&Math.abs(event.clientX-start)>45)choose(Math.round(phase)+(event.clientX<start?1:-1));start=null;});
    rail.addEventListener('pointercancel',()=>{start=null;});
    motion.addEventListener('click',()=>{rotating=!rotating;tween=null;lastTime=null;updateMotion();});
    reduced.addEventListener('change',()=>{if(reduced.matches){rotating=false;tween=null;}updateMotion();});
    new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;lastTime=null;},{threshold:.2}).observe(rail);
    new ResizeObserver(()=>{
      const base=rail.clientWidth<=750?185:235;
      rail.style.setProperty('--card-step',`${Math.max(base,rail.clientWidth/(count-3))}px`);
    }).observe(rail);
    function tick(time){
      const dt=lastTime===null?0:Math.min((time-lastTime)/1000,.05);lastTime=time;
      if(!document.hidden&&inView&&!dialog.open){
        if(tween){
          const progress=Math.min(1,(time-tween.start)/650);
          const eased=1-Math.pow(1-progress,3);
          phase=tween.from+(tween.to-tween.from)*eased;
          if(progress===1)tween=null;
          paint();
        }else if(rotating){phase=wrap(phase+dt/6);paint();}
      }
      frame=requestAnimationFrame(tick);
    }
    function startLoop(){cancelAnimationFrame(frame);lastTime=null;frame=requestAnimationFrame(tick);}
    window.addEventListener('pagehide',()=>cancelAnimationFrame(frame));
    window.addEventListener('pageshow',startLoop);
    paint();updateMotion();startLoop();
  }
  const choices=[...document.querySelectorAll('[data-project-choice]')];
  if(choices.length){
    let selected=0;
    function choose(index){selected=(index+choices.length)%choices.length;choices.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===selected)));document.querySelectorAll('[data-project-panel]').forEach(panel=>{panel.hidden=panel.dataset.projectPanel!==choices[selected].dataset.projectChoice;});document.querySelector('#deck-count').textContent=`0${selected+1} / 03`;}
    choices.forEach((button,i)=>button.addEventListener('click',()=>choose(i)));
    document.querySelector('#next-project').addEventListener('click',()=>choose(selected+1));choose(0);
  }
})();
