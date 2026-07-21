import { Article } from '../types';

// Default reading-view theme (matches the design when an article sets no colours).
export const DEFAULT_BG = '#f4f1e9';
export const DEFAULT_TEXT = '#1c1b1a';
export const DEFAULT_ACCENT = '#d12d3a'; // crimson/pink — title + active [Фото N]
export const DEFAULT_TAG = 'Статья';

export interface ArticleTheme {
  bg: string;
  text: string;
  accent: string;
}

export function articleTheme(article: Article): ArticleTheme {
  return {
    bg: article.bg_color || DEFAULT_BG,
    text: article.text_color || DEFAULT_TEXT,
    accent: article.photo_accent_color || DEFAULT_ACCENT,
  };
}

export function articleTag(article: Article): string {
  return article.tag?.trim() || DEFAULT_TAG;
}

export function articleHref(article: Article): string {
  return `/article/${article.slug || article.id}`;
}

// Format an ISO date as DD/MM/YY (e.g. "16/01/26").
export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(-2)}`;
}

export interface ArticleImage {
  src: string;
  alt: string;
}

// Matches a markdown image: ![alt](src) or ![alt](src "title")
const IMAGE_RE = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

/**
 * Pull every image out of the markdown (in order) and replace each one with a
 * placeholder link "[Фото N](photo://N)". The reading view renders these as
 * inline photo markers (desktop) or inline images (mobile), and shows the
 * extracted images in the side gallery.
 */
export function processArticleMarkdown(md: string): {
  processed: string;
  images: ArticleImage[];
} {
  const images: ArticleImage[] = [];
  const processed = (md || '').replace(IMAGE_RE, (_match, alt: string, src: string) => {
    const index = images.length;
    images.push({ src, alt: alt || `Фото ${index + 1}` });
    return `[Фото ${index + 1}](photo://${index})`;
  });
  return { processed, images };
}
