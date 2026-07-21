import React, { useEffect, useState } from 'react';
import { ArticleImage } from '../lib/article';
import { mediaUrl } from './ArticleBody';

const ACTIVE_H = 464; // height of the currently-shown photo
const SIDE_H = 97; // height of the immediate previous / next photos
const FALLOFF = 0.62; // each step further shrinks the thumbnail (bell curve)
const MIN_H = 14;
const GAP = 16;

interface PhotoGalleryProps {
  slides: ArticleImage[]; // [cover, ...photos]
  active: number; // index into slides
  onSelect: (slideIndex: number) => void;
}

// Minimalist vertical filmstrip pinned to the left edge: the active photo is
// large, neighbours shrink with distance (bell curve). Photos keep their
// natural aspect ratio (no crop), no border / shadow / radius.
//
// For performance everything animates via `transform` (translateY + scale) and
// `opacity` only — both GPU-composited — so rapid active changes while scrolling
// never trigger layout/reflow. Each image's layout box is fixed; only the
// transform changes.
const PhotoGallery: React.FC<PhotoGalleryProps> = ({ slides, active, onSelect }) => {
  const [vh, setVh] = useState<number>(typeof window !== 'undefined' ? window.innerHeight : 800);

  useEffect(() => {
    const onResize = () => setVh(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (slides.length === 0) return null;

  // Active height, capped so a tall photo never exceeds the viewport.
  const base = Math.min(ACTIVE_H, Math.max(120, vh - 40));
  const heightFor = (d: number) => (d === 0 ? base : Math.max(MIN_H, SIDE_H * Math.pow(FALLOFF, d - 1)));
  const heights = slides.map((_, i) => heightFor(Math.abs(i - active)));

  // Cumulative visual tops of each slide within the strip.
  const tops: number[] = [];
  let acc = 0;
  for (let i = 0; i < slides.length; i++) {
    tops.push(acc);
    acc += heights[i] + GAP;
  }
  const activeCenter = tops[active] + heights[active] / 2;

  return (
    <div className="sticky top-0 h-screen overflow-hidden">
      {/* Anchor at the vertical centre of the viewport. */}
      <div style={{ position: 'absolute', top: '50%', left: 25, right: 0 }}>
        {slides.map((s, i) => {
          const d = Math.abs(i - active);
          const isActive = d === 0;
          const scale = heights[i] / base;
          const y = tops[i] - activeCenter; // active centre sits on the anchor
          return (
            <img
              key={i}
              src={mediaUrl(s.src)}
              alt={s.alt}
              draggable={false}
              onClick={() => onSelect(i)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: base,
                width: 'auto',
                maxWidth: 'calc(50vw - 50px)',
                objectFit: 'contain',
                transformOrigin: 'top left',
                transform: `translateY(${y}px) scale(${scale})`,
                opacity: isActive ? 1 : Math.max(0.25, 0.6 - 0.12 * (d - 1)),
                transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s ease',
                willChange: 'transform, opacity',
                cursor: 'pointer',
                display: 'block',
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default PhotoGallery;
