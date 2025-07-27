import React from "react";
import { Star } from "lucide-react"; // Menggunakan icon Star dari lucide-react

const StarRating = ({ rating, onRatingChange, hoverRating, onHoverChange }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex gap-1">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          onMouseEnter={() => onHoverChange(star)}
          onMouseLeave={() => onHoverChange(0)}
          className="focus:outline-none"
        >
          <Star
            size={28}
            className={`transition-colors ${
              (hoverRating || rating) >= star ? "text-yellow-400" : "text-gray-300"
            }`}
            fill={(hoverRating || rating) >= star ? "#facc15" : "none"}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;