import React from 'react';
import './AnimeBackground.css';

const AnimeBackground = () => {
  // 创建多个樱花花瓣
  const petals = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 10 + Math.random() * 10,
    size: 20 + Math.random() * 15
  }));

  return (
    <div className="anime-background">
      {/* 樱花花瓣 */}
      {petals.map(petal => (
        <div
          key={petal.id}
          className="sakura-petal"
          style={{
            left: `${petal.left}%`,
            animationDelay: `${petal.delay}s`,
            animationDuration: `${petal.duration}s`,
            width: `${petal.size}px`,
            height: `${petal.size}px`
          }}
        >
          🌸
        </div>
      ))}
      
      {/* 云朵装饰 */}
      <div className="cloud cloud-1">☁️</div>
      <div className="cloud cloud-2">☁️</div>
      <div className="cloud cloud-3">☁️</div>
      
      {/* 星星装饰 */}
      <div className="star star-1">✨</div>
      <div className="star star-2">✨</div>
      <div className="star star-3">✨</div>
      <div className="star star-4">✨</div>
    </div>
  );
};

export default AnimeBackground;

