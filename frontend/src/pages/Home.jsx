import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import MovieCard from '../components/MovieCard';

const FALLBACK_BG = 'https://placehold.co/1280x720/141414/333333?text=PopcornScore';

function HorizontalRow({ title, items, emptyMsg }) {
  return (
    <section className="mb-12">
      <h2 className="section-title">{title}</h2>
      {items.length === 0 ? (
        <p className="text-ps-muted">{emptyMsg}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {items.map((t) => <MovieCard key={t.title_id} title={t} />)}
        </div>
      )}
    </section>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [hero, setHero] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendRes, topRes] = await Promise.all([
          api.get('/titles/trending'),
          api.get('/titles/top-rated'),
        ]);
        setTrending(trendRes.data);
        setTopRated(topRes.data);
        if (trendRes.data.length > 0) setHero(trendRes.data[0]);

        if (user) {
          const recRes = await api.get('/titles/recommendations');
          setRecommendations(recRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="text-5xl animate-pulse">🍿</div>
          <p className="text-ps-muted">Loading PopcornScore…</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      {hero && (
        <div className="relative h-[60vh] min-h-[420px] overflow-hidden">
          <img
            src={hero.cover_url || FALLBACK_BG}
            alt={hero.title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => { e.target.src = FALLBACK_BG; }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ps-bg via-ps-bg/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-ps-bg via-transparent to-transparent" />

          <div className="relative z-10 flex items-end h-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
              <div className="max-w-xl">
                <span className="badge bg-ps-red text-white mb-3 inline-block">
                  {hero.type === 'TV Show' ? 'TV Show' : 'Movie'}
                </span>
                <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">{hero.title}</h1>
                <p className="text-ps-muted mt-3 line-clamp-2 text-sm md:text-base">{hero.summary}</p>
                <div className="flex items-center gap-4 mt-5">
                  <Link to={`/title/${hero.title_id}`} className="btn-primary">
                    View Details
                  </Link>
                  {parseFloat(hero.avg_rating) > 0 && (
                    <div className="flex items-center gap-2 bg-black/50 px-3 py-2 rounded-lg">
                      <svg className="w-5 h-5 text-ps-gold" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-ps-gold font-bold">{parseFloat(hero.avg_rating).toFixed(1)}</span>
                      <span className="text-ps-muted text-sm">/10</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {user && recommendations.length > 0 && (
          <HorizontalRow
            title="✨ Recommended for You"
            items={recommendations.slice(0, 6)}
            emptyMsg="Rate more movies to get recommendations."
          />
        )}

        <HorizontalRow
          title="🔥 Trending Now"
          items={trending.slice(0, 12)}
          emptyMsg="No trending titles yet."
        />

        <HorizontalRow
          title="⭐ Top Rated"
          items={topRated.slice(0, 12)}
          emptyMsg="No rated titles yet."
        />

        {/* CTA for non-logged-in users */}
        {!user && (
          <div className="card p-8 md:p-12 text-center mt-8 bg-gradient-to-br from-ps-card to-ps-elevated">
            <span className="text-5xl mb-4 block">🎬</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Track everything you watch
            </h2>
            <p className="text-ps-muted mb-6 max-w-md mx-auto">
              Create a free account to rate movies, build your watchlist, and get personalized recommendations.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link to="/register" className="btn-primary px-8">Get Started Free</Link>
              <Link to="/login" className="btn-secondary px-8">Sign In</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
