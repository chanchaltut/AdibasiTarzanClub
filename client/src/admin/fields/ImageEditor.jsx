// ─────────────────────────────────────────────────────────────
// Crop & focus point — nothing is cut from the stored photo, so it
// can always be changed again later.
//
// 1. Crop: cut away what shouldn't be seen at all (a stranger at the
//    edge, a wall, the sky). "Keep the whole photo" is fine for most.
// 2. Focus point: tap the most important spot (usually a face). The
//    website fills frames of different shapes on phones, tablets and
//    computers — the focus point always stays in view.
// ─────────────────────────────────────────────────────────────

import { useMemo, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import { useSchema } from '../schema';
import { mediaUrl } from '../images';
import { Button, Icon, Modal } from '../ui';

const SHAPES = ['banner', 'wide', 'photo', 'square', 'portrait', 'story'];

const PRESETS = [
  ['Top left', 0, 0], ['Top', 50, 0], ['Top right', 100, 0],
  ['Left', 0, 50], ['Centre', 50, 50], ['Right', 100, 50],
  ['Bottom left', 0, 100], ['Bottom', 50, 100], ['Bottom right', 100, 100],
];

const PREVIEWS = [
  ['Wide banner (computer)', 21 / 9],
  ['Card', 4 / 3],
  ['Square', 1],
  ['Tall (phone)', 3 / 4],
];

const round = (n) => Math.round(n * 1000) / 1000;

function initialShape(value, media, aspects, recommended) {
  if (!value?.crop || !media) return 'whole';
  const r = (value.crop.w * media.width) / (value.crop.h * media.height);
  const hit = SHAPES.find((k) => Math.abs(aspects[k].ratio - r) / r < 0.02);
  return hit || (recommended !== 'any' ? recommended : 'whole');
}

export default function ImageEditor({ value, media, aspectKey, onCancel, onSave }) {
  const { aspects } = useSchema();
  const canCrop = Boolean(media);
  const [tab, setTab] = useState(canCrop ? 'crop' : 'focus');
  const [shape, setShape] = useState(() => initialShape(value, media, aspects, aspectKey));
  const [crop, setCrop] = useState(value?.crop || null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [focal, setFocal] = useState(value?.focal || { x: 50, y: 50 });
  const focusBox = useRef(null);

  const shapes = useMemo(() => {
    const list = SHAPES.filter((k) => k !== aspectKey);
    return aspectKey !== 'any' && aspects[aspectKey]?.ratio ? [aspectKey, ...list] : list;
  }, [aspectKey, aspects]);

  const full = media ? mediaUrl(media, { width: 1600 }) : value?.src;
  const cropped = media ? mediaUrl(media, { crop: shape === 'whole' ? null : crop, width: 1200 }) : value?.src;

  const pickShape = (k) => {
    setShape(k);
    setZoom(1);
    setPos({ x: 0, y: 0 });
    if (k === 'whole') setCrop(null);
  };

  const setFocalFromEvent = (e) => {
    const rect = focusBox.current.getBoundingClientRect();
    const pt = e.touches?.[0] || e;
    const x = Math.min(100, Math.max(0, ((pt.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((pt.clientY - rect.top) / rect.height) * 100));
    setFocal({ x: Math.round(x), y: Math.round(y) });
  };

  const onKey = (e) => {
    const step = e.shiftKey ? 10 : 2;
    const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
    if (!d) return;
    e.preventDefault();
    setFocal((f) => ({ x: Math.min(100, Math.max(0, f.x + d[0])), y: Math.min(100, Math.max(0, f.y + d[1])) }));
  };

  const save = () => onSave({ crop: shape === 'whole' ? null : crop, focal });

  return (
    <Modal
      title="Adjust photo"
      size="xl"
      onClose={onCancel}
      closeOnBackdrop={false}
      footer={(
        <>
          <Button variant="ghost" onClick={() => { setShape('whole'); setCrop(null); setFocal({ x: 50, y: 50 }); setZoom(1); }}>Reset</Button>
          <span className="a-spacer" />
          <Button onClick={onCancel}>Cancel</Button>
          {tab === 'crop'
            ? <Button variant="primary" icon="target" onClick={() => setTab('focus')}>Next: focus point</Button>
            : <Button variant="primary" icon="check" onClick={save}>Use this</Button>}
        </>
      )}
    >
      <div className="a-tabs" role="tablist">
        {canCrop && (
          <button type="button" role="tab" aria-selected={tab === 'crop'} className={tab === 'crop' ? 'is-active' : ''} onClick={() => setTab('crop')}>
            <Icon name="crop" size={18} /> 1. Crop <span className="a-muted">(optional)</span>
          </button>
        )}
        <button type="button" role="tab" aria-selected={tab === 'focus'} className={tab === 'focus' ? 'is-active' : ''} onClick={() => setTab('focus')}>
          <Icon name="target" size={18} /> {canCrop ? '2. ' : ''}Focus point
        </button>
      </div>

      {tab === 'crop' && canCrop && (
        <div className="a-crop">
          <p className="a-help-line">Cut away anything that should never be seen. If the whole photo is fine, keep it whole — the website fits it to every screen by itself.</p>
          <div className="a-chips">
            <button type="button" className={`a-chip ${shape === 'whole' ? 'is-active' : ''}`} onClick={() => pickShape('whole')}>Keep the whole photo</button>
            {shapes.map((k) => (
              <button type="button" key={k} className={`a-chip ${shape === k ? 'is-active' : ''}`} onClick={() => pickShape(k)}>
                {aspects[k].label}{k === aspectKey && <span className="a-chip__tag">Recommended</span>}
              </button>
            ))}
          </div>
          <div className="a-crop__stage">
            {shape === 'whole' ? (
              <img src={full} alt="" className="a-crop__whole" />
            ) : (
              <Cropper
                key={shape}
                image={full}
                crop={pos}
                zoom={zoom}
                aspect={aspects[shape].ratio}
                maxZoom={5}
                onCropChange={setPos}
                onZoomChange={setZoom}
                onCropComplete={(area) => setCrop({ x: round(area.x), y: round(area.y), w: round(area.width), h: round(area.height) })}
                initialCroppedAreaPercentages={value?.crop && initialShape(value, media, aspects, aspectKey) === shape
                  ? { x: value.crop.x, y: value.crop.y, width: value.crop.w, height: value.crop.h } : undefined}
                showGrid
                objectFit="contain"
              />
            )}
          </div>
          {shape !== 'whole' && (
            <label className="a-zoom">
              <Icon name="search" size={18} />
              <span>Zoom</span>
              <input type="range" min={1} max={5} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
            </label>
          )}
          {shape !== 'whole' && <p className="a-muted a-small">Drag the photo to move it inside the frame. Pinch or use the slider to zoom.</p>}
        </div>
      )}

      {tab === 'focus' && (
        <div className="a-focus">
          <div className="a-focus__left">
            <p className="a-help-line">Tap the most important part of the photo — usually a face or the ball. It will stay visible on every screen.</p>
            <div
              className="a-focus__box"
              ref={focusBox}
              role="slider"
              tabIndex={0}
              aria-label="Focus point. Use the arrow keys to move it."
              aria-valuetext={`${focal.x}% across, ${focal.y}% down`}
              onClick={setFocalFromEvent}
              onKeyDown={onKey}
            >
              <img src={cropped} alt="" draggable={false} />
              <span className="a-focal-dot a-focal-dot--lg" style={{ left: `${focal.x}%`, top: `${focal.y}%` }} />
            </div>
            <div className="a-presets" role="group" aria-label="Quick positions">
              {PRESETS.map(([label, x, y]) => (
                <button type="button" key={label} className={focal.x === x && focal.y === y ? 'is-active' : ''} onClick={() => setFocal({ x, y })} title={label} aria-label={label}>
                  <span />
                </button>
              ))}
              <p className="a-muted a-small">Quick positions</p>
            </div>
          </div>
          <div className="a-focus__right">
            <p className="a-focus__title">How it will look</p>
            <div className="a-previews">
              {PREVIEWS.map(([label, r]) => (
                <figure key={label}>
                  <div style={{ aspectRatio: String(r) }}><img src={cropped} alt="" style={{ objectPosition: `${focal.x}% ${focal.y}%` }} /></div>
                  <figcaption>{label}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
