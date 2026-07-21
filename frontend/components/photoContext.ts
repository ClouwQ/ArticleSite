import { createContext } from 'react';
import { ArticleImage } from '../lib/article';

export interface PhotoCtx {
  images: ArticleImage[];
  activeIndex: number; // -1 = cover shown, 0..n-1 = photo index
  accent: string;
  inactiveColor: string;
  isMobile: boolean;
  register: (index: number, el: HTMLElement | null) => void;
  scrollToPhoto: (index: number) => void;
}

export const PhotoContext = createContext<PhotoCtx | null>(null);
