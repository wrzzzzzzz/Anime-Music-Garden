import React, { useState, useRef, useEffect } from 'react';
import './Flower.css';

const emotionEmojis = {
  happy: '😊',
  sad: '😢',
  excited: '🤩',
  calm: '😌',
  nostalgic: '🥺',
  energetic: '⚡',
  melancholic: '🌙',
  inspired: '✨'
};

const emotionLabels = {
  happy: 'Happy',
  sad: 'Sad',
  excited: 'Excited',
  calm: 'Calm',
  nostalgic: 'Nostalgic',
  energetic: 'Energetic',
  melancholic: 'Melancholic',
  inspired: 'Inspired'
};

const Flower = ({ checkIn, onClick, allCheckIns = [] }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 });
  const flowerRef = useRef(null);
  const animationRef = useRef(null);
  const otherFlowersRef = useRef(new Set());
  
  const size = checkIn.flowerSize || 1;
  const position = checkIn.position || { x: Math.random() * 100, y: Math.random() * 100 };
  
  // Map emotion to color for display (not stored in DB)
  const emotionColorMap = {
    happy: '#FFD700',
    sad: '#4169E1',
    excited: '#FF6347',
    calm: '#98D8C8',
    nostalgic: '#DDA0DD',
    energetic: '#FF4500',
    melancholic: '#9370DB',
    inspired: '#00CED1'
  };
  const color = emotionColorMap[checkIn.emotion] || '#90EE90';
  // Always try to use animeImage - this is the image from AniList API that users see when creating check-ins
  const imageUrl = checkIn.animeImage && checkIn.animeImage.trim() !== '' ? checkIn.animeImage : null;
  const [imageError, setImageError] = useState(false);

  // Get references to other flowers for collision detection
  useEffect(() => {
    const canvas = document.getElementById('garden-canvas');
    if (!canvas) return;

    const allFlowers = canvas.querySelectorAll('.flower');
    otherFlowersRef.current.clear();
    allFlowers.forEach(flower => {
      if (flower !== flowerRef.current) {
        otherFlowersRef.current.add(flower);
      }
    });
  }, [allCheckIns]);

  useEffect(() => {
    // Create slow floating animation
    const animate = () => {
      if (flowerRef.current) {
        const container = flowerRef.current.parentElement;
        if (!container) return;

        const flowerRect = flowerRef.current.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Get current position in percentage
        let currentX = parseFloat(flowerRef.current.style.left) || position.x;
        let currentY = parseFloat(flowerRef.current.style.top) || position.y;

        // Update position (slower movement)
        let newX = currentX + direction.x * 0.015;
        let newY = currentY + direction.y * 0.015;

        // Calculate card dimensions in percentage
        const cardWidthPercent = (flowerRect.width / containerRect.width) * 100;
        const cardHeightPercent = (flowerRect.height / containerRect.height) * 100;

        // Boundary limits - ensure entire card stays within container
        const minX = 0;
        const maxX = 100 - cardWidthPercent;
        const minY = 0;
        const maxY = 100 - cardHeightPercent;

        // Check for collisions with other flowers
        otherFlowersRef.current.forEach(otherFlower => {
          if (!otherFlower || !otherFlower.style) return;
          
          const otherRect = otherFlower.getBoundingClientRect();
          const otherXPercent = parseFloat(otherFlower.style.left) || 0;
          const otherYPercent = parseFloat(otherFlower.style.top) || 0;
          
          // Calculate if cards would overlap (using percentage)
          const distanceX = Math.abs(newX - otherXPercent);
          const distanceY = Math.abs(newY - otherYPercent);
          const minDistance = cardWidthPercent * 1.3; // 30% padding to avoid overlap
          
          if (distanceX < minDistance && distanceY < minDistance) {
            // Push away from collision
            const pushAmount = 0.3;
            if (newX < otherXPercent) {
              newX = Math.max(minX, newX - pushAmount);
            } else {
              newX = Math.min(maxX, newX + pushAmount);
            }
            if (newY < otherYPercent) {
              newY = Math.max(minY, newY - pushAmount);
            } else {
              newY = Math.min(maxY, newY + pushAmount);
            }
            // Also change direction slightly to avoid getting stuck
            setDirection(prev => ({
              x: prev.x * 0.9 + (Math.random() - 0.5) * 0.2,
              y: prev.y * 0.9 + (Math.random() - 0.5) * 0.2
            }));
          }
        });

        // Bounce off edges
        if (newX <= minX || newX >= maxX) {
          setDirection(prev => ({ ...prev, x: -prev.x }));
          newX = Math.max(minX, Math.min(maxX, newX));
        }
        if (newY <= minY || newY >= maxY) {
          setDirection(prev => ({ ...prev, y: -prev.y }));
          newY = Math.max(minY, Math.min(maxY, newY));
        }

        // Update position
        currentX = newX;
        currentY = newY;

        flowerRef.current.style.left = `${currentX}%`;
        flowerRef.current.style.top = `${currentY}%`;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [direction, position]);


  return (
    <div
      ref={flowerRef}
      className="flower flower-image-container"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: `scale(${size})`,
        '--flower-color': color
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.stopPropagation();
        setIsHovered(true);
      }}
      onMouseLeave={(e) => {
        e.stopPropagation();
        setIsHovered(false);
      }}
    >
      <div className="flower-content-wrapper">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={checkIn.animeTitle || checkIn.title || 'Anime'}
            className="flower-image"
            onError={() => {
              setImageError(true);
            }}
            loading="lazy"
          />
        ) : (
          <div className="flower-placeholder" style={{ backgroundColor: color }}>
            <div className="placeholder-content">
              <div className="placeholder-icon">🎵</div>
              <div className="placeholder-title">{checkIn.title || checkIn.animeTitle || 'Music'}</div>
              {!imageUrl && (
                <div className="placeholder-hint" style={{ fontSize: '0.7rem', marginTop: '0.5rem', opacity: 0.7 }}>
                  No image
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {isHovered && checkIn.emotion && (
        <div className="flower-emotion-tooltip">
          <span className="emotion-emoji">{emotionEmojis[checkIn.emotion] || '😊'}</span>
        </div>
      )}
    </div>
  );
};

export default Flower;

