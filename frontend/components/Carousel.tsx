import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Article } from '../types';
import { API_BASE_URL } from '../services/api';
import { articleHref, articleTag } from '../lib/article';

interface CarouselProps {
  items: Article[];
}

function coverSizeFor(width: number): number {
  if (width < 640) return 220;
  if (width < 1024) return 290;
  if (width < 1440) return 360;
  return 400;
}

const Carousel: React.FC<CarouselProps> = ({ items }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  const [size, setSize] = useState<number>(
    typeof window !== 'undefined' ? coverSizeFor(window.innerWidth) : 290,
  );

  // Drag/Swipe State
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onResize = () => setSize(coverSizeFor(window.innerWidth));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const prevSlide = () => setActiveIndex((prev) => Math.max(0, prev - 1));
  const nextSlide = () => setActiveIndex((prev) => Math.min(items.length - 1, prev + 1));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevSlide();
      else if (e.key === 'ArrowRight') nextSlide();
      else if (e.key === 'Enter' && items[activeIndex]) navigate(articleHref(items[activeIndex]));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, items]);

  const handleStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setCurrentX(clientX);
  };
  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    setCurrentX(clientX);
  };
  const handleEnd = () => {
    if (!isDragging) return;
    const diff = startX - currentX;
    const threshold = 50;
    if (diff > threshold) nextSlide();
    else if (diff < -threshold) prevSlide();
    setIsDragging(false);
  };

  if (items.length === 0) return null;

  const activeItem = items[activeIndex];
  const f = size / 280; // scale factor relative to the original 280px design
  const step = 50 * f;
  const sideShift = 60 * f;

  return (
    <div
      className="relative flex flex-col items-center justify-center w-full select-none"
      ref={containerRef}
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
    >
      <div
        className="relative w-full flex items-center justify-center overflow-visible perspective-1000 cursor-grab active:cursor-grabbing"
        style={{ height: size + 120 }}
      >
        <div className="relative w-full h-full flex items-center justify-center preserve-3d">
          {items.map((item, index) => {
            const offset = index - activeIndex;
            const isActive = index === activeIndex;

            let transform = '';
            let zIndex = 0;
            let opacity = 1;

            if (isActive) {
              transform = 'translateX(0) translateZ(0) rotateY(0deg)';
              zIndex = 20;
              opacity = 1;
            } else if (offset < 0) {
              transform = `translateX(${offset * step - sideShift}px) translateZ(-150px) rotateY(45deg)`;
              zIndex = 10 + offset;
              opacity = 0.6;
            } else {
              transform = `translateX(${offset * step + sideShift}px) translateZ(-150px) rotateY(-45deg)`;
              zIndex = 10 - offset;
              opacity = 0.6;
            }

            const coverSrc = item.cover_image_path
              ? `${API_BASE_URL}${item.cover_image_path}`
              : 'https://picsum.photos/800/600?blur=10';

            return (
              <div
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isActive) navigate(articleHref(item));
                  else setActiveIndex(index);
                }}
                className="absolute transition-all duration-500 ease-out"
                style={{
                  width: size,
                  height: size,
                  transform,
                  zIndex,
                  opacity,
                  WebkitBoxReflect:
                    'below 0px linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 100%)',
                }}
              >
                {/* Square covers — cropped to fill (object-cover). */}
                <img
                  src={coverSrc}
                  alt={item.title}
                  draggable={false}
                  className="w-full h-full object-cover shadow-2xl pointer-events-none"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Item Details — absolutely placed below the cover so a long
          title wraps downward instead of pushing the cover up. */}
      <div className="absolute top-full left-0 right-0 mt-4 text-center transition-opacity duration-300 px-4">
        <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-dark mb-1.5">
          {activeItem.title}
        </h3>
        <div className="inline-block bg-black/[0.06] backdrop-blur-sm px-3 py-1 rounded-full text-[10px] md:text-xs uppercase font-bold tracking-widest text-gray-500">
          {articleTag(activeItem)}
        </div>
      </div>
    </div>
  );
};

export default Carousel;
