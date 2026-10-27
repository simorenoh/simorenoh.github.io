const reels = {
  easier: { title: 'Building my own video editor', file: 'easier.mp4', poster: 'easier-cover.jpg', note: 'An experiment from my content journey: building a video editor around the way I work.' },
  problems: { title: 'Create problems for yourself', file: 'problems.mp4', poster: 'problems-cover.jpg', note: 'A small starting point for experimenting with AI.' },
  fear: { title: 'My biggest fear', file: 'fear.mp4', poster: 'fear-cover.jpg', note: 'A personal note on starting, momentum, and reaching my potential.' }
};
const projects = {
  'content-hq': { title: 'Content HQ', subtitle: 'The project that grew out of making the videos.', paragraphs: ['I wanted a home base for making content: finding ideas, deciding what to make, recording, editing, and learning from what I share. Content HQ is my ongoing attempt to bring those pieces together.', 'The working pieces today are the reel editor, an effects browser with 125 previews, research tools, and a workflow that lets me send recordings from my phone. Planning and scripting are still on the roadmap.'], bullets: ['Python tools for rough cuts, retakes, captions, and video processing.', 'A reusable motion engine with a catalog of playable effects.', 'Storyboard and draft review before a video is finished.', 'Notion holds the content strategy, ideas, and progress.'], image: 'effects-browser.jpg', alt: 'The Content HQ effects browser', tags: ['In development', 'Personal workflow', 'Built with AI'] },
  editor: { title: 'The editing workflow', subtitle: 'A real workflow, improved one video at a time.', paragraphs: ['The editor takes a talking-head recording through transcription, rough cuts, cutouts, captions, and a reviewable draft. I use it for my own reels and refine it from the things that need fixing.', 'Motion comes from a growing library of reusable effects. A storyboard and review page help me see how the pieces fit before calling a video finished.'], bullets: ['Automatic rough cuts with pauses and retakes removed.', 'Captions tied to what was actually said.', 'Cutouts, reframing, and reusable motion effects.', 'Review and revisions are still part of the process.'], image: 'storyboard.jpg', alt: 'The storyboard review interface', tags: ['Python', 'Video processing', 'Motion design'] }
};
const dialog = document.querySelector('#viewer');
const body = document.querySelector('#viewer-body');
let lastTrigger;
let effects = [];
let activeFilter = 'all';
let expanded = false;
const featured = ['profile-card','split-canvas','paper-collage','orbit','behind-title','reel-cascade','pixel-shelf','before-after'];
function el(tag, className, text) { const node = document.createElement(tag); if (className) node.className = className; if (text) node.textContent = text; return node; }
function openViewer(title, trigger) { lastTrigger = trigger; document.querySelector('#viewer-title').textContent = title; body.replaceChildren(); document.body.classList.add('modal-open'); dialog.showModal(); }
function videoPreview(title, src, poster, note, trigger, loop = false) {
  openViewer(title, trigger);
  const video = el('video', 'dialog-video');
  video.controls = true; video.playsInline = true; video.preload = 'metadata'; video.loop = loop;
  video.src = src; video.poster = poster; video.muted = loop;
  const message = el('p', 'dialog-note', note);
  video.addEventListener('error', () => { message.textContent = 'This preview could not load. Please refresh and try again.'; });
  body.append(video, message);
  video.play().catch(() => {});
}
function playReel(id, trigger) { const r = reels[id]; if (r) videoPreview(r.title, `media/${r.file}`, `media/${r.poster}`, r.note, trigger); }
function playEffect(id, trigger) { const e = effects.find(item => item.id === id); if (e) videoPreview(e.name, `media/effects/${e.id}.mp4`, `media/effects/${e.id}.jpg`, `${e.use}${e.credit ? ` Visual inspiration: ${e.credit}.` : ' From my editing experiments.'} Implementation: my own editing engine.`, trigger, true); }
function showProject(id, trigger) {
  const p = projects[id]; if (!p) return;
  openViewer(p.title, trigger); const article = el('article', 'project-detail'); article.append(el('h3', '', p.subtitle));
  p.paragraphs.forEach(t => article.append(el('p', '', t))); const list = el('ul'); p.bullets.forEach(t => list.append(el('li', '', t))); article.append(list);
  const tags = el('div', 'tags'); p.tags.forEach(t => tags.append(el('span', '', t))); article.append(tags);
  const image = el('img'); image.src = `media/${p.image}`; image.alt = p.alt; article.append(image);
  const link = el('a','text-link','Explore the effects ↓'); link.href = '#lab'; link.addEventListener('click', () => dialog.close()); article.append(link); body.append(article);
}
function renderEffects() {
  const query = document.querySelector('#effect-search').value.trim().toLowerCase();
  let filtered = effects.filter(e => (activeFilter === 'all' || e.group === activeFilter) && `${e.name} ${e.use} ${e.credit || ''}`.toLowerCase().includes(query));
  if (!expanded && activeFilter === 'all' && !query) filtered = featured.map(id => effects.find(e => e.id === id)).filter(Boolean);
  const grid = document.querySelector('#effect-grid'); grid.replaceChildren();
  if (!filtered.length) grid.append(el('p','empty','No effects found. Try another word or category.'));
  filtered.forEach(e => {
    const card = el('article','effect-card'); const button = el('button'); button.dataset.effect = e.id; button.setAttribute('aria-label',`Play ${e.name}`);
    const image = el('img'); image.src = `media/effects/${e.id}.jpg`; image.alt = `${e.name} effect preview`; image.loading = 'lazy'; image.width = 360; image.height = 640;
    const category = el('span','effect-category',e.group.toUpperCase());
    const play = el('span','play-circle','▶'); play.setAttribute('aria-hidden','true'); button.append(image,category,play);
    card.append(button,el('h3','',e.name),el('p','',`${e.dur.toFixed(1)} SEC · ${e.credit ? `INSPIRED BY ${e.credit}` : 'FROM THE WORKBENCH'}`)); grid.append(card);
  });
  document.querySelector('#results').textContent = `${filtered.length} effects shown`;
  const toggle = document.querySelector('#show-all'); toggle.hidden = activeFilter !== 'all' || Boolean(query); toggle.textContent = expanded ? 'Back to selected effects ↑' : `Explore all ${effects.length} effects ↗`; toggle.setAttribute('aria-expanded', String(expanded));
}
document.addEventListener('click', event => {
  const target = event.target.closest('[data-play],[data-effect],[data-project],[data-image],[data-filter]'); if (!target) return;
  if (target.dataset.play) playReel(target.dataset.play,target);
  else if (target.dataset.effect) playEffect(target.dataset.effect,target);
  else if (target.dataset.project) showProject(target.dataset.project,target);
  else if (target.dataset.image) { openViewer(target.dataset.title,target); const image = el('img','dialog-image'); image.src = target.dataset.image; image.alt = target.dataset.title; body.append(image); }
  else if (target.dataset.filter) {
    activeFilter = target.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(b => { const active = b === target; b.classList.toggle('active',active); b.setAttribute('aria-pressed',String(active)); }); renderEffects();
  }
});
document.querySelector('#close-viewer').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
dialog.addEventListener('close', () => { body.querySelectorAll('video').forEach(v => { v.pause(); v.removeAttribute('src'); v.load(); }); body.replaceChildren(); document.body.classList.remove('modal-open'); if (lastTrigger?.isConnected) lastTrigger.focus({preventScroll:true}); });
document.querySelector('#effect-search').addEventListener('input',renderEffects);
document.querySelector('#show-all').addEventListener('click', () => { expanded = !expanded; renderEffects(); if (!expanded) document.querySelector('#lab').scrollIntoView(); });
document.querySelector('#year').textContent = new Date().getFullYear();
fetch('effects.json').then(r => { if (!r.ok) throw new Error('catalog'); return r.json(); }).then(data => { effects = data; document.querySelector('#effect-count').textContent = effects.length; renderEffects(); }).catch(() => { document.querySelector('#effect-grid').replaceChildren(el('p','empty','The effects catalog is unavailable. Please refresh to try again.')); document.querySelector('#show-all').hidden = true; });
