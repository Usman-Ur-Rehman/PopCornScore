import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import StarRating from '../components/StarRating';

const FALLBACK = 'https://placehold.co/80x120/141414/666666?text=?';

export default function RatingHistory() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reviews/user')
      .then(({ data }) => setReviews(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (reviewId) => {
    if (!confirm('Delete this review?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews((prev) => prev.filter((r) => r.review_id !== reviewId));
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-white mb-2">My Ratings</h1>
      <p className="text-ps-muted mb-8">
        {reviews.length} title{reviews.length !== 1 ? 's' : ''} rated
      </p>

      {reviews.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">⭐</p>
          <h2 className="text-xl font-semibold text-white mb-2">No ratings yet</h2>
          <p className="text-ps-muted mb-6">Start rating movies and shows to build your history.</p>
          <Link to="/browse" className="btn-primary">Browse Titles</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => {
            const year = r.release_date ? new Date(r.release_date).getFullYear() : '';
            const date = new Date(r.review_date).toLocaleDateString('en-US', {
              year: 'numeric', month: 'short', day: 'numeric'
            });
            return (
              <div key={r.review_id} className="card p-4 flex items-start gap-4 hover:border-ps-border/80 transition-colors">
                <Link to={`/title/${r.title_id}`} className="flex-shrink-0">
                  <img
                    src={r.poster_url || FALLBACK}
                    alt={r.title}
                    className="w-14 h-20 object-cover rounded-lg border border-ps-border"
                    onError={(e) => { e.target.src = FALLBACK; }}
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link to={`/title/${r.title_id}`} className="font-semibold text-white hover:text-ps-red transition-colors">
                        {r.title}
                      </Link>
                      <p className="text-xs text-ps-muted mt-0.5">
                        {year} · {r.type} · Rated on {date}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(r.review_id)}
                      className="text-ps-muted hover:text-red-400 transition-colors flex-shrink-0"
                      title="Delete rating"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-2">
                    <StarRating value={r.rating} readonly size="sm" />
                  </div>
                  {r.comment && (
                    <p className="mt-2 text-sm text-ps-muted line-clamp-2">{r.comment}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
