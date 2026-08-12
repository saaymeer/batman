import { useState } from 'react';
import { submitRating } from '@/services/requestService';
import { Star } from 'lucide-react';

/**
 * 5-star rating control — writes rating to Firestore on click.
 * @param {{ requestId: string, existingRating?: number|null }} props
 */
export default function RatingControl({ requestId, existingRating }) {
  const [hovered, setHovered] = useState(0);
  const [rating, setRating] = useState(existingRating ?? 0);
  const [submitted, setSubmitted] = useState(!!existingRating);
  const [saving, setSaving] = useState(false);

  const handleRate = async (value) => {
    if (submitted || saving) return;
    setSaving(true);
    try {
      await submitRating(requestId, value);
      setRating(value);
      setSubmitted(true);
    } catch (err) {
      console.error('Rating failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <p className="text-fog text-sm font-display">
        {submitted ? 'Thank you for your feedback!' : 'How was your experience?'}
      </p>
      <div className="flex gap-2" role="group" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = submitted ? star <= rating : star <= (hovered || rating);
          return (
            <button
              key={star}
              type="button"
              disabled={submitted || saving}
              onClick={() => handleRate(star)}
              onMouseEnter={() => !submitted && setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
              className={[
                'h-10 w-10 rounded-full flex items-center justify-center transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal',
                submitted ? 'cursor-default' : 'hover:scale-110 active:scale-95 cursor-pointer',
              ].join(' ')}
            >
              <Star
                className={`h-7 w-7 transition-colors duration-150 ${
                  filled ? 'fill-signal text-signal' : 'fill-transparent text-fog/40'
                }`}
              />
            </button>
          );
        })}
      </div>
      {saving && <p className="text-xs text-fog animate-pulse">Saving…</p>}
    </div>
  );
}
