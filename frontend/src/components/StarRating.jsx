import { useState } from 'react';

export default function StarRating({ value = 0, onChange, readonly = false, size = 'md' }) {
  const [hover, setHover] = useState(0);
  const starCount = 10;

  const sizeClass = size === 'lg' ? 'w-8 h-8' : size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: starCount }, (_, i) => {
        const starVal = i + 1;
        const filled = starVal <= (readonly ? value : (hover || value));
        return (
          <button
            key={i}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange && onChange(starVal)}
            onMouseEnter={() => !readonly && setHover(starVal)}
            onMouseLeave={() => !readonly && setHover(0)}
            className={`transition-transform duration-100 ${!readonly ? 'hover:scale-125 cursor-pointer' : 'cursor-default'}`}
          >
            <svg
              className={`${sizeClass} ${filled ? 'text-ps-gold' : 'text-ps-border'} transition-colors duration-100`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        );
      })}
      {value > 0 && (
        <span className="ml-2 text-ps-gold font-bold">
          {value}<span className="text-ps-muted font-normal text-sm">/10</span>
        </span>
      )}
    </div>
  );
}
