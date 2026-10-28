const dialog = document.querySelector('#viewer');
const body = document.querySelector('#viewer-body');
const allPage = document.body.dataset.library === 'all';
const featured = ['profile-card','split-canvas','paper-collage','orbit','behind-title','reel-cascade','pixel-shelf','before-after'];
let effects = [];
let activeFilter = 'all';
let expanded = allPage;
let lastTrigger;
let hoverPreview = null;
const hoverPointer = window.matchMedia('(any-hover: hover) and (any-pointer: fine)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function stopHoverPreview() {
  const previous = hoverPreview;
  hoverPreview = null;
  if (!previous) return;
  window.clearTimeout(previous.timer);
  previous.button.classList.remove('is-previewing');
  if (previous.video) {
    previous.video.pause();
    previous.video.removeAttribute('src');
    previous.video.load();
    previous.video.remove();
  }
}

function enableHoverPreview(button, effect) {
  button.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse' || !hoverPointer.matches || reducedMotion.matches || dialog.open) return;
    stopHoverPreview();
    const state = {button, video: null, timer: null};
    hoverPreview = state;
    state.timer = window.setTimeout(() => {
      if (hoverPreview !== state || !button.isConnected) return;
      const video = el('video', 'hover-preview');
      state.video = video;
      video.muted = true;
      video.defaultMuted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'none';
      video.tabIndex = -1;
      video.setAttribute('aria-hidden', 'true');
      video.src = `/media/effects/${effect.id}.mp4`;
      video.addEventListener('playing', () => {
        if (hoverPreview === state) button.classList.add('is-previewing');
      });
      video.addEventListener('error', () => {
        if (hoverPreview === state) stopHoverPreview();
      });
      button.append(video);
      video.play().catch(() => {
        if (hoverPreview === state) stopHoverPreview();
      });
    }, 120);
  });
  button.addEventListener('pointerleave', () => {
    if (hoverPreview?.button === button) stopHoverPreview();
  });
}

window.addEventListener('scroll', stopHoverPreview, {passive: true, capture: true});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopHoverPreview();
});
window.addEventListener('blur', stopHoverPreview);
reducedMotion.addEventListener('change', stopHoverPreview);
hoverPointer.addEventListener('change', stopHoverPreview);

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function openViewer(title, trigger) {
  stopHoverPreview();
  lastTrigger = trigger;
  document.querySelector('#viewer-title').textContent = title;
  body.replaceChildren();
  document.body.classList.add('modal-open');
  dialog.showModal();
}

function playEffect(id, trigger) {
  const effect = effects.find(item => item.id === id);
  if (!effect) return;
  openViewer(effect.name, trigger);
  const video = el('video', 'dialog-video');
  video.controls = true;
  video.playsInline = true;
  video.preload = 'metadata';
  video.loop = true;
  video.muted = true;
  video.src = `/media/effects/${effect.id}.mp4`;
  video.poster = `/media/effects/${effect.id}.jpg`;
  const note = el('p','dialog-note', `${effect.use}${effect.credit ? ` Visual inspiration: ${effect.credit}.` : ' From my editing experiments.'} Implementation: my own editing engine.`);
  video.addEventListener('error', () => { note.textContent = 'This preview could not load. Please refresh and try again.'; });
  body.append(video, note);
  video.play().catch(() => {});
}

function showProject(id, trigger) {
  const editor = id === 'editor';
  openViewer(editor ? 'The editing workflow' : 'Content HQ', trigger);
  const article = el('article','project-detail');
  article.append(el('h3','',editor ? 'A workflow, improved one video at a time.' : 'The project that grew out of making the videos.'));
  article.append(el('p','',editor ? 'My editor takes a talking-head recording through transcription, rough cuts, cutouts, captions, and a reviewable draft. I use it for my own reels and refine it as I go.' : 'I wanted a home base for making content: finding ideas, recording, editing, and learning from what I share. The working pieces today include the reel editor, effects library, and research tools. Planning and scripting are still on the roadmap.'));
  article.append(el('p','','The public effects library is a look inside the motion toolkit: reusable captions, cards, backgrounds, camera moves, and other experiments.'));
  const link = el('a','text-link','Explore the effects library ↗');
  link.href = '/effects/';
  article.append(link);
  body.append(article);
}

