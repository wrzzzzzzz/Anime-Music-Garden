import React from 'react';
import './DecorativeFigures.css';

const DecorativeFigures = () => {
  return (
    <div className="decorative-figures">
      {/* Cute cloud decorations */}
      <svg className="figure figure-cloud-1" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 30 Q10 20 20 20 Q20 10 30 10 Q40 10 40 20 Q50 20 50 30 Q50 40 40 40 L20 40 Q10 40 10 30 Q10 20 20 30 Z" fill="rgba(125, 211, 252, 0.3)"/>
      </svg>
      
      <svg className="figure figure-cloud-2" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 30 Q10 20 20 20 Q20 10 30 10 Q40 10 40 20 Q50 20 50 30 Q50 40 40 40 L20 40 Q10 40 10 30 Q10 20 20 30 Z" fill="rgba(186, 230, 253, 0.3)"/>
      </svg>

      {/* Cute star decorations */}
      <svg className="figure figure-star-1" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
        <path d="M25 5 L30 18 L43 18 L33 27 L38 40 L25 32 L12 40 L17 27 L7 18 L20 18 Z" fill="rgba(125, 211, 252, 0.4)"/>
      </svg>

      <svg className="figure figure-star-2" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
        <path d="M25 5 L30 18 L43 18 L33 27 L38 40 L25 32 L12 40 L17 27 L7 18 L20 18 Z" fill="rgba(186, 230, 253, 0.3)"/>
      </svg>

      {/* Cute heart decorations */}
      <svg className="figure figure-heart-1" viewBox="0 0 50 45" xmlns="http://www.w3.org/2000/svg">
        <path d="M25 40 C25 40, 5 25, 5 15 C5 8, 10 5, 15 5 C20 5, 25 10, 25 15 C25 10, 30 5, 35 5 C40 5, 45 8, 45 15 C45 25, 25 40, 25 40 Z" fill="rgba(125, 211, 252, 0.3)"/>
      </svg>

      {/* Cute flower decorations */}
      <svg className="figure figure-flower-1" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <circle cx="30" cy="30" r="8" fill="rgba(125, 211, 252, 0.4)"/>
        <ellipse cx="30" cy="20" rx="5" ry="10" fill="rgba(186, 230, 253, 0.3)"/>
        <ellipse cx="30" cy="40" rx="5" ry="10" fill="rgba(186, 230, 253, 0.3)"/>
        <ellipse cx="20" cy="30" rx="10" ry="5" fill="rgba(186, 230, 253, 0.3)"/>
        <ellipse cx="40" cy="30" rx="10" ry="5" fill="rgba(186, 230, 253, 0.3)"/>
      </svg>
    </div>
  );
};

export default DecorativeFigures;

