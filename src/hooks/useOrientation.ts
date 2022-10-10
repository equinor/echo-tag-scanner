import { useEffect, useState } from 'react';
import { getOrientation } from '../utils';

export function useOrientation() {
  const [currentOrientation, setOrientation] = useState<
    'landscape' | 'portrait'
  >(getOrientation());

  useEffect(function mount() {
    const handleChange = () => {
      setOrientation(getOrientation());
    };

    const id = window.addEventListener('resize', () => handleChange());
    return window.removeEventListener('resize', () => handleChange());
  }, []);

  return currentOrientation;
}
