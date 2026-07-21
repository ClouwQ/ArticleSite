import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, API_BASE_URL } from '../services/api';
import { Article, Playlist, Track } from '../types';
import {
  articleTag,
  articleTheme,
  formatShortDate,
  processArticleMarkdown,
  ArticleImage,
  DEFAULT_BG,
} from '../lib/article';
import ArticleBody from '../components/ArticleBody';
import PhotoGallery from '../components/PhotoGallery';
import { PhotoContext } from '../components/photoContext';

const ArticleView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [content, setContent] = useState<string>('');
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);

  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false,
  );
  const [activePhoto, setActivePhoto] = useState(-1);
  const markers = useRef<Map<number, HTMLElement>>(new Map());

  // Music (sequential playback, no skip / no seek).
  const [playing, setPlaying] = useState(false);
  const [trackIdx, setTrackIdx] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { processed, images } = useMemo(() => processArticleMarkdown(content), [content]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Paint the page (html/body) with the article background so any overscroll
  // shows the article colour instead of the white page background.
  useEffect(() => {
    const bg = article ? articleTheme(article).bg : DEFAULT_BG;
    const prevBody = document.body.style.backgroundColor;
    const prevHtml = document.documentElement.style.backgroundColor;
    document.body.style.backgroundColor = bg;
    document.documentElement.style.backgroundColor = bg;
    return () => {
      document.body.style.backgroundColor = prevBody;
      document.documentElement.style.backgroundColor = prevHtml;
    };
  }, [article]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      setActivePhoto(-1);
      try {
        const [articleData, contentText] = await Promise.all([
          api.getArticle(id),
          api.getArticleContent(id),
        ]);
        setArticle(articleData || null);
        setContent(contentText || '');

        if (articleData?.playlist_id) {
          const [base, tracks] = await Promise.all([
            api.getPlaylist(articleData.playlist_id),
            api.getPlaylistTracks(articleData.playlist_id),
          ]);
          setPlaylist({ ...base, tracks });
        } else {
          setPlaylist(null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Scroll-spy: highlight the photo whose marker last crossed the viewport middle.
  useEffect(() => {
    if (isMobile) {
      setActivePhoto(-1);
      return;
    }
    const onScroll = () => {
      const middle = window.innerHeight * 0.5;
      let next = -1;
      markers.current.forEach((el, idx) => {
        if (el.getBoundingClientRect().top <= middle) next = Math.max(next, idx);
      });
      // Guarantee the last photo is shown once the page is scrolled to the bottom.
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8;
      if (atBottom && images.length) next = images.length - 1;
      // At the very top the cover is always shown.
      if (window.scrollY <= 2) next = -1;
      setActivePhoto(next);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [isMobile, images.length, loading]);

  const register = (index: number, el: HTMLElement | null) => {
    if (el) markers.current.set(index, el);
    else markers.current.delete(index);
  };

  const scrollToPhoto = (index: number) => {
    const el = markers.current.get(index);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Audio
  const playable = useMemo(
    () => (playlist?.tracks || []).filter((t) => t.audio_file_path),
    [playlist],
  );
  const currentTrack: Track | undefined = playable[trackIdx];
  const currentSrc = currentTrack?.audio_file_path
    ? `${API_BASE_URL}${currentTrack.audio_file_path}`
    : '';

  useEffect(() => {
    if (playing && audioRef.current) audioRef.current.play().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackIdx]);

  const toggleMusic = () => {
    if (!playable.length || !audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const handleEnded = () => {
    if (trackIdx + 1 < playable.length) {
      setTrackIdx(trackIdx + 1);
    } else {
      setPlaying(false);
      setTrackIdx(0);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: '#f4f1e9' }}>
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }
  if (!article) {
    return <div className="h-screen flex items-center justify-center">Статья не найдена</div>;
  }

  const theme = articleTheme(article);
  const cover = article.cover_image_path;
  const hasCover = !!cover;
  const slides: ArticleImage[] = hasCover
    ? [{ src: cover as string, alt: article.title }, ...images]
    : images;
  const galleryActive = hasCover ? activePhoto + 1 : Math.max(0, activePhoto);
  const hasGallery = slides.length > 0;

  const onGallerySelect = (slideIndex: number) => {
    if (hasCover && slideIndex === 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    scrollToPhoto(hasCover ? slideIndex - 1 : slideIndex);
  };

  const inactiveColor = 'rgba(0,0,0,0.32)';
  // Title is pink while the cover is shown, normal text colour once on a photo.
  const titleColor = activePhoto === -1 ? theme.accent : theme.text;

  const headerEl = (
    <header className="sticky top-0 z-30" style={{ background: 'transparent', pointerEvents: 'none' }}>
      <div
        className="flex justify-between items-start text-sm"
        style={{ paddingTop: 25, paddingLeft: 25, paddingRight: 25, paddingBottom: 14, pointerEvents: 'none' }}
      >
        <div style={{ pointerEvents: 'auto' }}>
          <Link to="/" className="underline underline-offset-2 hover:opacity-70">
            Меню
          </Link>
          <span style={{ opacity: 0.75 }}>
            , {formatShortDate(article.created_at)} — {articleTag(article)}
          </span>
        </div>
        <div className="text-right" style={{ whiteSpace: 'nowrap', pointerEvents: 'auto' }}>
          <button
            onClick={toggleMusic}
            disabled={!playable.length}
            className="hover:opacity-70 disabled:opacity-40"
          >
            {playing ? 'Остановить музыку' : 'Проигрывать музыку'}
          </button>
          {playlist?.external_url && (
            <>
              <span style={{ opacity: 0.75 }}>, </span>
              <a
                href={playlist.external_url}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 hover:opacity-70"
              >
                Плейлист
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );

  const titleEl = (
    <h1
      className="text-center font-serif"
      style={{
        fontSize: 33,
        lineHeight: 1.15,
//         fontStyle: 'italic',
        color: titleColor,
        transition: 'color 0.4s ease',
        padding: '6px 25px 0',
        margin: 0,
      }}
    >
      {article.title}
    </h1>
  );

  const descriptionEl = article.description ? (
    <p className="font-serif" style={{ fontSize: 33, lineHeight: 1.2, marginBottom: 36 }}>
      {article.description}
    </p>
  ) : null;

  return (
    <div className="min-h-screen" style={{ background: theme.bg, color: theme.text }}>
      <audio ref={audioRef} src={currentSrc || undefined} onEnded={handleEnded} preload="auto" />

      {headerEl}

      <PhotoContext.Provider
        value={{ images, activeIndex: activePhoto, accent: theme.accent, inactiveColor, isMobile, register, scrollToPhoto }}
      >
        {isMobile || !hasGallery ? (
          <div style={{ padding: '0 25px 80px' }}>
            {titleEl}
            {descriptionEl}
            <ArticleBody content={processed} textColor={theme.text} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'auto 1fr' }}>
            {/* Title spans the full width at the top and scrolls with the page */}
            <div style={{ gridColumn: '1 / 3', gridRow: '1' }}>{titleEl}</div>
            {/* Left: photo filmstrip spans from the very top so the active photo
                always centres in the viewport and is never clipped */}
            <div style={{ gridColumn: '1', gridRow: '1 / 3' }}>
              <PhotoGallery slides={slides} active={galleryActive} onSelect={onGallerySelect} />
            </div>
            {/* Right: description + body, starting at the page middle */}
            <div style={{ gridColumn: '2', gridRow: '2', paddingRight: 25, paddingTop: 24, paddingBottom: '55vh' }}>
              {descriptionEl}
              <ArticleBody content={processed} textColor={theme.text} />
            </div>
          </div>
        )}
      </PhotoContext.Provider>
    </div>
  );
};

export default ArticleView;
