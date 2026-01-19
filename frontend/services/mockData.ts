import { Article, Playlist } from '../types';

export const MOCK_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Why SAYIT?',
    slug: 'why-sayit',
    author: 'Yaya & Ling',
    date: 'July 17, 2025',
    excerpt: 'SAYIT is your personal bridge between humans and AI power.',
    coverImage: 'https://picsum.photos/800/600?random=1',
    tags: ['AI', 'Philosophy'],
    content: `# Why SAYIT?

SAYIT — is your personal **bridge between humans and the power of AI** in real tasks. 

## Learning or Working?
Communicating with foreigners or traveling? Reading resources in another language? Want to develop an idea or delegate routine?

All this is **SAYIT** with Yaya🤍 and Ling🔵, who do everything **fast**, **cheap**, and **honestly**!

### How to use it?

1. Choose settings in /menu
2. Send voice audio, text file, image, or youtube link
3. Turn tokens into results

Simple usage scheme — like breathing.`
  },
  {
    id: '2',
    title: 'The Digital Renaissance',
    slug: 'digital-renaissance',
    author: 'System',
    date: 'August 10, 2025',
    excerpt: 'Exploring how minimalist design influences modern web architecture.',
    coverImage: 'https://picsum.photos/800/600?random=2',
    tags: ['Design', 'Web'],
    content: `# The Digital Renaissance

We are moving away from clutter. The new era is about **clarity**.

## Less is More
When we strip away the noise, we find the signal. 

*   Clean typography
*   Negative space
*   Intentional color usage

This platform, SSOTB, is an experiment in that philosophy.`
  },
  {
    id: '3',
    title: 'Sonic Landscapes',
    slug: 'sonic-landscapes',
    author: 'Audio Team',
    date: 'September 1, 2025',
    excerpt: 'How music shapes our reading experience and memory.',
    coverImage: 'https://picsum.photos/800/600?random=3',
    tags: ['Music', 'Psychology'],
    content: `# Sonic Landscapes

Music isn't just background noise; it's a context anchor.

## The Vibe
Matching a playlist to an article creates a **multi-sensory experience**. It helps lock the memory of the text to a feeling.`
  }
];

export const MOCK_PLAYLISTS: Playlist[] = [
  {
    id: '1',
    title: 'Loose',
    description: 'Nelly Furtado',
    coverImage: 'https://picsum.photos/400/400?random=10',
    tracks: [
      { id: 't1', title: 'Afraid', artist: 'Nelly Furtado', duration: '3:35', url: '#' },
      { id: 't2', title: 'Maneater', artist: 'Nelly Furtado', duration: '4:25', url: '#' },
      { id: 't3', title: 'Promiscuous', artist: 'Nelly Furtado', duration: '4:02', url: '#' },
    ]
  },
  {
    id: '2',
    title: 'Midnight Jazz',
    description: 'Smooth vibes for late reading',
    coverImage: 'https://picsum.photos/400/400?random=11',
    tracks: [
      { id: 't4', title: 'So What', artist: 'Miles Davis', duration: '9:22', url: '#' },
      { id: 't5', title: 'Take Five', artist: 'Dave Brubeck', duration: '5:24', url: '#' },
    ]
  },
  {
    id: '3',
    title: 'Deep Focus',
    description: 'Ambient textures',
    coverImage: 'https://picsum.photos/400/400?random=12',
    tracks: [
      { id: 't6', title: 'Thursday Afternoon', artist: 'Brian Eno', duration: '60:00', url: '#' },
    ]
  }
];
