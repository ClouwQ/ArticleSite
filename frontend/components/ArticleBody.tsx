import React, { useContext } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PhotoContext } from './photoContext';
import { API_BASE_URL } from '../services/api';

export const mediaUrl = (src: string): string =>
  src && src.startsWith('/') ? `${API_BASE_URL}${src}` : src;

// Inline [Фото N] marker (desktop) or inline image (mobile).
const PhotoMarker: React.FC<{ index: number; children?: React.ReactNode }> = ({ index, children }) => {
  const ctx = useContext(PhotoContext);
  if (!ctx) return <>{children}</>;

  const { images, isMobile, activeIndex, accent, inactiveColor, register, scrollToPhoto } = ctx;
  const img = images[index];

  if (isMobile) {
    if (!img) return <>[{children}]</>;
    return (
      <img
        ref={(el) => register(index, el)}
        src={mediaUrl(img.src)}
        alt={img.alt}
        className="block w-full h-auto rounded-md my-5 shadow-sm"
      />
    );
  }

  const active = activeIndex === index;
  return (
    <span
      ref={(el) => register(index, el)}
      onClick={() => scrollToPhoto(index)}
      style={{
        color: active ? accent : inactiveColor,
        fontWeight: active ? 600 : 400,
        cursor: 'pointer',
        transition: 'color 0.3s ease',
        whiteSpace: 'nowrap',
      }}
    >
      [{children}]
    </span>
  );
};

interface ArticleBodyProps {
  content: string; // already pre-processed (images replaced with photo:// links)
  textColor: string;
}

const ArticleBody: React.FC<ArticleBodyProps> = ({ content, textColor }) => {
  return (
    <div className="article-prose" style={{ color: textColor }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        // Keep our custom "photo://" scheme (react-markdown strips unknown protocols by default).
        urlTransform={(url) => url}
        components={{
          a: ({ href, children }) => {
            if (href && href.startsWith('photo://')) {
              const index = parseInt(href.slice('photo://'.length), 10);
              return <PhotoMarker index={index}>{children}</PhotoMarker>;
            }
            return (
              <a href={href} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
                {children}
              </a>
            );
          },
          img: ({ src, alt }) => (
            <img src={mediaUrl(String(src || ''))} alt={alt || ''} className="block w-full h-auto rounded-md my-5" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default ArticleBody;
