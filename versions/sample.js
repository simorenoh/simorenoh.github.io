(() => {
  const variants = ['editorial','motion','spatial','shader'];
  const requested = new URLSearchParams(location.search).get('design');
  const design = variants.includes(requested) ? requested : 'editorial';
  document.body.dataset.design = design;
  document.title = `Simon Moreno — ${design[0].toUpperCase() + design.slice(1)} study`;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const stage = document.querySelector('#stage');
  const choices = [
    {id:'profile-card',name:'Profile card'},
    {id:'paper-collage',name:'Paper collage'},
    {id:'orbit',name:'Photo orbit'},
    {id:'behind-title',name:'Title behind the head'}
  ];
  let selected = 0;
  let sceneController;
  function setChoice(index) {
    selected = (index + choices.length) % choices.length;
    const choice = choices[selected];
    const poster = document.querySelector('#hero-poster');
    poster.src = `/media/effects/${choice.id}.jpg`;
    poster.alt = `${choice.name} effect`;
    document.querySelector('#poster-button').dataset.effect = choice.id;
    document.querySelector('#poster-button').setAttribute('aria-label',`Play ${choice.name}`);
    document.querySelector('#hero-play').dataset.effect = choice.id;
    document.querySelector('#stage-title').textContent = choice.name;
    document.querySelector('#stage-index').textContent = `${selected + 1} / ${choices.length}`;
    sceneController?.select(selected);
    if (!reduced.matches && design !== 'spatial') {
      poster.animate([{opacity:.5,transform:'scale(.96)'},{opacity:1,transform:'scale(1)'}],{duration:350,easing:'ease-out'});
    }
  }
  document.querySelector('#previous-effect').addEventListener('click',() => setChoice(selected - 1));
  document.querySelector('#next-effect').addEventListener('click',() => setChoice(selected + 1));

  // Content stays visible without motion support or JavaScript. Animate only on entry.
  const reveal = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      reveal.unobserve(entry.target);
      if (!reduced.matches) entry.target.animate([
        {opacity:.25,transform:`translateY(${entry.target.tagName === 'A' ? 8 : 22}px)`}, {opacity:1,transform:'translateY(0)'}
      ],{duration:650,delay:Number(entry.target.dataset.delay || 0),easing:'cubic-bezier(.2,.8,.2,1)'});
    });
  },{threshold:.12});
  document.querySelectorAll('.hero-copy h1,.hero-copy>p,.hero-copy>.action,.stage,.section-intro>*,.project-copy,.contact-sheet,.project-notes>article,.about>*').forEach((node,index) => {
    node.dataset.delay = String((index % 3) * 65); reveal.observe(node);
  });

  // Original card-to-dialog transition, inspired by the Lightbox Grid interaction.
  // Only an image clone moves; the native dialog keeps focus, Escape, and video controls.
  const dialog = document.querySelector('#viewer');
  let openingRect;
  let openingPoster;
  let floating;
  let transitionToken = 0;
  const activeAnimations = new Set();
  function cleanupTransition() { activeAnimations.forEach(animation => animation.cancel()); activeAnimations.clear(); floating?.remove(); floating = null; }
  function fly(from,to,src) {
    if (!from?.width || !to?.width || reduced.matches || design !== 'motion') return;
    cleanupTransition();
    const clone = document.createElement('img');
    clone.src = src; clone.alt = ''; clone.setAttribute('aria-hidden','true');
    Object.assign(clone.style,{position:'fixed',left:`${from.left}px`,top:`${from.top}px`,width:`${from.width}px`,height:`${from.height}px`,objectFit:'cover',zIndex:50,pointerEvents:'none',borderRadius:'12px'});
    // Popovers paint above a modal dialog; the clone cannot intercept input.
    clone.setAttribute('popover','manual');
    clone.style.margin = '0'; clone.style.padding = '0'; clone.style.border = '0';
    document.body.append(clone);
    if (!clone.showPopover) { clone.remove(); return; }
    try { clone.showPopover(); } catch { clone.remove(); return; }
    floating = clone;
    const animation = clone.animate([
      {transform:'translate(0,0) scale(1,1)',opacity:1},
      {transform:`translate(${to.left-from.left}px,${to.top-from.top}px) scale(${to.width/from.width},${to.height/from.height})`,opacity:0}
    ],{duration:480,easing:'cubic-bezier(.2,.8,.2,1)',transformOrigin:'top left'});
    clone.style.transformOrigin = 'top left';
    activeAnimations.add(animation);
    animation.finished.catch(() => {}).finally(() => {activeAnimations.delete(animation);clone.remove();if(floating===clone)floating=null;});
  }
  document.addEventListener('click',event => {
    const trigger = event.target.closest('[data-effect]');
    if (!trigger) return;
    const image = trigger.querySelector('img');
    openingRect = image?.getBoundingClientRect();
    openingPoster = image?.currentSrc;
    const token = ++transitionToken;
    requestAnimationFrame(() => {
      const video = dialog.querySelector('video');
      if (!dialog.open || !video || !openingPoster || token !== transitionToken) return;
      const move = () => {if (dialog.open && token === transitionToken) fly(openingRect,video.getBoundingClientRect(),openingPoster);};
      if (video.readyState >= 1) move(); else video.addEventListener('loadedmetadata',move,{once:true});
    });
  },true);
  dialog.addEventListener('close',() => { transitionToken++; cleanupTransition(); });
  reduced.addEventListener('change',() => {cleanupTransition(); if(reduced.matches)document.getAnimations().forEach(animation=>animation.cancel());});

  async function startScene() {
    if (!['spatial','shader'].includes(design)) return;
    const note = document.querySelector('#render-note');
    note.hidden = true;
    let controller;
    let disposed = false;
    const fallback = () => {
      stage.classList.remove('has-webgl');
      note.hidden = false;
      note.textContent = 'Showing still previews. All effects remain playable.';
      controller?.dispose();
    };
    window.addEventListener('pagehide',() => {disposed=true;controller?.dispose();},{once:true});
    try {
      // A pinned library dependency; no third-party skill/component implementation is copied.
      const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js');
      if (disposed) return;
      const mount = document.querySelector('#stage-canvas');
      const renderer = new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
      renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
      renderer.setClearColor(0x000000,0);
      mount.append(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(36,1,.1,100);
      camera.position.z = 7;
      const objects = [];
      const textures = [];
      let target = 0;
      let rotation = 0;
      let pointer = 0;
      let visible = true;
      let raf = 0;
      let lastDraw = 0;
      let start = performance.now();
      let alive = true;
      let uniforms;
      const group = new THREE.Group();
      scene.add(group);
      if (design === 'spatial') {
        const loader = new THREE.TextureLoader();
        const loaded = await Promise.all(choices.map(choice => loader.loadAsync(`/media/effects/${choice.id}.jpg`)));
        if (disposed) {loaded.forEach(texture=>texture.dispose());renderer.dispose();renderer.domElement.remove();return;}
        loaded.forEach((texture,index) => {
          texture.colorSpace = THREE.SRGBColorSpace; textures.push(texture);
          const material = new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide});
          const card = new THREE.Mesh(new THREE.PlaneGeometry(1.8,3.2),material);
          const angle = index / choices.length * Math.PI * 2;
          card.position.set(Math.sin(angle)*2.05,0,Math.cos(angle)*2.05-1.25);
          card.rotation.y = -Math.sin(angle)*.32;
          card.userData.index = index;
          card.userData.angle = angle;
          group.add(card); objects.push(card);
        });
      } else {
        camera.position.z = 1;
        uniforms = {uTime:{value:0},uAspect:{value:1}};
        const shader = new THREE.ShaderMaterial({uniforms,depthTest:false,vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`
          precision mediump float;
          varying vec2 vUv;
          uniform float uTime;
          uniform float uAspect;
          void main(){
            vec2 p=vUv; p.x*=uAspect;
            float t=uTime*.12;
            float flow=sin(p.x*2.8+t+sin(p.y*3.4-t))*.5+.5;
            float fold=sin(p.y*3.5+t*.7+cos(p.x*2.4-t))*.5+.5;
            vec3 sand=vec3(.94,.80,.62);
            vec3 clay=vec3(.76,.43,.29);
            vec3 pale=vec3(.98,.90,.74);
            vec3 color=mix(sand,clay,smoothstep(.15,.95,flow)*.72);
            color=mix(color,pale,smoothstep(.25,.95,fold)*.8);
            float grain=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);
            gl_FragColor=vec4(color+(grain-.5)*.035,1.);
          }`});
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2,2),shader);
        scene.add(mesh); objects.push(mesh);
      }
      const resize = () => {
        if (!alive) return;
        const rect = mount.getBoundingClientRect();
        renderer.setSize(rect.width,rect.height,false);
        camera.aspect=rect.width/rect.height; camera.updateProjectionMatrix();
        if (uniforms) uniforms.uAspect.value = camera.aspect;
        renderOnce();
      };
      const renderOnce = () => {
        if(!alive) return;
        group.rotation.y = reduced.matches ? target : rotation;
        group.rotation.x = reduced.matches ? 0 : pointer * .1;
        if (design === 'spatial') objects.forEach(card => {
          const angle = card.userData.angle + group.rotation.y;
          card.rotation.y = -group.rotation.y - Math.sin(angle)*.32;
          card.visible = Math.cos(angle) > -.72;
        });
        renderer.render(scene,camera);
      };
      const tick = now => {
        raf = 0;
        if(!alive || !visible || document.hidden || reduced.matches) return;
        if(now-lastDraw > 32) {
          lastDraw=now;
          rotation += (target + pointer*.13 - rotation)*.075;
          if(uniforms)uniforms.uTime.value=(now-start)/1000;
          renderOnce();
        }
        raf=requestAnimationFrame(tick);
      };
      const refresh = () => {
        if(raf)cancelAnimationFrame(raf); raf=0;
        renderOnce();
        if(alive && visible && !document.hidden && !reduced.matches)raf=requestAnimationFrame(tick);
      };
      const observer = new ResizeObserver(resize); observer.observe(mount);
      const intersection = new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;refresh();}); intersection.observe(stage);
      const onPointer = event => {const box=mount.getBoundingClientRect();pointer=(event.clientX-box.left)/box.width-.5;};
      const resetPointer = () => {pointer=0;};
      const onClick = event => {
        if(design!=='spatial')return;
        const box=mount.getBoundingClientRect();
        const ray=new THREE.Raycaster();
        ray.setFromCamera(new THREE.Vector2((event.clientX-box.left)/box.width*2-1,-(event.clientY-box.top)/box.height*2+1),camera);
        const hit=ray.intersectObjects(objects)[0];
        if(hit)setChoice(hit.object.userData.index);
      };
      mount.addEventListener('pointermove',onPointer); mount.addEventListener('pointerleave',resetPointer); mount.addEventListener('click',onClick);
      document.addEventListener('visibilitychange',refresh); reduced.addEventListener('change',refresh);
      renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();fallback();},{once:true});
      controller = {
        select(index) {
          const destination=-index/choices.length*Math.PI*2;
          target=rotation+Math.atan2(Math.sin(destination-rotation),Math.cos(destination-rotation));
          refresh();
        },
        dispose() {
          if(!alive)return; alive=false;
          cancelAnimationFrame(raf); observer.disconnect(); intersection.disconnect();
          document.removeEventListener('visibilitychange',refresh); reduced.removeEventListener('change',refresh);
          mount.removeEventListener('pointermove',onPointer);mount.removeEventListener('pointerleave',resetPointer);mount.removeEventListener('click',onClick);
          objects.forEach(object=>{object.geometry.dispose();object.material.dispose();}); textures.forEach(texture=>texture.dispose());
          renderer.dispose(); renderer.domElement.remove();
        }
      };
      sceneController=controller;
      controller.select(selected);
      stage.classList.add('has-webgl');
      resize();refresh();
    } catch { fallback(); }
  }
  startScene();
  window.addEventListener('pageshow',event => {
    if (!event.persisted) return;
    stage.classList.remove('has-webgl');
    sceneController = null;
    startScene();
  });
})();
