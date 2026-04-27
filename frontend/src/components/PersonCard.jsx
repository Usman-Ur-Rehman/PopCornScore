import { Link } from 'react-router-dom';

const FALLBACK = 'https://placehold.co/200x200/141414/666666?text=No+Photo';

export default function PersonCard({ person }) {
  return (
    <Link to={`/person/${person.people_id}`} className="group block text-center">
      <div className="relative mx-auto w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-ps-border group-hover:border-ps-red transition-colors duration-200">
        <img
          src={person.picture_url || FALLBACK}
          alt={person.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => { e.target.src = FALLBACK; }}
        />
      </div>
      <p className="mt-2 text-xs font-semibold text-white truncate group-hover:text-ps-red transition-colors">{person.name}</p>
      {person.character && <p className="text-xs text-ps-muted truncate">{person.character}</p>}
      {person.role && !person.character && <p className="text-xs text-ps-muted">{person.role}</p>}
    </Link>
  );
}
