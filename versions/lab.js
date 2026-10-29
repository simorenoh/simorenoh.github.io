const directions = {
  original: {name:'Original', description:'The current warm editorial homepage. Our starting point.', url:'/?comparison=1'},
  editorial: {name:'Editorial', description:'Taste-guided composition. Bigger type, quiet paper surfaces, and an effects contact sheet.', source:'https://github.com/Leonxlnx/taste-skill'},
  motion: {name:'Motion', description:'A darker studio, a moving card stack, and previews that expand from their place in the gallery. Inspired by Kokonut UI.', source:'https://kokonutui.com/docs/cards/lightbox-grid'},
  spatial: {name:'Spatial', description:'A live Three.js carousel made from the public effects posters. Choose a card, then play its preview.', source:'https://r3f.docs.pmnd.rs/getting-started/examples'},
  shader: {name:'Shader', description:'An original animated GLSL backdrop, inspired by Shader Gradient. The same portfolio with a warmer, immersive stage.', source:'https://shadergradient.co/'}
};
const frame = document.querySelector('#sample');
const panel = document.querySelector('#sample-panel');
const loading = document.querySelector('#loading');
const tabs = [...document.querySelectorAll('[role=tab]')];
const select = document.querySelector('#design-select');
const positions = new Map();
let active = 'original';
let initialized = false;

function sampleUrl(id) { return directions[id].url || `/versions/sample.html?design=${id}`; }
function choose(id, {history = true} = {}) {
  if (!Object.hasOwn(directions,id)) id = 'original';
  if (initialized && active === id) return;
  if (initialized) {
    try { positions.set(active, frame.contentWindow.scrollY); } catch { /* The preview remains usable without position memory. */ }
  }
  const entry = directions[id];
  active = id;
  tabs.forEach(tab => { const selected = tab.dataset.design === id; tab.setAttribute('aria-selected',String(selected)); tab.tabIndex = selected ? 0 : -1; });
  select.value = id;
  panel.setAttribute('aria-labelledby',`tab-${id}`);
  document.querySelector('#direction-description').textContent = entry.description;
  const reference = document.querySelector('#reference');
  reference.hidden = !entry.source;
  if (entry.source) reference.href = entry.source;
  const direct = sampleUrl(id).replace('?comparison=1','');
  document.querySelector('#open-sample').href = direct;
  frame.title = `${entry.name} homepage preview`;
  loading.hidden = false;
  loading.textContent = `Opening the ${entry.name.toLowerCase()} design…`;
  // Replace the child navigation so Back follows the chosen directions once each.
  frame.contentWindow.location.replace(sampleUrl(id));
  document.title = `${entry.name} — Design lab — Simon Moreno`;
  if (history) {
    const url = new URL(location.href);
    url.searchParams.set('design',id);
    window.history.pushState({design:id},'',url);
  }
  initialized = true;
}
frame.addEventListener('load', () => {
  loading.hidden = true;
  try { frame.contentWindow.scrollTo({top:positions.get(active) || 0, behavior:'instant'}); } catch { /* Native iframe navigation still works. */ }
  document.querySelector('#announcement').textContent = `${directions[active].name} design ready.`;
});
tabs.forEach((tab,index) => {
  tab.addEventListener('click',() => choose(tab.dataset.design));
  tab.addEventListener('keydown',event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault(); tabs[next].focus(); choose(tabs[next].dataset.design);
  });
});
select.addEventListener('change',() => choose(select.value));
document.querySelectorAll('[data-width]').forEach(button => button.addEventListener('click',() => {
  document.body.dataset.width = button.dataset.width;
  document.querySelectorAll('[data-width]').forEach(item => item.setAttribute('aria-pressed',String(item === button)));
}));
window.addEventListener('popstate',() => choose(new URLSearchParams(location.search).get('design'),{history:false}));
choose(new URLSearchParams(location.search).get('design') || 'original',{history:false});
