import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Article } from '../types';
import { API_BASE_URL } from '../services/api';

interface CarouselProps {
  items: Article[];
}

const Carousel: React.FC<CarouselProps> = ({ items }) => {
  // Start with the first article (leftmost) instead of center
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  
  // Drag/Swipe State
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    } else if (e.key === 'Enter') {
      navigate(`/article/${items[activeIndex].id}`);
    }
  };

  const prevSlide = () => setActiveIndex(prev => Math.max(0, prev - 1));
  const nextSlide = () => setActiveIndex(prev => Math.min(items.length - 1, prev + 1));

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, items]);

  // Touch/Mouse Handlers
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
    const threshold = 50; // Minimum distance to trigger swipe

    if (diff > threshold) {
      nextSlide();
    } else if (diff < -threshold) {
      prevSlide();
    }
    
    setIsDragging(false);
  };

  if (items.length === 0) return null;

  const activeItem = items[activeIndex];

  return (
    <div 
      className="flex flex-col items-center justify-center w-full select-none"
      ref={containerRef}
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
    >
      <div className="relative w-full h-[400px] flex items-center justify-center overflow-visible perspective-1000 cursor-grab active:cursor-grabbing">
        <div className="relative w-full h-full flex items-center justify-center preserve-3d">
          {items.map((item, index) => {
            const offset = index - activeIndex;
            const isActive = index === activeIndex;
            
            // Calculate styles for Cover Flow effect
            let transform = '';
            let zIndex = 0;
            let opacity = 1;

            if (isActive) {
              transform = 'translateX(0) translateZ(0) rotateY(0deg)';
              zIndex = 20;
              opacity = 1;
            } else if (offset < 0) {
              // Left side
              transform = `translateX(${offset * 50 - 60}px) translateZ(-150px) rotateY(45deg)`;
              zIndex = 10 + offset;
              opacity = 0.6;
            } else {
              // Right side
              transform = `translateX(${offset * 50 + 60}px) translateZ(-150px) rotateY(-45deg)`;
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
                   e.stopPropagation(); // Prevent drag from misfiring click
                   if (isActive) navigate(`/article/${item.id}`);
                   else setActiveIndex(index);
                }}
                className="absolute transition-all duration-500 ease-out"
                style={{
                  width: '280px',
                  height: '280px',
                  transform,
                  zIndex,
                  opacity,
                  // Reflection gradient logic:
                  // Standard mask: 0% (top/near) -> Visible. 100% (bottom/far) -> Transparent.
                  // Reduced start opacity to 0.35 from 0.5
                  WebkitBoxReflect: 'below 0px linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 100%)'
                }}
              >
                <img 
                  src={coverSrc} 
                  alt={item.title} 
                  className="w-full h-full object-cover shadow-2xl bg-black pointer-events-none" 
                />
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Active Item Details */}
      <div className="mt-8 text-center transition-opacity duration-300">
        <h3 className="text-xl font-bold text-dark mb-1">{activeItem.title}</h3>
        <div className="inline-block bg-gray-100 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest text-gray-500">
            Article
        </div>
      </div>
    </div>
  );
};

export default Carousel;