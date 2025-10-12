import React from 'react';
interface PlaylistManagerProps {
  mood?: string;
}

interface Playlist {
  name: string;
  mood: string;
  tracks: string[];
}

const FAVORITES_KEY = 'skybuddy_favorite_tracks';

function getStoredFavorites(): string[] {
  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveFavorites(favs: string[]) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}
const LOCAL_KEY = 'skybuddy_playlists';

function getStoredPlaylists(): Playlist[] {
  try {
    const data = localStorage.getItem(LOCAL_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function savePlaylists(playlists: Playlist[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(playlists));
}

export const PlaylistManager: React.FC<PlaylistManagerProps> = ({ mood }) => {
  const [playlists, setPlaylists] = React.useState<Playlist[]>(() => getStoredPlaylists());
  const [newName, setNewName] = React.useState('');
  const [favorites, setFavorites] = React.useState<string[]>(() => getStoredFavorites());

  // Filter playlists by mood if provided
  const filtered = mood ? playlists.filter(p => p.mood === mood) : playlists;

  function handleAdd() {
    if (!newName.trim()) return;
    const newPl = { name: newName.trim(), mood: mood || 'General', tracks: [] };
    const updated = [...playlists, newPl];
    setPlaylists(updated);
    savePlaylists(updated);
    setNewName('');
  }

  function handleDelete(idx: number) {
    const updated = playlists.filter((_, i) => i !== idx);
    setPlaylists(updated);
    savePlaylists(updated);
  }

  // Track management state
  const [trackInputs, setTrackInputs] = React.useState<{ [playlistIdx: number]: string }>({});
  const [editingTrack, setEditingTrack] = React.useState<{ playlistIdx: number; trackIdx: number; value: string } | null>(null);
  // Favorite/unfavorite a track
  function handleToggleFavorite(track: string) {
    let updated: string[];
    if (favorites.includes(track)) {
      updated = favorites.filter(f => f !== track);
    } else {
      updated = [...favorites, track];
    }
    setFavorites(updated);
    saveFavorites(updated);
  }

  // Add a track to a playlist
  function handleAddTrack(playlistIdx: number) {
    const input = trackInputs[playlistIdx]?.trim();
    if (!input) return;
    const updated = playlists.map((pl, idx) =>
      idx === playlistIdx ? { ...pl, tracks: [...pl.tracks, input] } : pl
    );
    setPlaylists(updated);
    savePlaylists(updated);
    setTrackInputs(inputs => ({ ...inputs, [playlistIdx]: '' }));
  }

  // Delete a track from a playlist
  function handleDeleteTrack(playlistIdx: number, trackIdx: number) {
    const updated = playlists.map((pl, idx) =>
      idx === playlistIdx ? { ...pl, tracks: pl.tracks.filter((_, tIdx) => tIdx !== trackIdx) } : pl
    );
    setPlaylists(updated);
    savePlaylists(updated);
  }

  // Start editing a track
  function handleEditTrackStart(playlistIdx: number, trackIdx: number, value: string) {
    setEditingTrack({ playlistIdx, trackIdx, value });
  }

  // Save edited track
  function handleEditTrackSave() {
    if (!editingTrack) return;
    const { playlistIdx, trackIdx, value } = editingTrack;
    if (!value.trim()) return;
    const updated = playlists.map((pl, idx) =>
      idx === playlistIdx
        ? { ...pl, tracks: pl.tracks.map((t, tIdx) => (tIdx === trackIdx ? value.trim() : t)) }
        : pl
    );
    setPlaylists(updated);
    savePlaylists(updated);
    setEditingTrack(null);
  }

  // Cancel editing
  function handleEditTrackCancel() {
    setEditingTrack(null);
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white/10 rounded-xl shadow p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">Your Playlists</h2>

      {/* Favorites section */}
      <div className="mb-6">
        <div className="text-lg font-semibold mb-2 flex items-center gap-2">
          <span role="img" aria-label="star">⭐</span> Favorites
        </div>
        {favorites.length === 0 ? (
          <div className="text-xs text-gray-400">No favorite tracks yet.</div>
        ) : (
          <ul className="space-y-1">
            {favorites.map((track, idx) => (
              <li key={idx} className="flex items-center gap-2 text-xs">
                <span>{track}</span>
                <button className="text-yellow-500 hover:text-yellow-700 text-xs" onClick={() => handleToggleFavorite(track)}>
                  Unfavorite
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ul className="space-y-4">
        {filtered.map((pl, idx) => {
          const playlistIdx = playlists.indexOf(pl);
          return (
            <li key={idx} className="bg-white/5 rounded p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{pl.name}</div>
                  <div className="text-xs text-gray-400">Mood: {pl.mood}</div>
                </div>
                <button className="text-red-400 hover:text-red-600" onClick={() => handleDelete(playlistIdx)}>Delete</button>
              </div>
              {/* Track list */}
              <div className="mt-2 ml-2">
                <div className="text-sm font-medium mb-1">Tracks:</div>
                <ul className="space-y-1">
                  {pl.tracks.length === 0 && <li className="text-xs text-gray-400">No tracks yet.</li>}
                  {pl.tracks.map((track, tIdx) => (
                    <li key={tIdx} className="flex items-center gap-2">
                      {editingTrack && editingTrack.playlistIdx === playlistIdx && editingTrack.trackIdx === tIdx ? (
                        <>
                          <input
                            className="px-2 py-1 rounded border border-gray-300 text-xs"
                            value={editingTrack.value}
                            onChange={e => setEditingTrack({ ...editingTrack, value: e.target.value })}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleEditTrackSave();
                              if (e.key === 'Escape') handleEditTrackCancel();
                            }}
                            autoFocus
                          />
                          <button className="text-green-500 text-xs" onClick={handleEditTrackSave}>Save</button>
                          <button className="text-gray-400 text-xs" onClick={handleEditTrackCancel}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <span className="text-xs">{track}</span>
                          <button className="text-yellow-500 hover:text-yellow-700 text-xs" onClick={() => handleToggleFavorite(track)}>
                            {favorites.includes(track) ? '★' : '☆'}
                          </button>
                          <button className="text-blue-400 hover:text-blue-600 text-xs" onClick={() => handleEditTrackStart(playlistIdx, tIdx, track)}>Edit</button>
                          <button className="text-red-400 hover:text-red-600 text-xs" onClick={() => handleDeleteTrack(playlistIdx, tIdx)}>Delete</button>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
                {/* Add track input */}
                <div className="flex gap-2 mt-2">
                  <input
                    className="px-2 py-1 rounded border border-gray-300 text-xs bg-white/80"
                    placeholder="Add new track (title or URL)"
                    value={trackInputs[playlistIdx] || ''}
                    onChange={e => setTrackInputs(inputs => ({ ...inputs, [playlistIdx]: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddTrack(playlistIdx); }}
                  />
                  <button
                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                    onClick={() => handleAddTrack(playlistIdx)}
                  >
                    Add Track
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="flex gap-2 mt-4">
        <input
          className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80"
          placeholder="New playlist name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
        />
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleAdd}
        >
          Add Playlist
        </button>
      </div>
    </div>
  );
};
