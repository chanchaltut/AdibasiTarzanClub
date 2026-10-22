import Icon from './Icon';

export function ScrollMeter({ s }) {
  return (
    <div className="scroll-meter" aria-hidden="true">
      <span className="scroll-meter__bar" style={{ width: `${s.thumb * 100}%`, left: `${s.progress * (1 - s.thumb) * 100}%` }} />
    </div>
  );
}

export function SliderControls({ s, label }) {
  return (
    <div className="slider-controls">
      <button className="slider-btn" onClick={s.goPrev} disabled={!s.prev} aria-label={`Previous ${label}`}><Icon name="chevron-left" /></button>
      <button className="slider-btn" onClick={s.goNext} disabled={!s.next} aria-label={`Next ${label}`}><Icon name="chevron-right" /></button>
    </div>
  );
}
