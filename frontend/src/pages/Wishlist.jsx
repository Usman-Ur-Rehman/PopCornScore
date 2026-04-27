import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const FALLBACK = 'https://placehold.co/300x450/141414/666666?text=No+Image';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/wishlist')
      .then(({ data }) => setItems(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const remove = async (titleId) => {
    try {
      await api.delete(`/wishlist/${titleId}`);
      setItems((prev) => prev.filter((i) => i.title_id !== titleId));
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-4xl animate-pulse">🍿</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-white mb-2">My Watchlist</h1>
      <p className="text-ps-muted mb-8">{items.length} title{items.length !== 1 ? 's' : ''} saved</p>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🎬</p>
          <h2 className="text-xl font-semibold text-white mb-2">Your watchlist is empty</h2>
          <p className="text-ps-muted mb-6">Browse movies and TV shows and add them to watch later.</p>
          <Link to="/browse" className="btn-primary">Browse Titles</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {items.map((item) => {
            const year = item.release_date ? new Date(item.release_date).getFullYear() : '';
            const rating = item.avg_rating ? parseFloat(item.avg_rating).toFixed(1) : null;
            return (
              <div key={item.title_id} className="group relative">
                <Link to={`/title/${item.title_id}`} className="block card hover:border-ps-red/50 hover:-translate-y-1 transition-all duration-300">
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <img
                      src={item.poster_url || FALLBACK}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { e.target.src = FALLBACK; }}
                    />
                    {rating && (
                      <div className="absolute top-2 right-2 bg-black/70 rounded-lg px-2 py-1 flex items-center gap-1">
                        <svg className="w-3 h-3 text-ps-gold" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-ps-gold text-xs font-bold">{rating}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm text-white truncate">{item.title}</h3>
                    <p className="text-ps-muted text-xs mt-0.5">{year}</p>
                  </div>
                </Link>

                {/* Remove button */}
                <button
                  onClick={() => remove(item.title_id)}
                  className="absolute top-2 left-2 bg-black/70 hover:bg-ps-red text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                  title="Remove from watchlist"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
