import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Carousel from "../components/Carousel";
import { api } from "../services/api";
import { Article } from "../types";
import { articleHref } from "../lib/article";

const Home: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Lock body scroll only on this page.
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow || "auto";
    };
  }, []);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await api.getArticles();
        setArticles(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  // Articles arrive newest-first, so the oldest (intro) article is last.
  const introArticle = articles.length ? articles[articles.length - 1] : null;

  const prevent = (e: React.SyntheticEvent) => e.preventDefault();

  return (
    <div
      className="no-copy min-h-screen bg-light flex flex-col overflow-hidden"
      onCopy={prevent}
      onCut={prevent}
      onContextMenu={prevent}
    >
      <header className="p-6 sm:p-8 flex justify-between items-center z-10">
        <h1 className="text-2xl font-bold tracking-tighter">SSOTB</h1>
        {introArticle && (
          <button
            onClick={() => navigate(articleHref(introArticle))}
            className="text-sm text-gray-500 hover:text-dark transition-colors underline-offset-4 hover:underline"
          >
            О чем?
          </button>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative">
        {loading ? (
          <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
        ) : (
          <div className="w-full max-w-6xl mx-auto">
            <Carousel items={articles} />
          </div>
        )}
      </main>

      <footer className="p-6 sm:p-8 text-center text-xs text-gray-400 uppercase tracking-widest" />
    </div>
  );
};

export default Home;
