import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import ReviewCard from '../components/ReviewCard';
import PersonCard from '../components/PersonCard';
import MovieCard from '../components/MovieCard';

const FALLBACK_POSTER = 'https://placehold.co/300x450/141414/666666?text=No+Image';
const FALLBACK_BG     = 'https://placehold.co/1280x720/141414/333333?text=';

export default function TitleDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [title, setTitle]       = useState(null);
  const [reviews, setReviews]   = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading]   = useState(true);
  const [rating, setRating]     = useState(0);
  const [comment, setComment]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [titleRes, reviewsRes] = await Promise.all([
          api.get(`/titles/${id}`),
          api.get(`/reviews/title/${id}`),
        ]);
        setTitle(titleRes.data);
        setReviews(reviewsRes.data);

        if (user) {
          const [checkRes, wishRes] = await Promise.all([
            api.get(`/reviews/check/${id}`),
            api.get(`/wishlist/check/${id}`),
          ]);
          if (checkRes.data) {
            setMyReview(checkRes.data);
            setRating(checkRes.data.rating);
            setComment(checkRes.data.comment || '');
          }
          setInWishlist(wishRes.data.inWishlist);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id, user]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!rating) return;
    setSubmitting(true);
    setReviewMsg('');
    try {
      await api.post('/reviews', { title_id: parseInt(id), rating, comment });
      setReviewMsg('Review saved!');
      const [reviewsRes, checkRes] = await Promise.all([
        api.get(`/reviews/title/${id}`),
        api.get(`/reviews/check/${id}`),
      ]);
      setReviews(reviewsRes.data);
      setMyReview(checkRes.data);
      const titleRes = await api.get(`/titles/${id}`);
      setTitle(titleRes.data);
    } catch (err) {
      setReviewMsg(err.response?.data?.message || 'Error saving review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Delete your review?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      setMyReview(null);
      setRating(0);
      setComment('');
      const [reviewsRes, titleRes] = await Promise.all([
        api.get(`/reviews/title/${id}`),
        api.get(`/titles/${id}`),
      ]);
      setReviews(reviewsRes.data);
      setTitle(titleRes.data);
    } catch {}
  };

  const handleWishlist = async () => {
    if (!user) return;
    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await api.delete(`/wishlist/${id}`);
        setInWishlist(false);
      } else {
        await api.post('/wishlist', { title_id: parseInt(id) });
        setInWishlist(true);
      }
    } catch {}
    setWishlistLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-4xl animate-pulse">🍿</div>
      </div>
    );
  }

  if (!title) {
    return (
      <div className="text-center py-20">
        <p className="text-2xl font-bold text-white">Title not found</p>
        <Link to="/browse" className="text-ps-red hover:underline mt-4 inline-block">← Back to Browse</Link>
      </div>
    );
  }

  const year = title.release_date ? new Date(title.release_date).getFullYear() : '';
  const avgRating = parseFloat(title.avg_rating);
  const directors = title.cast?.filter((c) => c.role === 'Director') || [];
  const actors    = title.cast?.filter((c) => c.role === 'Actor') || [];

  return (
    <div>
      {/* Backdrop */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img
          src={title.cover_url || FALLBACK_BG + encodeURIComponent(title.title)}
          alt={title.title}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = FALLBACK_BG + encodeURIComponent(title.title); }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ps-bg via-ps-bg/50 to-transparent" />
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0 w-40 md:w-56 mx-auto md:mx-0">
            <img
              src={title.poster_url || FALLBACK_POSTER}
              alt={title.title}
              className="w-full rounded-xl shadow-2xl border border-ps-border"
              onError={(e) => { e.target.src = FALLBACK_POSTER; }}
            />
          </div>

          {/* Info */}
          <div className="flex-1 pt-2 md:pt-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">{title.title}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-ps-muted">
                  <span>{year}</span>
                  <span className="badge bg-ps-elevated text-ps-text">
                    {title.type}
                  </span>
                  {title.genres?.map((g) => (
                    <Link
                      key={g.genre_id}
                      to={`/browse?genre=${encodeURIComponent(g.genre_name)}`}
                      className="badge bg-ps-elevated text-ps-muted hover:text-white hover:bg-ps-border transition-colors"
                    >
                      {g.genre_name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Wishlist btn */}
              {user && (
                <button
                  onClick={handleWishlist}
                  disabled={wishlistLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors text-sm font-medium ${
                    inWishlist
                      ? 'bg-ps-red/20 border-ps-red text-ps-red hover:bg-red-900/30'
                      : 'border-ps-border text-ps-muted hover:border-white hover:text-white'
                  }`}
                >
                  <svg className="w-4 h-4" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  {inWishlist ? 'In Watchlist' : 'Add to Watchlist'}
                </button>
              )}
            </div>

            {/* Rating display */}
            {avgRating > 0 && (
              <div className="flex items-center gap-3 mt-4">
                <div className="flex items-center gap-2 bg-ps-card px-4 py-2 rounded-lg border border-ps-border">
                  <svg className="w-6 h-6 text-ps-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-2xl font-bold text-white">{avgRating.toFixed(1)}</span>
                  <span className="text-ps-muted">/10</span>
                </div>
                <span className="text-ps-muted text-sm">{title.review_count} rating{title.review_count !== 1 ? 's' : ''}</span>
              </div>
            )}

            {/* Summary */}
            {title.summary && (
              <p className="mt-4 text-ps-text leading-relaxed max-w-2xl">{title.summary}</p>
            )}

            {/* Director */}
            {directors.length > 0 && (
              <p className="mt-3 text-sm text-ps-muted">
                <span className="text-ps-text font-medium">Directed by: </span>
                {directors.map((d, i) => (
                  <span key={d.people_id}>
                    <Link to={`/person/${d.people_id}`} className="text-ps-red hover:underline">{d.name}</Link>
                    {i < directors.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </p>
            )}

            {/* Trailer */}
            {title.trailer_url && (
              <button
                onClick={() => setShowTrailer(true)}
                className="inline-flex items-center gap-2 mt-4 bg-ps-elevated border border-ps-border hover:border-ps-muted px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 text-ps-red" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Trailer
              </button>
            )}
          </div>
        </div>

        {/* Cast */}
        {actors.length > 0 && (
          <section className="mt-12">
            <h2 className="section-title">Cast</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {actors.map((c) => (
                <PersonCard
                  key={c.cast_id}
                  person={{ people_id: c.people_id, name: c.name, picture_url: c.picture_url, character: c.character_name, role: c.role }}
                />
              ))}
            </div>
          </section>
        )}

        {/* Rate & Review */}
        <section className="mt-12">
          <h2 className="section-title">Rate & Review</h2>
          {user ? (
            <form onSubmit={handleSubmitReview} className="card p-6 max-w-2xl">
              <p className="text-sm font-medium text-ps-text mb-3">Your Rating</p>
              <StarRating value={rating} onChange={setRating} size="lg" />
              <div className="mt-4">
                <label className="block text-sm font-medium text-ps-text mb-1.5">Review (optional)</label>
                <textarea
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Share your thoughts…"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 mt-4">
                <button type="submit" disabled={!rating || submitting} className="btn-primary">
                  {submitting ? 'Saving…' : myReview ? 'Update Review' : 'Submit Review'}
                </button>
                {myReview && (
                  <button
                    type="button"
                    onClick={() => handleDeleteReview(myReview.review_id)}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    Delete my review
                  </button>
                )}
              </div>
              {reviewMsg && (
                <p className={`mt-2 text-sm ${reviewMsg.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                  {reviewMsg}
                </p>
              )}
            </form>
          ) : (
            <div className="card p-6 max-w-2xl text-center">
              <p className="text-ps-muted mb-4">Sign in to rate and review this title.</p>
              <Link to="/login" className="btn-primary">Sign In to Rate</Link>
            </div>
          )}
        </section>

        {/* Reviews list */}
        <section className="mt-10">
          <h2 className="section-title">
            User Reviews
            {reviews.length > 0 && <span className="text-ps-muted text-lg font-normal ml-2">({reviews.length})</span>}
          </h2>
          {reviews.length === 0 ? (
            <p className="text-ps-muted">No reviews yet. Be the first to review!</p>
          ) : (
            <div className="space-y-4 max-w-2xl">
              {reviews.map((r) => (
                <ReviewCard key={r.review_id} review={r} onDelete={handleDeleteReview} />
              ))}
            </div>
          )}
        </section>

        {/* Similar titles */}
        {title.similar?.length > 0 && (
          <section className="mt-12 mb-6">
            <h2 className="section-title">Similar Titles</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {title.similar.map((t) => <MovieCard key={t.title_id} title={t} />)}
            </div>
          </section>
        )}
      </div>

      {/* Trailer Modal */}
      {showTrailer && title.trailer_url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setShowTrailer(false)}>
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-red-600 rounded-full text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <iframe
              src={(() => {
                const url = title.trailer_url;
                try {
                  let videoId = '';
                  if (url.includes('youtube.com/watch')) {
                    videoId = new URL(url).searchParams.get('v');
                  } else if (url.includes('youtu.be/')) {
                    videoId = url.split('youtu.be/')[1].split('?')[0];
                  }
                  return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
                } catch {
                  return url;
                }
              })()}
              title="Trailer"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}
