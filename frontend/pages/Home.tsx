import React, { useEffect, useState } from "react";
import Carousel from "../components/Carousel";
import { api } from "../services/api";
import { Article } from "../types";

const Home: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // Блокируем скролл body только на этой странице
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

  return (
    <div className="min-h-screen bg-light flex flex-col overflow-hidden">
      <header className="p-8 flex justify-between items-center z-10">
        <h1 className="text-2xl font-bold tracking-tighter">SSOTB</h1>
        <div className="text-sm text-gray-500">Volume 01 • 2025</div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative">
        {loading ? (
          <div className="w-8 h-8 border-2 border-gray-200 border-t-accent rounded-full animate-spin" />
        ) : (
          <div className="w-full max-w-6xl mx-auto">
            <Carousel items={articles} />
          </div>
        )}
      </main>

      <footer className="p-8 text-center text-xs text-gray-400 uppercase tracking-widest" />
    </div>
  );
};

export default Home;
