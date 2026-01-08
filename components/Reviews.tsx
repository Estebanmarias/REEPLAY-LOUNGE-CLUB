import React from 'react';
import { Star, Quote } from 'lucide-react';
import { ReviewItem } from '../types';

const reviews: ReviewItem[] = [
  { id: 1, user: "Tola A.", rating: 5, text: "The vibe is unmatched in Ogbomosho. Lighting is crazy!" },
  { id: 2, user: "Seyi D.", rating: 5, text: "Best suya and cold drinks. The outdoor section is perfect." },
  { id: 3, user: "Mike R.", rating: 5, text: "Sound system hits hard. Definitely the best spot for nightlife." },
  { id: 4, user: "Anita K.", rating: 5, text: "Classy and safe. Staff treats you like royalty." },
];

interface ReviewsProps {
  theme?: 'dark' | 'light';
}

const Reviews: React.FC<ReviewsProps> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';

  return (
    <section className={`py-20 px-6 backdrop-blur-sm border-y transition-colors duration-500
      ${isDark ? 'bg-black/30 border-white/5' : 'bg-white/30 border-white/20'}`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center justify-center mb-12 text-center">
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-6 h-6 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
            ))}
          </div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Rated 5.0 Stars</h2>
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>(Verified Google Reviews)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((review) => (
            <div key={review.id} 
              className={`p-6 rounded-2xl backdrop-blur-md shadow-lg flex flex-col relative group transition-all duration-300
                ${isDark 
                  ? 'bg-black/40 border border-white/10 hover:border-purple-500/30' 
                  : 'bg-white/60 border border-white/40 hover:border-purple-300 shadow-purple-500/5 hover:bg-white/80'}
              `}
            >
              <Quote className={`absolute top-4 right-4 w-8 h-8 transition-colors
                ${isDark ? 'text-white/5 group-hover:text-purple-500/20' : 'text-purple-900/5 group-hover:text-purple-500/20'}`} 
              />
              <p className={`italic mb-6 relative z-10 leading-relaxed ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                "{review.text}"
              </p>
              <div className={`mt-auto pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-sm">
                  {review.user}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;