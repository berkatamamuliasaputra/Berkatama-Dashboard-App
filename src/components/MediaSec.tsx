import React, { useState } from 'react';
import { Play, Music, ExternalLink } from 'lucide-react';

export const MediaSec: React.FC = () => {
  const [mediaTab, setMediaTab] = useState<'youtube' | 'spotify'>('youtube');
  const [inputUrl, setInputUrl] = useState('');
  const [activeEmbedUrl, setActiveEmbedUrl] = useState('');

  const spotifyPresets = [
    { label: 'Global Top 50', url: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M' },
    { label: 'Top Indonesia', url: 'https://open.spotify.com/playlist/37i9dQZF1DX3WIwhsrnDkK' },
    { label: 'Chill Lofi Beats', url: 'https://open.spotify.com/playlist/0vvXsWCC9xrXsKd4eabhtp' },
  ];

  const handlePlay = () => {
    if (!inputUrl.trim()) return;
    if (mediaTab === 'spotify') {
      try {
        const u = new URL(inputUrl.trim());
        const path = u.pathname.replace(/^\/intl-[a-z]{2}\//, '/');
        setActiveEmbedUrl(`https://open.spotify.com/embed${path}?utm_source=generator&theme=0`);
      } catch {
        alert('Link Spotify tidak valid');
      }
    } else {
      try {
        const u = new URL(inputUrl.trim());
        let vid = u.searchParams.get('v');
        if (u.hostname === 'youtu.be') vid = u.pathname.slice(1);
        if (vid) {
          setActiveEmbedUrl(`https://www.youtube.com/embed/${vid}?autoplay=1`);
        } else {
          setActiveEmbedUrl(inputUrl);
        }
      } catch {
        alert('Link YouTube tidak valid');
      }
    }
  };

  return (
    <div id="sec-extra" className="section active">
      <div className="pg-hd">
        <h4>Media Streaming Player</h4>
        <p>Putar musik &amp; lofi audio favorit sambil bekerja di Purchasing</p>
      </div>

      <div className="content flex-fill flex flex-col gap-3">
        <div className="media-tabs">
          <button
            className={`media-tab ${mediaTab === 'youtube' ? 'active' : ''}`}
            onClick={() => setMediaTab('youtube')}
          >
            <Music className="w-3.5 h-3.5 text-rose-500" /> YouTube Video / Lofi
          </button>
          <button
            className={`media-tab ${mediaTab === 'spotify' ? 'active' : ''}`}
            onClick={() => setMediaTab('spotify')}
          >
            <Music className="w-3.5 h-3.5 text-emerald-500" /> Spotify Playlist
          </button>
        </div>

        <div className="data-card p-3">
          <div className="flex gap-2 items-center flex-wrap">
            <input
              className="form-ctrl text-xs flex-1 min-w-[220px]"
              placeholder={mediaTab === 'spotify' ? 'Tempel URL Spotify (https://open.spotify.com/playlist/...)' : 'Tempel URL YouTube (https://www.youtube.com/watch?v=...)'}
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handlePlay()}
            />
            <button className="btn-primary-sm" onClick={handlePlay}>
              <Play className="w-3.5 h-3.5" /> Putar
            </button>
          </div>

          {mediaTab === 'spotify' && (
            <div className="flex gap-2 items-center mt-2 pt-2 border-t border-slate-200 text-xs">
              <span className="text-slate-500 text-[11px]">Preset Populer:</span>
              {spotifyPresets.map((p, idx) => (
                <button
                  key={idx}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-semibold"
                  onClick={() => {
                    setInputUrl(p.url);
                    setActiveEmbedUrl(`https://open.spotify.com/embed${new URL(p.url).pathname}?utm_source=generator&theme=0`);
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Player Box */}
        <div className="flex-1 bg-black rounded-xl overflow-hidden min-h-[340px] relative">
          {!activeEmbedUrl ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[340px] text-slate-500 p-6 text-center">
              <Music className="w-12 h-12 opacity-20 mb-3" />
              <p className="font-semibold text-sm">Pilih layanan dan tempel URL untuk memutar audio/video</p>
              <div className="flex gap-4 mt-4 text-xs">
                <a href="https://open.spotify.com" target="_blank" rel="noreferrer" className="text-blue-400 flex items-center gap-1">
                  Spotify <ExternalLink className="w-3 h-3" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-blue-400 flex items-center gap-1">
                  YouTube <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : (
            <iframe
              src={activeEmbedUrl}
              className="w-full h-full min-h-[360px] border-0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              title="Media Player"
            />
          )}
        </div>
      </div>
    </div>
  );
};
