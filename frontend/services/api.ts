import { Article, Playlist, Track, LoginResponse, MusicSource, Platform } from '../types';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function handleJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json() as Promise<T>;
}

async function handleText(res: Response): Promise<string> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.text();
}

const jsonHeaders = {
  'Content-Type': 'application/json',
};

const authHeaders = (token: string | null) =>
  token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};

export const api = {
  // Auth
  login: (username: string, password: string): Promise<LoginResponse> =>
    fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ username, password }),
    }).then(handleJson<LoginResponse>),

  // Public articles
  getArticles: (): Promise<Article[]> =>
    fetch(`${API_BASE_URL}/api/articles`).then(handleJson<Article[]>),

  getArticle: (id: string): Promise<Article> =>
    fetch(`${API_BASE_URL}/api/articles/${id}`).then(handleJson<Article>),

  getArticleContent: (id: string): Promise<string> =>
    fetch(`${API_BASE_URL}/api/articles/${id}/content`).then(handleText),

  // Playlists & tracks
  getPlaylists: (): Promise<Playlist[]> =>
    fetch(`${API_BASE_URL}/api/playlists`).then(handleJson<Playlist[]>),

  getPlaylist: (id: string): Promise<Playlist> =>
    fetch(`${API_BASE_URL}/api/playlists/${id}`).then(handleJson<Playlist>),

  getPlaylistTracks: (playlistId: string): Promise<Track[]> =>
    fetch(`${API_BASE_URL}/api/playlists/${playlistId}/tracks`).then(
      handleJson<Track[]>
    ),

  getTrackSources: (trackId: string): Promise<MusicSource[]> =>
    fetch(`${API_BASE_URL}/api/tracks/${trackId}/sources`).then(
      handleJson<MusicSource[]>
    ),

  getPlatforms: (): Promise<Platform[]> =>
    fetch(`${API_BASE_URL}/api/platforms`).then(handleJson<Platform[]>),

  // Admin endpoints (token required)
  admin: {
    // Articles
    getArticles: (token: string): Promise<Article[]> =>
      fetch(`${API_BASE_URL}/api/admin/articles`, {
        headers: {
          ...authHeaders(token),
        },
      }).then(handleJson<Article[]>),

    createArticle: (token: string, payload: Partial<Article>): Promise<Article> =>
      fetch(`${API_BASE_URL}/api/admin/articles`, {
        method: 'POST',
        headers: {
          ...jsonHeaders,
          ...authHeaders(token),
        },
        body: JSON.stringify(payload),
      }).then(handleJson<Article>),

    updateArticle: (token: string, id: string, payload: Partial<Article>): Promise<Article> =>
      fetch(`${API_BASE_URL}/api/admin/articles/${id}`, {
        method: 'PUT',
        headers: {
          ...jsonHeaders,
          ...authHeaders(token),
        },
        body: JSON.stringify(payload),
      }).then(handleJson<Article>),

    deleteArticle: (token: string, id: string): Promise<void> =>
      fetch(`${API_BASE_URL}/api/admin/articles/${id}`, {
        method: 'DELETE',
        headers: authHeaders(token),
      }).then(() => {}),

    uploadArticleCover: (
      token: string,
      id: string,
      file: File,
    ): Promise<Article> => {
      const form = new FormData();
      form.append('file', file);
      return fetch(`${API_BASE_URL}/api/admin/articles/${id}/cover`, {
        method: 'POST',
        headers: authHeaders(token),
        body: form,
      }).then(handleJson<Article>);
    },

    uploadArticleContent: (
      token: string,
      id: string,
      file: File,
    ): Promise<Article> => {
      const form = new FormData();
      form.append('file', file);
      return fetch(`${API_BASE_URL}/api/admin/articles/${id}/content`, {
        method: 'POST',
        headers: authHeaders(token),
        body: form,
      }).then(handleJson<Article>);
    },

    // Upload a .zip archive (Obsidian export): one .md file + its images.
    uploadArticleArchive: (
      token: string,
      id: string,
      file: File,
    ): Promise<Article> => {
      const form = new FormData();
      form.append('file', file);
      return fetch(`${API_BASE_URL}/api/admin/articles/${id}/archive`, {
        method: 'POST',
        headers: authHeaders(token),
        body: form,
      }).then(handleJson<Article>);
    },

    // Playlists
    getPlaylists: (token: string): Promise<Playlist[]> =>
      fetch(`${API_BASE_URL}/api/admin/playlists`, {
        headers: authHeaders(token),
      }).then(handleJson<Playlist[]>),

    createPlaylist: (token: string, payload: Partial<Playlist>): Promise<Playlist> =>
      fetch(`${API_BASE_URL}/api/admin/playlists`, {
        method: 'POST',
        headers: {
          ...jsonHeaders,
          ...authHeaders(token),
        },
        body: JSON.stringify(payload),
      }).then(handleJson<Playlist>),

    updatePlaylist: (
      token: string,
      id: string,
      payload: Partial<Playlist>,
    ): Promise<Playlist> =>
      fetch(`${API_BASE_URL}/api/admin/playlists/${id}`, {
        method: 'PUT',
        headers: {
          ...jsonHeaders,
          ...authHeaders(token),
        },
        body: JSON.stringify(payload),
      }).then(handleJson<Playlist>),

    deletePlaylist: (token: string, id: string): Promise<void> =>
      fetch(`${API_BASE_URL}/api/admin/playlists/${id}`, {
        method: 'DELETE',
        headers: authHeaders(token),
      }).then(() => {}),

    // Tracks
    addTrackToPlaylist: (
      token: string,
      playlistId: string,
      payload: Partial<Track>,
    ): Promise<Track> =>
      fetch(`${API_BASE_URL}/api/admin/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
          ...jsonHeaders,
          ...authHeaders(token),
        },
        body: JSON.stringify(payload),
      }).then(handleJson<Track>),

    updateTrack: (
      token: string,
      id: string,
      payload: Partial<Track>,
    ): Promise<Track> =>
      fetch(`${API_BASE_URL}/api/admin/tracks/${id}`, {
        method: 'PUT',
        headers: {
          ...jsonHeaders,
          ...authHeaders(token),
        },
        body: JSON.stringify(payload),
      }).then(handleJson<Track>),

    deleteTrack: (token: string, id: string): Promise<void> =>
      fetch(`${API_BASE_URL}/api/admin/tracks/${id}`, {
        method: 'DELETE',
        headers: authHeaders(token),
      }).then(() => {}),

    reorderTracks: (
      token: string,
      playlistId: string,
      trackIds: string[],
    ): Promise<void> =>
      fetch(`${API_BASE_URL}/api/admin/playlists/${playlistId}/tracks/reorder`, {
        method: 'PUT',
        headers: {
          ...jsonHeaders,
          ...authHeaders(token),
        },
        body: JSON.stringify(trackIds),
      }).then(() => {}),

    uploadTrackAudio: (
      token: string,
      trackId: string,
      file: File,
    ): Promise<Track> => {
      const form = new FormData();
      form.append('file', file);
      return fetch(`${API_BASE_URL}/api/admin/tracks/${trackId}/audio`, {
        method: 'POST',
        headers: authHeaders(token),
        body: form,
      }).then(handleJson<Track>);
    },

    // Music sources
    addSourceToTrack: (
      token: string,
      trackId: string,
      payload: Partial<MusicSource>,
    ): Promise<MusicSource> =>
      fetch(`${API_BASE_URL}/api/admin/tracks/${trackId}/sources`, {
        method: 'POST',
        headers: {
          ...jsonHeaders,
          ...authHeaders(token),
        },
        body: JSON.stringify(payload),
      }).then(handleJson<MusicSource>),

    updateSource: (
      token: string,
      id: string,
      payload: Partial<MusicSource>,
    ): Promise<MusicSource> =>
      fetch(`${API_BASE_URL}/api/admin/sources/${id}`, {
        method: 'PUT',
        headers: {
          ...jsonHeaders,
          ...authHeaders(token),
        },
        body: JSON.stringify(payload),
      }).then(handleJson<MusicSource>),

    deleteSource: (token: string, id: string): Promise<void> =>
      fetch(`${API_BASE_URL}/api/admin/sources/${id}`, {
        method: 'DELETE',
        headers: authHeaders(token),
      }).then(() => {}),

    // Platforms
    createPlatform: (
      token: string,
      payload: Partial<Platform>,
    ): Promise<Platform> =>
      fetch(`${API_BASE_URL}/api/admin/platforms`, {
        method: 'POST',
        headers: {
          ...jsonHeaders,
          ...authHeaders(token),
        },
        body: JSON.stringify(payload),
      }).then(handleJson<Platform>),

    updatePlatform: (
      token: string,
      id: string,
      payload: Partial<Platform>,
    ): Promise<Platform> =>
      fetch(`${API_BASE_URL}/api/admin/platforms/${id}`, {
        method: 'PUT',
        headers: {
          ...jsonHeaders,
          ...authHeaders(token),
        },
        body: JSON.stringify(payload),
      }).then(handleJson<Platform>),

    deletePlatform: (token: string, id: string): Promise<void> =>
      fetch(`${API_BASE_URL}/api/admin/platforms/${id}`, {
        method: 'DELETE',
        headers: authHeaders(token),
      }).then(() => {}),
  },
};
