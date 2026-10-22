(() => {
  if (!(matchMedia('(pointer: coarse)').matches || innerWidth <= 800)) return;
  const hud = document.createElement('div');
  hud.id = 'mobile-hud';
  hud.innerHTML = `
    <div id="mh-top"><div class="mh-group">
      <button class="mh-button" data-key="Escape" aria-label="Menu">☰</button>
      <button class="mh-button" data-key="KeyC" aria-label="Character">CHAR</button>
      <button class="mh-button" data-key="KeyI" aria-label="Inventory">INV</button>
      <button class="mh-button" data-key="Tab" aria-label="Map">MAP</button>
      <button class="mh-button" data-key="KeyQ" aria-label="Quest">Q</button>
    </div><div class="mh-group">
      <button class="mh-button" data-key="Enter" aria-label="Chat">CHAT</button>
      <button class="mh-button" data-key="KeyV" aria-label="Options">OPT</button>
    </div></div>
    <div id="mh-stick" role="application" aria-label="Joystick de movimento"><div id="mh-stick-knob"></div></div>
    <div id="mh-actions">
      <button class="mh-button mh-small mh-skill" data-key="Digit1">1</button>
      <button class="mh-button mh-small mh-skill" data-key="Digit2">2</button>
      <button class="mh-button mh-small mh-skill" data-key="Digit3">3</button>
      <button class="mh-button mh-small mh-skill" data-key="Digit4">4</button>
      <button class="mh-button mh-small mh-skill" data-key="Digit5">5</button>
      <button class="mh-button mh-attack" data-action="attack">ATK</button>
    </div><button id="mh-toggle" class="mh-button" aria-label="Mostrar ou ocultar controles">◀</button>`;
  document.body.appendChild(hud);
  const pressed = new Set();
  function keyEvent(code, type) {
    const key = ({Escape:'Escape',Enter:'Enter',Tab:'Tab',KeyC:'c',KeyI:'i',KeyQ:'q',KeyV:'v',
      Digit1:'1',Digit2:'2',Digit3:'3',Digit4:'4',Digit5:'5',Digit6:'6',
      KeyW:'w',KeyA:'a',KeyS:'s',KeyD:'d'})[code] || code;
    document.dispatchEvent(new KeyboardEvent(type, {key,code,bubbles:true,cancelable:true}));
  }
  function down(code) { if (!pressed.has(code)) { pressed.add(code); keyEvent(code,'keydown'); } }
  function up(code) { if (pressed.has(code)) { pressed.delete(code); keyEvent(code,'keyup'); } }
  const releaseAll = () => [...pressed].forEach(up);
  document.addEventListener('visibilitychange', () => { if (document.hidden) releaseAll(); });
  window.addEventListener('blur', releaseAll);
  hud.querySelectorAll('[data-key]').forEach(btn => {
    const code = btn.dataset.key;
    btn.addEventListener('pointerdown', e => { e.preventDefault(); btn.setPointerCapture?.(e.pointerId); btn.classList.add('active'); down(code); });
    ['pointerup','pointercancel','lostpointercapture'].forEach(ev => btn.addEventListener(ev, e => { e.preventDefault(); btn.classList.remove('active'); up(code); }));
    btn.addEventListener('contextmenu', e => e.preventDefault());
  });
  const canvas = document.querySelector('.game-canvas');
  const attack = hud.querySelector('[data-action="attack"]');
  function attackEvent(type, e) {
    if (!canvas) return;
    const r=canvas.getBoundingClientRect(), x=r.left+r.width*.68, y=r.top+r.height*.72;
    const init={bubbles:true,cancelable:true,clientX:x,clientY:y,button:2,buttons:type==='pointerup'?0:2,pointerId:e.pointerId||1,pointerType:'touch',isPrimary:true};
    try { canvas.dispatchEvent(new PointerEvent(type,init)); } catch {}
    if(type==='pointerup') canvas.dispatchEvent(new MouseEvent('mouseup',{...init,button:2,buttons:0}));
  }
  attack.addEventListener('pointerdown',e=>{e.preventDefault();attack.setPointerCapture?.(e.pointerId);attack.classList.add('active');attackEvent('pointerdown',e);});
  ['pointerup','pointercancel','lostpointercapture'].forEach(ev=>attack.addEventListener(ev,e=>{e.preventDefault();attack.classList.remove('active');attackEvent('pointerup',e);}));
  const stick=hud.querySelector('#mh-stick'), knob=hud.querySelector('#mh-stick-knob');
  let stickId=null;
  function updateStick(e){
    const r=stick.getBoundingClientRect(), max=r.width*.34; let dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);
    const len=Math.hypot(dx,dy)||1;if(len>max){dx=dx/len*max;dy=dy/len*max;}
    knob.style.left='calc(50% + '+dx+'px)';knob.style.top='calc(50% + '+dy+'px)';
    const t=15, dirs={KeyW:dy < -t,KeyS:dy > t,KeyA:dx < -t,KeyD:dx > t};
    Object.entries(dirs).forEach(([code,on])=>on?down(code):up(code));
  }
  stick.addEventListener('pointerdown',e=>{e.preventDefault();stickId=e.pointerId;stick.setPointerCapture?.(stickId);updateStick(e);});
  stick.addEventListener('pointermove',e=>{if(e.pointerId===stickId){e.preventDefault();updateStick(e);}});
  function resetStick(){stickId=null;knob.style.left='50%';knob.style.top='50%';['KeyW','KeyA','KeyS','KeyD'].forEach(up);}
  ['pointerup','pointercancel','lostpointercapture'].forEach(ev=>stick.addEventListener(ev,e=>{if(e.pointerId===stickId)resetStick();}));
  hud.querySelector('#mh-toggle').addEventListener('click',()=>{hud.classList.toggle('mh-hidden');hud.querySelector('#mh-toggle').textContent=hud.classList.contains('mh-hidden')?'☰':'◀';});
  document.documentElement.classList.add('mobile-touch-enabled');
})();