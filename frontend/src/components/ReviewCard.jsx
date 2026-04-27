import StarRating from './StarRating';
import { useAuth } from '../context/AuthContext';

export default function ReviewCard({ review, onDelete }) {
  const { user } = useAuth();
  const date = new Date(review.review_date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-ps-elevated border border-ps-border flex items-center justify-center text-sm font-bold text-ps-text flex-shrink-0">
            {review.username?.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm text-white">{review.username}</p>
            <p className="text-xs text-ps-muted">{date}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StarRating value={review.rating} readonly size="sm" />
          {user && user.user_id === review.user_id && onDelete && (
            <button
              onClick={() => onDelete(review.review_id)}
              className="text-ps-muted hover:text-red-400 transition-colors"
              title="Delete review"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
      {review.comment && (
        <p className="mt-3 text-sm text-ps-text leading-relaxed">{review.comment}</p>
      )}
    </div>
  );
}
