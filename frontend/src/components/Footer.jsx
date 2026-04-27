import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-ps-card border-t border-ps-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🍿</span>
              <span className="text-lg font-bold text-white">Popcorn<span className="text-ps-red">Score</span></span>
            </div>
            <p className="text-sm text-ps-muted">
              Discover, rate, and review your favourite movies and TV shows. Share your opinions with the community.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Browse</h4>
            <ul className="space-y-2 text-sm text-ps-muted">
              <li><Link to="/browse?type=Movie" className="hover:text-white transition-colors">Movies</Link></li>
              <li><Link to="/browse?type=TV+Show" className="hover:text-white transition-colors">TV Shows</Link></li>
              <li><Link to="/browse?sort=popular" className="hover:text-white transition-colors">Trending</Link></li>
              <li><Link to="/browse?sort=rating" className="hover:text-white transition-colors">Top Rated</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Account</h4>
            <ul className="space-y-2 text-sm text-ps-muted">
              <li><Link to="/register" className="hover:text-white transition-colors">Create Account</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition-colors">Watchlist</Link></li>
              <li><Link to="/ratings" className="hover:text-white transition-colors">My Ratings</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-ps-border mt-8 pt-6 text-center text-xs text-ps-muted">
          <p>© 2026 PopcornScore · FAST-NU CL219 Database Project · Group H1</p>
        </div>
      </div>
    </footer>
  );
}
