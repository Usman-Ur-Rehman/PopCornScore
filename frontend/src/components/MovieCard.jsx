import { Link } from 'react-router-dom';

const FALLBACK = 'https://placehold.co/300x450/141414/666666?text=No+Image';

function StarIcon({ filled }) {
  return (
    <svg className={`w-3.5 h-3.5 ${filled ? 'text-ps-gold' : 'text-ps-border'}`} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

export default function MovieCard({ title }) {
  const year = title.release_date ? new Date(title.release_date).getFullYear() : '';
  const rating = title.avg_rating ? parseFloat(title.avg_rating).toFixed(1) : null;

  return (
    <Link to={`/title/${title.title_id}`} className="group block">
      <div className="card transition-all duration-300 hover:border-ps-red/50 hover:shadow-xl hover:shadow-ps-red/10 hover:-translate-y-1">
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={title.poster_url || FALLBACK}
            alt={title.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { e.target.src = FALLBACK; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Type badge */}
          <div className="absolute top-2 left-2">
            <span className={`badge ${title.type === 'Movie' ? 'bg-ps-red/90 text-white' : 'bg-purple-600/90 text-white'}`}>
              {title.type === 'TV Show' ? 'TV' : 'Movie'}
            </span>
          </div>

          {/* Rating overlay */}
          {rating && (
            <div className="absolute top-2 right-2 bg-black/70 rounded-lg px-2 py-1 flex items-center gap-1">
              <StarIcon filled />
              <span className="text-ps-gold text-xs font-bold">{rating}</span>
            </div>
          )}
        </div>

        <div className="p-3">
          <h3 className="font-semibold text-sm text-white truncate group-hover:text-ps-red transition-colors">
            {title.title}
          </h3>
          <p className="text-ps-muted text-xs mt-0.5">{year}</p>
        </div>
      </div>
    </Link>
  );
}
