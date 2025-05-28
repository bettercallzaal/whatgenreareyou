'use client';

import { useState, useEffect } from 'react';
import { SignInButton, useSignIn } from '@farcaster/auth-kit';

const MUSIC_KEYWORDS = {
  'EDM': ['edm', 'electronic', 'rave', 'festival', 'dance', 'beats'],
  'Hip-Hop': ['hiphop', 'rap', 'beats', 'mc', 'rhymes'],
  'Rock': ['rock', 'guitar', 'band', 'metal', 'punk'],
  'Pop': ['pop', 'mainstream', 'charts', 'hits'],
  'Jazz': ['jazz', 'blues', 'saxophone', 'trumpet', 'improvisation'],
  'Classical': ['classical', 'orchestra', 'symphony', 'composer'],
  'R&B': ['rnb', 'soul', 'rhythm', 'blues'],
  'Indie': ['indie', 'alternative', 'underground'],
  'Country': ['country', 'folk', 'western', 'nashville'],
  'Metal': ['metal', 'heavy', 'thrash', 'hardcore'],
};

const GENRE_DESCRIPTIONS = {
  'EDM': "Your casts reveal your love for electronic vibes and high energy! You're all about those beats and drops.",
  'Hip-Hop': "Your words flow like a rapper's rhymes. You've got that hip-hop soul in your digital presence.",
  'Rock': "You're a digital rockstar! Your casts have that raw, authentic energy that rocks.",
  'Pop': "Your content is catchy and appealing, just like a perfect pop song!",
  'Jazz': "You're smooth and sophisticated, improvising through conversations like a jazz master.",
  'Classical': "Your casts are composed with elegance and timeless quality.",
  'R&B': "Your presence is smooth and soulful, bringing those R&B vibes to Farcaster.",
  'Indie': "You're unique and authentic, marching to the beat of your own drum.",
  'Country': "You tell stories like a country song, authentic and from the heart.",
  'Metal': "Your intensity and passion come through in every cast!"
};

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const { isSignedIn, userData, signOut } = useSignIn();

  const analyzeCasts = async () => {
    setIsAnalyzing(true);
    try {
      if (!userData?.fid) {
        throw new Error('No FID found');
      }

      // Fetch user's casts using Neynar API
      const response = await fetch(`https://api.neynar.com/v2/farcaster/casts/user?fid=${userData.fid}&limit=50`, {
        headers: {
          'api_key': process.env.NEXT_PUBLIC_NEYNAR_API_KEY || ''
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch casts');
      }

      const data = await response.json();
      const casts = data.casts || [];
      
      // Analyze the casts for music-related keywords
      const genreScores = {};
      
      casts.forEach(cast => {
        const text = cast.text.toLowerCase();
        Object.entries(MUSIC_KEYWORDS).forEach(([genre, keywords]) => {
          keywords.forEach(keyword => {
            if (text.includes(keyword.toLowerCase())) {
              genreScores[genre] = (genreScores[genre] || 0) + 1;
            }
          });
        });
      });
      
      // Find the genre with the highest score
      const topGenre = Object.entries(genreScores)
        .sort(([,a], [,b]) => b - a)
        [0]?.[0] || Object.keys(MUSIC_KEYWORDS)[0];
      
      setResult(topGenre);
    } catch (error) {
      console.error('Error analyzing casts:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (isSignedIn && userData?.fid && !result && !isAnalyzing) {
      analyzeCasts();
    }
  }, [isSignedIn, userData]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 p-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          What Music Genre Are You?
        </h1>

        {!isSignedIn ? (
          <div className="text-center">
            <p className="mb-4">Connect with Farcaster to discover your music genre based on your casts!</p>
            <SignInButton />
          </div>
        ) : isAnalyzing ? (
          <div className="text-center">
            <p className="mb-4">Analyzing your Farcaster presence...</p>
            <div className="animate-pulse w-16 h-16 mx-auto bg-purple-200 rounded-full"></div>
          </div>
        ) : result ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">You're {result}!</h2>
            <p className="mb-6">{GENRE_DESCRIPTIONS[result]}</p>
            <div className="space-y-4">
              <button
                onClick={() => {
                  setResult(null);
                  analyzeCasts();
                }}
                className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition"
              >
                Analyze Again
              </button>
              <button
                onClick={signOut}
                className="block w-full text-purple-600 hover:text-purple-700 transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
