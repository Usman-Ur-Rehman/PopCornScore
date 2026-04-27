import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import MovieCard from '../components/MovieCard';

const FALLBACK_PERSON = 'https://placehold.co/300x300/141414/666666?text=No+Photo';

export default function PersonDetail() {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/people/${id}`)
      .then(({ data }) => setPerson(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-4xl animate-pulse">🍿</div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="text-center py-20">
        <p className="text-2xl font-bold text-white">Person not found</p>
        <Link to="/browse" className="text-ps-red hover:underline mt-4 inline-block">← Back</Link>
      </div>
    );
  }

  const birthYear = person.birth_date ? new Date(person.birth_date).getFullYear() : null;
  const age = birthYear ? new Date().getFullYear() - birthYear : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {/* Photo */}
        <div className="flex-shrink-0 w-40 md:w-56 mx-auto md:mx-0">
          <img
            src={person.picture_url || FALLBACK_PERSON}
            alt={person.name}
            className="w-full rounded-xl shadow-2xl border border-ps-border object-cover aspect-square"
            onError={(e) => { e.target.src = FALLBACK_PERSON; }}
          />
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold text-white">{person.name}</h1>
          {birthYear && (
            <p className="text-ps-muted mt-1">
              Born {new Date(person.birth_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              {age && ` (${age} years old)`}
            </p>
          )}
          {person.bio && (
            <p className="mt-4 text-ps-text leading-relaxed max-w-2xl">{person.bio}</p>
          )}
          {person.filmography && (
            <div className="mt-4 flex items-center gap-2 text-ps-muted text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
              <span>{person.filmography.length} credit{person.filmography.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* Filmography */}
      {person.filmography?.length > 0 && (
        <section>
          <h2 className="section-title">Filmography</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {person.filmography.map((item) => (
              <div key={`${item.title_id}-${item.role}`} className="relative">
                <MovieCard title={item} />
                <p className="text-xs text-ps-muted text-center mt-1">
                  {item.role}{item.character_name ? ` · ${item.character_name}` : ''}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
