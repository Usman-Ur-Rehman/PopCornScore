import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function PageTransition({ children }) {
  const location = useLocation();
  const [opacity, setOpacity] = useState(1);
  const prevLocationRef = useRef(location.key);

  useEffect(() => {
    if (location.key !== prevLocationRef.current) {
      setOpacity(0);
      const timer = setTimeout(() => {
        prevLocationRef.current = location.key;
        setOpacity(1);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [location.key]);

  return (
    <div
      style={{
        opacity,
        transition: 'opacity 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        willChange: 'opacity',
      }}
    >
      {children}
    </div>
  );
}
