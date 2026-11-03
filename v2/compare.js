(() => {
  const concepts = {
    v1:{name:'Current V1',url:'/v2/v1/',description:'The frozen starting point: the current warm editorial homepage, captured before this experiment.',intro:'The current site is held constant: original source, styles, behaviour and catalog. Approved effect media is shared.',sources:[['V1 source evidence','/v2/baseline.json','SHA-256 hashes of the four source files before snapshot path rewrites. The current live homepage and older design lab are unchanged.']],video:'Capture this first. Use the same viewport and corresponding section when showing the three new directions.'},
    fieldnotes:{name:'Fieldnotes',url:'/v2/fieldnotes.html',description:'A project journal with a publication grid, numbered chapters and an editorial reading rhythm.',intro:'From a stack of portfolio sections to a connected project journal: a quiet index, big typographic opening and annotated examples.',sources:[['Details.so / Gravelle du Parc','https://www.details.so/inspo/site/gravelleduparc-com','Observed large-scale hierarchy and connected full-width chapters. Adapted into numbered project stories, a contents index and an endpaper.'],['Impeccable / typeset','https://impeccable.style/docs/typeset/','Applied the documented distinction between display, body and supporting text. Serif headlines, readable short paragraphs and small mono annotations have separate jobs.']],video:'Show V1’s decorative hero, then Fieldnotes’ headline, chapter index and annotated effect specimens. The change is hierarchy and reading structure.'},
    cinema:{name:'Cinema',url:'/v2/cinema.html',description:'A screening room: choose a frame in a curved poster rail, then watch the effect and explore its prompt.',intro:'The work becomes the opening experience. A centred stage replaces the introduction-plus-card layout; selecting a scene updates the focused frame and its action.',sources:[['React Bits / Circular Gallery','https://reactbits.dev/components/circular-gallery','Inspected the live curved gallery and its controls. Adapted the spatial browsing idea into an original CSS rail with selection, arrows, keyboard navigation and touch swipes.'],['Godly / Griffin','https://godly.design/website/griffin/','Studied the desktop/mobile screenshots: dark negative space and deliberate display hierarchy. Adapted that restraint into a screening-room composition.'],['Transitions.dev','https://transitions.dev/','Used focused state changes and modal/panel opening as motion references. Our own transitions include an OS reduced-motion fallback.']],video:'Change scenes, open one effect and reveal its real prompt. Show that the resource changed how the visitor explores the work, as well as its appearance.'},
    playground:{name:'Playground',url:'/v2/playground.html',description:'A graphic playground: choose a rabbit hole and switch the active project on a colourful workbench.',intro:'A bold opening leads to a project selector rather than a long project list. Each choice reveals a different working example: editor, effects or typography.',sources:[['React Bits / Stack','https://reactbits.dev/components/stack','Adapted the idea of one active card over a visible deck into a project workbench. Explicit project choices and a Next button replace a drag-only interaction.'],['Transitions.dev / panel reveal','https://transitions.dev/','Project selection changes the panel with a short reveal. The action has a clear state, a visible selected label and reduced-motion support.'],['Impeccable / critique','https://impeccable.style/docs/critique/','Used its task-first review approach manually: can a visitor understand what to choose, which choice is active and what the result lets them do? No automatic score claimed.']],video:'Switch between Content HQ, Effects library and Letterforms. Compare that active workbench with V1’s static project cards. The composition and navigation model both changed.'}
  };
  const frame=document.querySelector('#concept-frame');const panel=document.querySelector('#preview-panel');
  const tabs=[...document.querySelectorAll('[data-concept]')];let active;let pageView=new URLSearchParams(location.search).get('view')==='effects'?'effects':'home';
  const viewSelect=document.querySelector('#page-view');
  const status=document.querySelector('#preview-status');
  frame.addEventListener('load',()=>{status.hidden=true;});
  function choose(id,updateHistory=true){
    if(!Object.hasOwn(concepts,id))id='fieldnotes';
    const entry=concepts[id];
    const hasLibrary=id==='v1'||id==='cinema';
    document.querySelector('#page-view-label').hidden=!hasLibrary;
    viewSelect.value=hasLibrary?pageView:'home';
    const pageUrl=hasLibrary&&pageView==='effects'?(id==='v1'?'/v2/v1/effects/':'/v2/effects/'):entry.url;
    tabs.forEach(tab=>{const selected=tab.dataset.concept===id;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;});
    panel.setAttribute('aria-labelledby',`tab-${id}`);
    document.querySelector('#concept-description').textContent=entry.description;
    document.querySelector('#resource-title').textContent=entry.name;
    document.querySelector('#resource-intro').textContent=entry.intro;
    document.querySelector('#video-evidence').textContent=entry.video;
    const list=document.querySelector('#resource-list');list.replaceChildren();
    entry.sources.forEach(([name,url,change])=>{const item=document.createElement('div');item.className='resource-item';const link=document.createElement('a');link.textContent=`${name} ↗`;link.href=url;link.target='_blank';link.rel='noopener noreferrer';const text=document.createElement('p');text.textContent=change;item.append(link,text);list.append(item);});
    document.querySelector('#clean-page').href=pageUrl;document.title=`${entry.name} — V2 experiments — Simon Moreno`;
    frame.title=`${entry.name} website concept`;
    if(active!==id||frame.dataset.view!==pageUrl){status.textContent=`Opening ${entry.name}…`;status.hidden=false;frame.contentWindow.location.replace(pageUrl);frame.dataset.view=pageUrl;active=id;}
    if(updateHistory){const url=new URL(location.href);url.searchParams.set('concept',id);url.searchParams.set('view',hasLibrary?pageView:'home');history.pushState({concept:id},'',url);}
  }
  viewSelect.addEventListener('change',()=>{pageView=viewSelect.value;choose(active);});
  tabs.forEach(tab=>tab.addEventListener('click',()=>choose(tab.dataset.concept)));
  document.querySelector('#concept-tabs').addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const index=tabs.findIndex(tab=>tab.dataset.concept===active);const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].focus();choose(tabs[next].dataset.concept);});
  function setWidth(value,updateHistory=true){panel.classList.toggle('phone',value==='phone');document.querySelectorAll('[data-width]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.width===value)));if(updateHistory){const url=new URL(location.href);url.searchParams.set('width',value);history.replaceState({concept:active},'',url);}}
  document.querySelectorAll('[data-width]').forEach(button=>button.addEventListener('click',()=>setWidth(button.dataset.width)));
  const resourceButton=document.querySelector('#show-resources');resourceButton.addEventListener('click',()=>{const expanded=resourceButton.getAttribute('aria-expanded')==='true';resourceButton.setAttribute('aria-expanded',String(!expanded));resourceButton.querySelector('span').textContent=expanded?'+':'−';document.querySelector('#resources').hidden=expanded;});
  window.addEventListener('popstate',()=>{const p=new URLSearchParams(location.search);pageView=p.get('view')==='effects'?'effects':'home';choose(p.get('concept'),false);setWidth(p.get('width')==='phone'?'phone':'desktop',false);});
  const params=new URLSearchParams(location.search);choose(params.get('concept'),false);setWidth(params.get('width')==='phone'?'phone':'desktop',false);
})();
