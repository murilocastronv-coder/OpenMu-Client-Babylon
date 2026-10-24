import { useEffect, useRef, useState } from 'react';

/**
 * Touch joystick reuses the game's existing camera-relative WASD movement
 * system by sending matching key edges. It does not create a second movement
 * or networking implementation.
 */
const DIRECTIONS = [
  { code: 'KeyW', angle: -Math.PI / 2 },
  { code: 'KeyD', angle: 0 },
  { code: 'KeyS', angle: Math.PI / 2 },
  { code: 'KeyA', angle: Math.PI },
] as const;

export const MobileJoystick = () => {
  const base = useRef<HTMLDivElement>(null);
  const active = useRef(new Set<string>());
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const release = () => {
    for (const code of active.current) {
      document.dispatchEvent(new KeyboardEvent('keyup', { code, bubbles: true }));
    }
    active.current.clear();
    setKnob({ x: 0, y: 0 });
  };

  useEffect(() => () => {
    for (const code of active.current) document.dispatchEvent(new KeyboardEvent('keyup', { code, bubbles: true }));
    active.current.clear();
  }, []);

  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = base.current?.getBoundingClientRect();
    if (!rect) return;
    const radius = rect.width * 0.32;
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    const length = Math.max(1, Math.hypot(dx, dy));
    const x = dx / length * Math.min(radius, Math.hypot(dx, dy));
    const y = dy / length * Math.min(radius, Math.hypot(dx, dy));
    setKnob({ x, y });

    const nx = dx / length;
    const ny = dy / length;
    const next = new Set<string>();
    if (Math.hypot(dx, dy) > rect.width * 0.13) {
      if (ny < -0.35) next.add('KeyW');
      if (ny > 0.35) next.add('KeyS');
      if (nx < -0.35) next.add('KeyA');
      if (nx > 0.35) next.add('KeyD');
    }
    for (const code of active.current) if (!next.has(code)) document.dispatchEvent(new KeyboardEvent('keyup', { code, bubbles: true }));
    for (const code of next) if (!active.current.has(code)) document.dispatchEvent(new KeyboardEvent('keydown', { code, bubbles: true }));
    active.current = next;
  };

  return <div className="mobile-joystick" aria-label="Joystick de déplacement"
    ref={base} onPointerDown={e => { e.preventDefault(); e.stopPropagation(); e.currentTarget.setPointerCapture(e.pointerId); move(e); }}
    onPointerMove={e => { if (e.buttons) move(e); }} onPointerUp={release} onPointerCancel={release}
    onLostPointerCapture={release} onContextMenu={e => e.preventDefault()}>
    <div className="mobile-joystick-ring"><div className="mobile-joystick-knob" style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }} /></div>
  </div>;
};
