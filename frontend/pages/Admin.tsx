import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Article, Playlist, Track, Platform, MusicSource } from '../types';
import { LogOut, FileText, Music, Disc, List } from '../components/Icons';

// Subcomponents for the dashboard
const ArticlesList = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [showNewModal, setShowNewModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPublished, setEditPublished] = useState(true);
  const [editPlaylistId, setEditPlaylistId] = useState<string>('');
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [editContentFile, setEditContentFile] = useState<File | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadArticles = () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    api.admin
      .getArticles(token)
      .then(setArticles)
      .catch(console.error);
  };

  const loadPlaylists = () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    api.admin
      .getPlaylists(token)
      .then(setPlaylists)
      .catch(console.error);
  };

  useEffect(() => {
    loadArticles();
    loadPlaylists();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No auth token');
        return;
      }
      await api.admin.createArticle(token, {
        title,
        description,
        is_published: isPublished,
      } as Partial<Article>);
      setTitle('');
      setDescription('');
      setIsPublished(true);
      setShowNewModal(false);
      loadArticles();
    } catch (err) {
      setError('Failed to create article');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (a: Article) => {
    setEditing(a);
    setEditTitle(a.title || '');
    setEditDescription(a.description || '');
    setEditPublished(!!a.is_published);
    setEditPlaylistId(a.playlist_id || '');
    setEditCoverFile(null);
    setEditContentFile(null);
    setError('');
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No auth token');
        return;
      }

      const updated = await api.admin.updateArticle(token, editing.id, {
        title: editTitle,
        description: editDescription,
        is_published: editPublished,
        playlist_id: editPlaylistId || null,
      } as Partial<Article>);

      if (editCoverFile) {
        await api.admin.uploadArticleCover(token, updated.id, editCoverFile);
      }
      if (editContentFile) {
        await api.admin.uploadArticleContent(token, updated.id, editContentFile);
      }

      setShowEditModal(false);
      setEditing(null);
      loadArticles();
    } catch (err) {
      setError('Failed to update article');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setDeletingId(id);
    try {
      await api.admin.deleteArticle(token, id);
      loadArticles();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Articles</h2>
        <button
          onClick={() => setShowNewModal(true)}
          className="bg-dark text-white px-4 py-2 rounded hover:bg-gray-800 text-sm"
        >
          New Article
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Description</th>
              <th className="p-4">Created</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {articles.map(a => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{a.title}</td>
                <td className="p-4 text-gray-600">{a.description}</td>
                <td className="p-4 text-gray-500">{new Date(a.created_at).toLocaleDateString()}</td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => openEdit(a)}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    disabled={deletingId === a.id}
                    className="text-red-600 text-sm hover:underline disabled:opacity-50"
                  >
                    {deletingId === a.id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showNewModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold mb-4">New Article</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-accent focus:border-transparent outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-accent focus:border-transparent outline-none text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="new-article-published"
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="h-4 w-4 text-accent border-gray-300 rounded"
                />
                <label htmlFor="new-article-published" className="text-sm text-gray-700">
                  Published
                </label>
              </div>
              {error && <div className="text-sm text-red-500">{error}</div>}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3 py-2 text-sm rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm rounded bg-dark text-white hover:bg-black disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Edit Article</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-accent focus:border-transparent outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Playlist</label>
                  <select
                    value={editPlaylistId}
                    onChange={(e) => setEditPlaylistId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-accent focus:border-transparent outline-none text-sm"
                  >
                    <option value="">(none)</option>
                    {playlists.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-accent focus:border-transparent outline-none text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="edit-article-published"
                  type="checkbox"
                  checked={editPublished}
                  onChange={(e) => setEditPublished(e.target.checked)}
                  className="h-4 w-4 text-accent border-gray-300 rounded"
                />
                <label htmlFor="edit-article-published" className="text-sm text-gray-700">
                  Published
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cover image (JPG/PNG/WebP)</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setEditCoverFile(e.target.files?.[0] || null)}
                    className="w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Markdown (.md)</label>
                  <input
                    type="file"
                    accept=".md,text/markdown"
                    onChange={(e) => setEditContentFile(e.target.files?.[0] || null)}
                    className="w-full text-sm"
                  />
                </div>
              </div>
              {error && <div className="text-sm text-red-500">{error}</div>}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditing(null);
                  }}
                  className="px-3 py-2 text-sm rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm rounded bg-dark text-white hover:bg-black disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const MusicManager = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [sourcesByTrack, setSourcesByTrack] = useState<Record<string, MusicSource[]>>({});

  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const [newPlaylistExternalUrl, setNewPlaylistExternalUrl] = useState('');
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);

  const [editPlaylistTitle, setEditPlaylistTitle] = useState('');
  const [editPlaylistDescription, setEditPlaylistDescription] = useState('');
  const [editPlaylistExternalUrl, setEditPlaylistExternalUrl] = useState('');
  const [savingPlaylist, setSavingPlaylist] = useState(false);

  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackArtist, setNewTrackArtist] = useState('');
  const [newTrackDuration, setNewTrackDuration] = useState('');
  const [addingTrack, setAddingTrack] = useState(false);

  const [audioUploadingId, setAudioUploadingId] = useState<string | null>(null);
  const [sourceCreatingFor, setSourceCreatingFor] = useState<string | null>(null);
  const [newSourcePlatformId, setNewSourcePlatformId] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');

  const token = () => localStorage.getItem('token');

  const loadPlaylists = () => {
    const t = token();
    if (!t) return;
    api.admin
      .getPlaylists(t)
      .then(setPlaylists)
      .catch(console.error);
  };

  const loadPlatforms = () => {
    api.getPlatforms().then(setPlatforms).catch(console.error);
  };

  const loadTracks = (playlistId: string) => {
    if (!playlistId) {
      setTracks([]);
      return;
    }
    api.getPlaylistTracks(playlistId).then(setTracks).catch(console.error);
  };

  const loadSources = async (trackId: string) => {
    try {
      const s = await api.getTrackSources(trackId);
      setSourcesByTrack((prev) => ({ ...prev, [trackId]: s }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadPlaylists();
    loadPlatforms();
  }, []);

  useEffect(() => {
    if (!selectedPlaylistId) return;
    const p = playlists.find((x) => x.id === selectedPlaylistId);
    setEditPlaylistTitle(p?.title || '');
    setEditPlaylistDescription(p?.description || '');
    setEditPlaylistExternalUrl(p?.external_url || '');
    loadTracks(selectedPlaylistId);
  }, [selectedPlaylistId]);

  useEffect(() => {
    tracks.forEach((t) => {
      loadSources(t.id);
    });
  }, [tracks]);

  const createPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = token();
    if (!t) return;
    setCreatingPlaylist(true);
    try {
      const created = await api.admin.createPlaylist(t, {
        title: newPlaylistTitle,
        description: newPlaylistDescription,
        external_url: newPlaylistExternalUrl || null,
      } as Partial<Playlist>);
      setNewPlaylistTitle('');
      setNewPlaylistDescription('');
      setNewPlaylistExternalUrl('');
      loadPlaylists();
      setSelectedPlaylistId(created.id);
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingPlaylist(false);
    }
  };

  const savePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = token();
    if (!t || !selectedPlaylistId) return;
    setSavingPlaylist(true);
    try {
      await api.admin.updatePlaylist(t, selectedPlaylistId, {
        title: editPlaylistTitle,
        description: editPlaylistDescription,
        external_url: editPlaylistExternalUrl || null,
      } as Partial<Playlist>);
      loadPlaylists();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingPlaylist(false);
    }
  };

  const deletePlaylist = async () => {
    const t = token();
    if (!t || !selectedPlaylistId) return;
    try {
      await api.admin.deletePlaylist(t, selectedPlaylistId);
      setSelectedPlaylistId('');
      setTracks([]);
      loadPlaylists();
    } catch (err) {
      console.error(err);
    }
  };

  const addTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = token();
    if (!t || !selectedPlaylistId) return;
    setAddingTrack(true);
    try {
      await api.admin.addTrackToPlaylist(t, selectedPlaylistId, {
        title: newTrackTitle,
        artist: newTrackArtist,
        duration: newTrackDuration || null,
        playlist_id: selectedPlaylistId,
      } as Partial<Track>);
      setNewTrackTitle('');
      setNewTrackArtist('');
      setNewTrackDuration('');
      loadTracks(selectedPlaylistId);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingTrack(false);
    }
  };

  const deleteTrack = async (trackId: string) => {
    const t = token();
    if (!t) return;
    try {
      await api.admin.deleteTrack(t, trackId);
      loadTracks(selectedPlaylistId);
    } catch (err) {
      console.error(err);
    }
  };

  const uploadAudio = async (trackId: string, file: File) => {
    const t = token();
    if (!t) return;
    setAudioUploadingId(trackId);
    try {
      await api.admin.uploadTrackAudio(t, trackId, file);
      loadTracks(selectedPlaylistId);
    } catch (err) {
      console.error(err);
    } finally {
      setAudioUploadingId(null);
    }
  };

  const createSource = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = token();
    if (!t || !sourceCreatingFor) return;
    try {
      await api.admin.addSourceToTrack(t, sourceCreatingFor, {
        platform_id: newSourcePlatformId,
        url: newSourceUrl,
        track_id: sourceCreatingFor,
      } as Partial<MusicSource>);
      setNewSourcePlatformId('');
      setNewSourceUrl('');
      setSourceCreatingFor(null);
      loadSources(sourceCreatingFor);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteSource = async (sourceId: string, trackId: string) => {
    const t = token();
    if (!t) return;
    try {
      await api.admin.deleteSource(t, sourceId);
      loadSources(trackId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold mb-4">Playlists</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select playlist</label>
            <select
              value={selectedPlaylistId}
              onChange={(e) => setSelectedPlaylistId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-accent focus:border-transparent outline-none text-sm"
            >
              <option value="">(choose)</option>
              {playlists.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Create playlist</h3>
              <form onSubmit={createPlaylist} className="space-y-3">
                <input
                  value={newPlaylistTitle}
                  onChange={(e) => setNewPlaylistTitle(e.target.value)}
                  placeholder="Title"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
                <textarea
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                  placeholder="Description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
                <input
                  value={newPlaylistExternalUrl}
                  onChange={(e) => setNewPlaylistExternalUrl(e.target.value)}
                  placeholder="External URL (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
                <button
                  type="submit"
                  disabled={creatingPlaylist}
                  className="w-full bg-dark text-white px-4 py-2 rounded hover:bg-gray-800 text-sm disabled:opacity-50"
                >
                  {creatingPlaylist ? 'Creating...' : 'Create'}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            {!selectedPlaylistId ? (
              <div className="text-gray-500 text-sm">Select a playlist to manage tracks.</div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">Edit playlist</h3>
                  <form onSubmit={savePlaylist} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      value={editPlaylistTitle}
                      onChange={(e) => setEditPlaylistTitle(e.target.value)}
                      placeholder="Title"
                      required
                      className="px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                    <input
                      value={editPlaylistExternalUrl}
                      onChange={(e) => setEditPlaylistExternalUrl(e.target.value)}
                      placeholder="External URL"
                      className="px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                    <button
                      type="submit"
                      disabled={savingPlaylist}
                      className="bg-dark text-white px-4 py-2 rounded hover:bg-gray-800 text-sm disabled:opacity-50"
                    >
                      {savingPlaylist ? 'Saving...' : 'Save'}
                    </button>
                    <textarea
                      value={editPlaylistDescription}
                      onChange={(e) => setEditPlaylistDescription(e.target.value)}
                      placeholder="Description"
                      rows={3}
                      className="md:col-span-3 px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  </form>
                  <div className="mt-2">
                    <button
                      onClick={deletePlaylist}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Delete playlist
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">Add track</h3>
                  <form onSubmit={addTrack} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                      value={newTrackTitle}
                      onChange={(e) => setNewTrackTitle(e.target.value)}
                      placeholder="Title"
                      required
                      className="px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                    <input
                      value={newTrackArtist}
                      onChange={(e) => setNewTrackArtist(e.target.value)}
                      placeholder="Artist"
                      required
                      className="px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                    <input
                      value={newTrackDuration}
                      onChange={(e) => setNewTrackDuration(e.target.value)}
                      placeholder="Duration (e.g. 3:45)"
                      className="px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                    <button
                      type="submit"
                      disabled={addingTrack}
                      className="bg-dark text-white px-4 py-2 rounded hover:bg-gray-800 text-sm disabled:opacity-50"
                    >
                      {addingTrack ? 'Adding...' : 'Add'}
                    </button>
                  </form>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Tracks</h3>
                  <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500">
                        <tr>
                          <th className="p-3">Title</th>
                          <th className="p-3">Artist</th>
                          <th className="p-3">Audio</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {tracks.map((tr) => (
                          <tr key={tr.id} className="hover:bg-gray-50 align-top">
                            <td className="p-3 font-medium">{tr.title}</td>
                            <td className="p-3 text-gray-600">{tr.artist}</td>
                            <td className="p-3 text-sm text-gray-600">
                              <div className="flex flex-col gap-2">
                                <div>
                                  {tr.audio_file_path ? (
                                    <span className="text-green-700">uploaded</span>
                                  ) : (
                                    <span className="text-gray-400">no file</span>
                                  )}
                                </div>
                                <input
                                  type="file"
                                  accept="audio/mpeg,audio/mp3"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) uploadAudio(tr.id, f);
                                  }}
                                  className="text-xs"
                                  disabled={audioUploadingId === tr.id}
                                />
                                {audioUploadingId === tr.id && (
                                  <div className="text-xs text-gray-500">Uploading...</div>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-right space-x-2">
                              <button
                                onClick={() => setSourceCreatingFor(tr.id)}
                                className="text-blue-600 text-sm hover:underline"
                              >
                                Add link
                              </button>
                              <button
                                onClick={() => deleteTrack(tr.id)}
                                className="text-red-600 text-sm hover:underline"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 space-y-6">
                    {tracks.map((tr) => (
                      <div key={`sources_${tr.id}`} className="bg-white rounded-lg border border-gray-100 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="font-semibold text-sm">Links: {tr.title}</div>
                          <button
                            onClick={() => setSourceCreatingFor(tr.id)}
                            className="text-blue-600 text-sm hover:underline"
                          >
                            Add link
                          </button>
                        </div>
                        <div className="space-y-2">
                          {(sourcesByTrack[tr.id] || []).map((s) => (
                            <div key={s.id} className="flex items-center justify-between gap-4">
                              <div className="text-sm text-gray-700 truncate">
                                <span className="font-medium">
                                  {platforms.find((p) => p.id === s.platform_id)?.name || 'Platform'}
                                </span>
                                <span className="text-gray-400"> — </span>
                                <a className="text-blue-600 hover:underline" href={s.url} target="_blank" rel="noreferrer">
                                  {s.url}
                                </a>
                              </div>
                              <button
                                onClick={() => deleteSource(s.id, tr.id)}
                                className="text-red-600 text-sm hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                          ))}
                          {(sourcesByTrack[tr.id] || []).length === 0 && (
                            <div className="text-sm text-gray-400">No links yet.</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {sourceCreatingFor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Add link</h3>
            <form onSubmit={createSource} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                <select
                  value={newSourcePlatformId}
                  onChange={(e) => setNewSourcePlatformId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="">(choose)</option>
                  {platforms.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  value={newSourceUrl}
                  onChange={(e) => setNewSourceUrl(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSourceCreatingFor(null);
                    setNewSourcePlatformId('');
                    setNewSourceUrl('');
                  }}
                  className="px-3 py-2 text-sm rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm rounded bg-dark text-white hover:bg-black">
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminLogin: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.login(username, password);
      localStorage.setItem('token', res.access_token);
      onLogin();
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
        <h1 className="text-2xl font-bold mb-6 text-center">SSOTB Admin</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
              placeholder="admin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
              placeholder="Enter admin password (admin123)"
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-dark text-white py-2 rounded font-medium hover:bg-black transition-colors disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Access Panel'}
          </button>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'articles' | 'music'>('articles');

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold tracking-tight">SSOTB <span className="text-accent">Admin</span></h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <button 
            onClick={() => setActiveTab('articles')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'articles' ? 'bg-gray-100 text-dark' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <FileText size={18} />
            Articles
          </button>
          <button 
            onClick={() => setActiveTab('music')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'music' ? 'bg-gray-100 text-dark' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Disc size={18} />
            Music & Playlists
          </button>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {activeTab === 'articles' ? <ArticlesList /> : <MusicManager />}
      </main>
    </div>
  );
};

export { AdminLogin, AdminDashboard };
