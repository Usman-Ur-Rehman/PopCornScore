import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import MovieCard from '../components/MovieCard';

const SORT_OPTIONS = [
  { value: 'rating',  label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest',  label: 'Newest First' },
  { value: 'oldest',  label: 'Oldest First' },
];

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [titles, setTitles] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get('search') || '';
  const type   = searchParams.get('type')   || '';
  const genre  = searchParams.get('genre')  || '';
  const sort   = searchParams.get('sort')   || 'rating';
  const page   = parseInt(searchParams.get('page') || '1');

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const setPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', p);
    setSearchParams(next);
  };

  useEffect(() => {
    api.get('/genres').then((r) => setGenres(r.data)).catch(() => {});
  }, []);

  const fetchTitles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (type)   params.set('type', type);
      if (genre)  params.set('genre', genre);
      if (sort)   params.set('sort', sort);
      params.set('page', page);
      const { data } = await api.get(`/titles?${params.toString()}`);
      setTitles(data.titles);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, type, genre, sort, page]);

  useEffect(() => { fetchTitles(); }, [fetchTitles]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Browse</h1>
        {search && (
          <p className="text-ps-muted mt-1">
            Results for <span className="text-white font-medium">&ldquo;{search}&rdquo;</span>
            {total > 0 && ` — ${total} found`}
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Type filter */}
        <div className="flex gap-2">
          {[['', 'All'], ['Movie', 'Movies'], ['TV Show', 'TV Shows']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setParam('type', val)}
              className={`badge px-3 py-1.5 border transition-colors ${
                type === val
                  ? 'bg-ps-red border-ps-red text-white'
                  : 'bg-transparent border-ps-border text-ps-muted hover:border-ps-muted hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setParam('sort', e.target.value)}
          className="bg-ps-elevated border border-ps-border text-ps-text text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-ps-red"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Clear filters */}
        {(search || type || genre) && (
          <button
            onClick={() => setSearchParams({})}
            className="text-sm text-ps-muted hover:text-white transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear filters
          </button>
        )}
      </div>

      {/* Genre pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setParam('genre', '')}
          className={`badge px-3 py-1 border transition-colors ${
            !genre ? 'bg-ps-red border-ps-red text-white' : 'bg-transparent border-ps-border text-ps-muted hover:border-ps-muted'
          }`}
        >
          All Genres
        </button>
        {genres.map((g) => (
          <button
            key={g.genre_id}
            onClick={() => setParam('genre', genre === g.genre_name ? '' : g.genre_name)}
            className={`badge px-3 py-1 border transition-colors ${
              genre === g.genre_name
                ? 'bg-ps-red border-ps-red text-white'
                : 'bg-transparent border-ps-border text-ps-muted hover:border-ps-muted hover:text-white'
            }`}
          >
            {g.genre_name}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="text-center space-y-3">
            <div className="text-4xl animate-pulse">🍿</div>
            <p className="text-ps-muted">Loading…</p>
          </div>
        </div>
      ) : titles.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🎬</p>
          <p className="text-xl font-semibold text-white mb-2">No results found</p>
          <p className="text-ps-muted">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {titles.map((t) => <MovieCard key={t.title_id} title={t} />)}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="btn-secondary px-4 py-2 text-sm disabled:opacity-30"
              >
                ← Prev
              </button>
              <span className="text-ps-muted text-sm px-4">
                Page {page} of {pages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === pages}
                className="btn-secondary px-4 py-2 text-sm disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
