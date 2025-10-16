import React, { useState, useCallback } from 'react';
import type { Offer } from '../types';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { HeartIcon } from './icons/HeartIcon';

interface OfferCardProps {
  offer: Offer;
  onToggleWishlist: (offer: Offer) => void;
  isWishlisted: boolean;
}

export const OfferCard: React.FC<OfferCardProps> = ({ offer, onToggleWishlist, isWishlisted }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(offer.body).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [offer.body]);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg transition-all duration-300 hover:shadow-purple-500/10 hover:border-purple-500/50 overflow-hidden">
      {offer.imageUrl && (
        <img src={offer.imageUrl} alt={offer.title} className="w-full h-64 object-cover" />
      )}
      <div className="p-6">
        <div className="flex justify-between items-start mb-3 gap-4">
          <h3 className="text-xl font-bold text-slate-100 flex-1">{offer.title}</h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onToggleWishlist(offer)}
              className="p-2 rounded-md transition-colors duration-200 bg-slate-700 text-slate-300 hover:bg-slate-600"
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <HeartIcon className="w-4 h-4" filled={isWishlisted} />
            </button>
            <button
              onClick={handleCopy}
              className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors duration-200 ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {copied ? (
                <>
                  <CheckIcon className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <CopyIcon className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
        <p className="text-slate-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">{offer.body}</p>
      </div>
    </div>
  );
};