function renderEffects() {
  stopHoverPreview();
  const query = document.querySelector('#effect-search').value.trim().toLowerCase();
  let filtered = effects.filter(e => (activeFilter === 'all' || e.group === activeFilter) && `${e.name} ${e.use} ${e.credit || ''}`.toLowerCase().includes(query));
  if (!expanded && activeFilter === 'all' && !query) filtered = featured.map(id => effects.find(e => e.id === id)).filter(Boolean);
  const grid = document.querySelector('#effect-grid');
  grid.replaceChildren();
  if (!filtered.length) grid.append(el('p','empty','No effects found. Try another word or category.'));
  filtered.forEach(effect => {
    const card = el('article','effect-card');
    const button = el('button');
    button.dataset.effect = effect.id;
    button.setAttribute('aria-label', `Play ${effect.name}`);
    enableHoverPreview(button, effect);
    const image = el('img');
    image.src = `/media/effects/${effect.id}.jpg`;
    image.alt = `${effect.name} effect preview`;
    image.loading = 'lazy'; image.width = 360; image.height = 640;
    const play = el('span','play-circle','▶'); play.setAttribute('aria-hidden','true');
    button.append(image,el('span','effect-category',effect.group.toUpperCase()),play);
    card.append(button,el('h3','',effect.name),el('p','',`${effect.dur.toFixed(1)} SEC · ${effect.credit ? `INSPIRED BY ${effect.credit}` : 'FROM THE WORKBENCH'}`));
    grid.append(card);
  });
  document.querySelector('#results').textContent = `${filtered.length} effect${filtered.length === 1 ? '' : 's'} shown`;
  const toggle = document.querySelector('#show-all');
  toggle.hidden = allPage || activeFilter !== 'all' || Boolean(query);
  toggle.textContent = expanded ? 'Back to selected effects ↑' : `Explore all ${effects.length} effects ↗`;
  toggle.setAttribute('aria-expanded',String(expanded));
}

document.addEventListener('click', event => {
  const target = event.target.closest('[data-effect],[data-project],[data-filter]');
  if (!target) return;
  if (target.dataset.effect) playEffect(target.dataset.effect,target);
  else if (target.dataset.project) showProject(target.dataset.project,target);
  else {
    activeFilter = target.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(button => {
      const active = button === target;
      button.classList.toggle('active',active);
      button.setAttribute('aria-pressed',String(active));
    });
    renderEffects();
  }
});
document.querySelector('#close-viewer').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const r = dialog.getBoundingClientRect();
  if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  body.querySelectorAll('video').forEach(video => { video.pause(); video.removeAttribute('src'); video.load(); });
  body.replaceChildren();
  document.body.classList.remove('modal-open');
  if (lastTrigger?.isConnected) lastTrigger.focus({preventScroll:true});
});
document.querySelector('#effect-search').addEventListener('input',renderEffects);
document.querySelector('#show-all').addEventListener('click', () => {
  expanded = !expanded;
  renderEffects();
  if (!expanded) document.querySelector('#lab').scrollIntoView();
});
document.querySelector('#year').textContent = new Date().getFullYear();
fetch('/effects.json').then(response => {
  if (!response.ok) throw new Error('Catalog unavailable');
  return response.json();
}).then(data => {
  effects = data;
  document.querySelector('#effect-count').textContent = effects.length;
  renderEffects();
}).catch(() => {
  document.querySelector('#effect-grid').replaceChildren(el('p','empty','The effects catalog is unavailable. Please refresh to try again.'));
  document.querySelector('#show-all').hidden = true;
});
