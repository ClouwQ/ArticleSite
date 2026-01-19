import React from 'react';

// A lightweight custom renderer to avoid dependencies for this specific task
// In a real app, use 'react-markdown' or 'marked'
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');
  
  return (
    <div className="font-serif text-dark leading-relaxed space-y-6">
      {lines.map((line, index) => {
        // Headers
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-4xl font-bold mt-8 mb-4 tracking-tight">{line.replace('# ', '')}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-bold mt-6 mb-3 text-gray-800">{line.replace('## ', '')}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-bold mt-4 mb-2 text-gray-700">{line.replace('### ', '')}</h3>;
        }

        // Bullet points
        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
          return <li key={index} className="ml-6 list-disc text-lg text-gray-700">{line.replace(/[*|-] /, '')}</li>;
        }

        // Numbered lists
        if (/^\d+\./.test(line.trim())) {
           return <div key={index} className="ml-6 text-lg text-gray-700 font-medium my-2">{line}</div>
        }

        // Empty lines
        if (line.trim() === '') return null;

        // Paragraphs with Bold parsing
        const parseBold = (text: string) => {
          const parts = text.split(/(\*\*.*?\*\*)/g);
          return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className="font-bold text-black">{part.slice(2, -2)}</strong>;
            }
            return part;
          });
        };

        return <p key={index} className="text-lg text-gray-700">{parseBold(line)}</p>;
      })}
    </div>
  );
};

export default MarkdownRenderer;
