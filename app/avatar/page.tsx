"use client";
import React, { useState, useCallback, useEffect } from 'react';
import multiavatar from '@multiavatar/multiavatar/esm';  // ESM import — works out of the box!

function AvatarComponent() {
  const [currentSeed, setCurrentSeed] = useState('');
  const [selectedSeed, setSelectedSeed] = useState<string | null>(null);

  // Generate gaming-style random seed
  const generateNewSeed = useCallback(() => {
    const randomId = Math.random().toString(36).substr(2, 9);
    const newSeed = `player-${randomId}-${Date.now().toString(36).substr(-4)}`;
    setCurrentSeed(newSeed);
  }, []);

  // Generate SVG data URL from seed
  const getAvatarUrl = useCallback((seed: string): string => {
    const svgCode = multiavatar(seed);
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgCode)))}`;
  }, []);

  // Auto-generate first avatar
  useEffect(() => {
    generateNewSeed();
  }, [generateNewSeed]);

  const handleSelect = () => {
    if (currentSeed) {
      setSelectedSeed(currentSeed);
    }
  };

  const currentUrl = currentSeed ? getAvatarUrl(currentSeed) : '';

  return (
    <div style={{ 
      padding: '30px', 
      fontFamily: 'Arial, sans-serif', 
      maxWidth: '600px', 
      margin: '0 auto',
      background: 'linear-gradient(135deg, #1a1a2e, #16213e)', 
      color: '#fff',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
    }}>
      <h2 style={{ textAlign: 'center', color: '#00ff88', marginBottom: '10px' }}>
        🎮 Gaming Avatar Generator
      </h2>
      <p style={{ textAlign: 'center', color: '#aaa', marginBottom: '30px' }}>
        Powered by <strong>@multiavatar/multiavatar</strong> — multicultural & unique!
      </p>

      {/* Current Avatar Preview */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '200px',
          height: '200px',
          margin: '0 auto 20px',
          border: '5px solid #00ff88',
          borderRadius: '50%',
          overflow: 'hidden',
          boxShadow: '0 0 30px rgba(0, 255, 136, 0.5)'
        }}>
          {currentUrl ? (
            <img 
              src={currentUrl} 
              alt="Generated Avatar" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          ) : (
            <div style={{ 
              background: '#333', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#666' 
            }}>
              Generating...
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={generateNewSeed} 
            style={{
              padding: '14px 28px',
              background: '#00ff88',
              color: '#000',
              border: 'none',
              borderRadius: '30px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 5px 15px rgba(0,255,136,0.4)'
            }}
          >
            🎲 New Avatar
          </button>
          <button 
            onClick={handleSelect} 
            disabled={!currentSeed}
            style={{
              padding: '14px 28px',
              background: currentSeed ? '#ff6b35' : '#666',
              color: '#fff',
              border: 'none',
              borderRadius: '30px',
              fontWeight: 'bold',
              cursor: currentSeed ? 'pointer' : 'not-allowed',
              opacity: currentSeed ? 1 : 0.5
            }}
          >
            ✅ Select This
          </button>
        </div>

        <div style={{ marginTop: '20px', fontSize: '14px', color: '#ccc' }}>
          <strong>Current Seed:</strong>{' '}
          <code style={{ 
            background: '#000', 
            padding: '4px 8px', 
            borderRadius: '6px',
            color: '#00ff88'
          }}>
            {currentSeed}
          </code>
          {currentUrl && (
            <>
              <br />
              <strong>Preview Link:</strong>{' '}
              <a 
                href={currentUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ color: '#00ff88', textDecoration: 'underline' }}
              >
                Open in New Tab
              </a>
              {' | '}
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(currentUrl);
                  alert('Copied current URL!');
                }} 
                style={{
                  background: 'none',
                  color: '#00ff88',
                  border: '1px solid #00ff88',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Copy URL
              </button>
            </>
          )}
        </div>
      </div>

      {/* Selected Avatar Section */}
      {selectedSeed && (
        <div style={{
          marginTop: '50px',
          padding: '25px',
          background: 'rgba(0,255,136,0.1)',
          borderRadius: '16px',
          textAlign: 'center',
          border: '2px solid #00ff88'
        }}>
          <h3 style={{ color: '#00ff88', marginTop: 0 }}>🎉 Selected Avatar Locked In!</h3>
          <img 
            src={getAvatarUrl(selectedSeed)} 
            alt="Selected Avatar" 
            style={{
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              border: '4px solid #00ff88',
              margin: '15px auto',
              display: 'block'
            }} 
          />
          <p style={{ fontSize: '14px' }}>
            <strong>Save to DB:</strong>{' '}
            <code style={{ 
              background: '#000', 
              padding: '4px 8px', 
              borderRadius: '6px',
              color: '#00ff88'
            }}>
              {selectedSeed}
            </code>
          </p>
          <p style={{ margin: '15px 0', fontSize: '14px' }}>
            <strong>Final Data URL:</strong>
          </p>
          <textarea
            value={getAvatarUrl(selectedSeed)}
            readOnly
            rows={4}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '10px',
              background: '#000',
              color: '#0f0',
              border: '1px solid #333',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}
          />
          <button 
            onClick={() => {
              navigator.clipboard.writeText(getAvatarUrl(selectedSeed));
              alert('Copied final URL!');
            }} 
            style={{
              marginTop: '10px',
              padding: '10px 20px',
              background: '#00ff88',
              color: '#000',
              border: 'none',
              borderRadius: '20px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            📋 Copy Final URL
          </button>
        </div>
      )}

      <footer style={{ 
        marginTop: '40px', 
        textAlign: 'center', 
        color: '#888', 
        fontSize: '12px' 
      }}>
        Built with <a href="https://www.npmjs.com/package/@multiavatar/multiavatar" target="_blank" rel="noopener noreferrer" style={{ color: '#00ff88' }}>
          @multiavatar/multiavatar
        </a>{' '} 
        | Store the seed, regenerate forever! 🚀
      </footer>
    </div>
  );
}

export default AvatarComponent;