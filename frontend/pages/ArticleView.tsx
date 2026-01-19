import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from '../components/Icons'; 
import MarkdownRenderer from '../components/MarkdownRenderer';
import PlaylistModal from '../components/PlaylistModal';
import { api, API_BASE_URL } from '../services/api';
import { Article, Playlist, Track } from '../types';

interface ArticleViewProps {
  onPlayMusic: (playlist: Playlist) => void;
}

const ArticleView: React.FC<ArticleViewProps> = ({ onPlayMusic }) => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [content, setContent] = useState<string>('');
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [articleData, contentText] = await Promise.all([
          api.getArticle(id),
          api.getArticleContent(id),
        ]);
        setArticle(articleData || null);
        setContent(contentText || '');

        // Load first available playlist and its tracks
        const playlists = await api.getPlaylists();
        if (playlists.length > 0) {
          const base = playlists[0];
          const tracks: Track[] = await api.getPlaylistTracks(base.id);
          setPlaylist({ ...base, tracks });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-accent rounded-full animate-spin"></div>
    </div>
  );
  
  if (!article) return <div className="h-screen flex items-center justify-center">Article not found</div>;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 bg-white/95 backdrop-blur-sm z-30 border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors group">
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium uppercase tracking-wide">Menu</span>
          </Link>
        </div>
      </nav>

      {/* Header Area */}
      {/* Reduced bottom padding (pb-6) to decrease gap between Soundtrack and Text */}
      <div className="max-w-4xl mx-auto px-6 pt-12 pb-6">
        <div className="flex flex-col sm:flex-row gap-8 sm:gap-10 items-start sm:items-end">
          
          {/* Cover Image (Left) */}
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex-shrink-0">
             <img 
               src={article.cover_image_path ? `${API_BASE_URL}${article.cover_image_path}` : 'https://picsum.photos/800/600?blur=10'} 
               alt={article.title} 
               className="w-full h-full object-cover shadow-lg bg-gray-100" 
             />
             {/* Reflection for Article Cover - Optimized */}
             <div 
               className="absolute top-full left-0 w-full h-full pointer-events-none opacity-15"
               style={{
                 // Mask: Visible at top (near image), Transparent at bottom
                 maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
                 WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
               }}
             >
                {/* Flipped Image content */}
                <img 
                    src={article.cover_image_path ? `${API_BASE_URL}${article.cover_image_path}` : 'https://picsum.photos/800/600?blur=10'} 
                    className="w-full h-full object-cover" 
                    style={{ transform: 'scaleY(-1)' }} 
                    alt="" 
                />
             </div>
          </div>

          {/* Info (Right) */}
          <div className="flex-1 pb-1">
            
            {/* Meta Row */}
            <div className="flex items-center gap-4 mb-3">
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-xs uppercase font-bold tracking-widest">
                Article
              </span>
              <span className="text-gray-400 text-sm font-medium">
                {new Date(article.created_at).toLocaleDateString()}
              </span>
            </div>
            
            {/* Title */}
            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-dark leading-tight mb-4">
              {article.title}
            </h1>

            {/* Playlist Button Area */}
            {playlist && (
              <div className="mt-6">
                 <button 
                   onClick={() => setIsModalOpen(true)}
                   className="bg-gray-100 hover:bg-gray-200 text-dark font-semibold text-sm uppercase tracking-wide px-6 py-3 rounded-lg transition-colors"
                 >
                   Плейлист
                 </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {/* Increased top margin (mt-10) approx +10px from previous */}
      <article className="max-w-2xl mx-auto px-6 pb-20 mt-10">
        {/* 
          Using a CSS module or inline style approach to hide the first H1 within the markdown content 
          because we are already displaying the title in the Header area above.
        */}
        <div className="prose-h1-hidden">
            <style>{`
                .prose-h1-hidden h1:first-of-type {
                    display: none;
                }
            `}</style>
            <MarkdownRenderer content={content} />
        </div>
      </article>

      {/* Playlist Modal */}
      <PlaylistModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        playlist={playlist}
        onPlayTrack={onPlayMusic}
      />
    </div>
  );
};

export default ArticleView;