import React, { useState, useCallback } from 'react';
import { generateOffers } from '@/services/geminiService';
import type { Offer } from '@/types';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { OfferCard } from '@/components/OfferCard';
import { Loader } from '@/components/Loader';
import { Slider } from '@/components/Slider';
import JSZip from 'jszip';
import { DownloadIcon } from '@/components/icons/DownloadIcon';

const App: React.FC = () => {
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [occasion, setOccasion] = useState('');
  const [isAutoOccasion, setIsAutoOccasion] = useState(false);
  const [location, setLocation] = useState('');
  const [keywords, setKeywords] = useState('');
  const [postLength, setPostLength] = useState('Medium');
  const [keywordRichness, setKeywordRichness] = useState(5);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [wishlist, setWishlist] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadSource = async () => {
    // This function is intentionally left blank in the downloadable source
    // to prevent an infinitely recursive file.
    alert('Source code download initiated from the web version.');
  };

  const handleFetchOffers = useCallback(async (append = false) => {
    if (!businessType || (!isAutoOccasion && !occasion) || !keywords) {
      setError('Please fill out Business Type, Occasion, and Keywords to generate offers.');
      return;
    }
    setIsLoading(true);
    setError(null);
    if (!append) {
      setOffers([]);
    }

    try {
      const generatedOffers = await generateOffers(businessName, businessType, isAutoOccasion ? 'Automatic' : occasion, keywords, postLength, keywordRichness, location);
      if (append) {
        setOffers(prev => [...prev, ...generatedOffers]);
      } else {
        setOffers(generatedOffers);
      }
    } catch (e) {
      console.error(e);
      setError('Failed to generate offers. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [businessName, businessType, occasion, isAutoOccasion, keywords, postLength, keywordRichness, location]);

  const handleToggleWishlist = useCallback((offerToToggle: Offer) => {
    setWishlist(prev => {
        const exists = prev.some(item => item.id === offerToToggle.id);
        if (exists) {
            return prev.filter(item => item.id !== offerToToggle.id);
        } else {
            return [...prev, offerToToggle];
        }
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-3xl mx-auto">
        <header className="text-center mb-10">
          <div className="flex justify-center items-center gap-4 relative">
            <h1 className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 pb-2">
              AI Post Offer Generator
            </h1>
            <button
              onClick={handleDownloadSource}
              className="p-2 bg-slate-800/50 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors duration-200"
              title="Download Source Code"
              aria-label="Download Source Code"
            >
              <DownloadIcon className="w-5 h-5" />
            </button>
          </div>
          <p className="text-slate-400 mt-2 text-lg">
            Turn your ideas into irresistible offers. Just tell us about your business, the occasion, and your keywords.
          </p>
        </header>

        <main className="bg-slate-800/50 p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              id="businessName"
              label="Business Name (Optional)"
              placeholder="e.g., The Daily Grind"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
            <Input
              id="location"
              label="Location (Optional)"
              placeholder="e.g., New York City"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="space-y-6 mt-6">
            <Input
              id="businessType"
              label="What is your business? *"
              placeholder="e.g., A cozy coffee shop"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              required
            />
             <div>
              <div className="flex justify-between items-center mb-2">
                  <label htmlFor="occasion" className="block text-sm font-medium text-slate-300">What's the occasion? *</label>
                  <div className="flex items-center">
                      <input id="auto-occasion" type="checkbox" checked={isAutoOccasion} onChange={(e) => setIsAutoOccasion(e.target.checked)} className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500" />
                      <label htmlFor="auto-occasion" className="ml-2 text-sm font-medium text-slate-400">Auto-detect</label>
                  </div>
              </div>
              <Input
                id="occasion"
                label=""
                placeholder="e.g., Valentine's Day, Summer Sale"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                disabled={isAutoOccasion}
                aria-label="Occasion input"
              />
            </div>
            <Input
              id="keywords"
              label="Keywords or special wishes? *"
              placeholder="e.g., romantic, 2-for-1 deal, fresh pastries"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              required
            />
            <div>
              <label className="block mb-3 text-sm font-medium text-slate-300">
                Post Length
              </label>
              <div className="flex items-center gap-x-6 gap-y-2 flex-wrap">
                {['Short', 'Medium', 'Long'].map((length) => (
                  <div key={length} className="flex items-center">
                    <input
                      id={`length-${length}`}
                      type="radio"
                      name="postLength"
                      value={length}
                      checked={postLength === length}
                      onChange={(e) => setPostLength(e.target.value)}
                      className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 focus:ring-purple-500 ring-offset-slate-800 focus:ring-2"
                    />
                    <label htmlFor={`length-${length}`} className="ml-2 text-sm font-medium text-slate-300 cursor-pointer">
                      {length}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <Slider
              id="keywordRichness"
              label="Keyword Richness"
              min={1}
              max={10}
              step={1}
              value={keywordRichness}
              onChange={(e) => setKeywordRichness(parseInt(e.target.value, 10))}
            />
          </div>
          <div className="mt-8">
            <Button onClick={() => handleFetchOffers(false)} disabled={isLoading}>
              {isLoading && offers.length === 0 ? 'Generating...' : '✨ Generate Offers'}
            </Button>
          </div>
        </main>
        
        <div className="mt-12">
          {isLoading && offers.length === 0 && <Loader />}
          {error && <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>}
          
          {offers.length > 0 && (
            <>
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-center text-slate-300">Your Generated Offers</h2>
                {offers.map((offer) => (
                  <OfferCard 
                    key={offer.id} 
                    offer={offer} 
                    onToggleWishlist={handleToggleWishlist}
                    isWishlisted={wishlist.some(item => item.id === offer.id)}
                  />
                ))}
              </div>
              <div className="mt-8">
                <Button onClick={() => handleFetchOffers(true)} disabled={isLoading}>
                  {isLoading && offers.length > 0 ? 'Generating...' : '✨ Generate More Offers'}
                </Button>
              </div>
            </>
          )}

          {wishlist.length > 0 && (
            <div className="mt-16">
               <h2 className="text-3xl font-extrabold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-blue-500 pb-2">My Wishlist</h2>
               <div className="space-y-6">
                {wishlist.map((offer) => (
                    <OfferCard 
                      key={`wish-${offer.id}`} 
                      offer={offer} 
                      onToggleWishlist={handleToggleWishlist}
                      isWishlisted={true}
                    />
                  ))}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;