import React from 'react';
import { Star } from 'lucide-react';
import { ReviewItem } from '../types';

const reviews: ReviewItem[] = [
  { id: 1, user: "Tola A.", rating: 5, text: "The vibe is unmatched in Ogbomosho. Lighting is crazy!" },
  { id: 2, user: "Seyi D.", rating: 5, text: "Best suya and cold drinks. The outdoor section is perfect." },
  { id: 3, user: "Mike R.", rating: 5, text: "Sound system hits hard. Definitely the best spot for nightlife." },
  { id: 4, user: "Anita K.", rating: 5, text: "Classy and safe. Staff treats you like royalty." },
];

const Reviews: React.FC = () => {
  return (
    <section className="py-20 px-6 bg-black/30 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col items-center justify-center mb-12 text-center">
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <h2 className="text-2xl font-bold text-white">Rated 5.0 Stars</h2>
          <span className="text-gray-400 text-sm">(4 Reviews)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white/5 border border-white/5 p-6 rounded-xl backdrop-blur-sm">
              <p className="text-gray-200 italic mb-4">"{review.text}"</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="font-bold text-purple-400 text-sm">- {review.user}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;