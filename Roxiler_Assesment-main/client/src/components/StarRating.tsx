import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  size = 'md',
  readonly = false,
}) => {
  const starSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const starSize = starSizes[size];

  const handleClick = (index: number) => {
    if (!readonly && onChange) {
      onChange(index + 1);
    }
  };

  return (
    <div className="flex">
      {[...Array(5)].map((_, index) => {
        const filled = index < value;
        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(index)}
            disabled={readonly}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer'} p-0.5 focus:outline-none transition-colors`}
            aria-label={`${index + 1} stars`}
          >
            <Star
              size={starSize}
              fill={filled ? '#F59E0B' : 'none'}
              stroke={filled ? '#F59E0B' : '#D1D5DB'}
              className={`transition-all ${
                !readonly && 'hover:scale-110'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;