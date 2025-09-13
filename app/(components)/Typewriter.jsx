"use client";
import { useState, useEffect } from 'react';

const Typewriter = ({ text, speed = 30 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);
    if (text) {
      let i = 0;
      const intervalId = setInterval(() => {
        if (i < text.length) {
          setDisplayedText((prev) => prev + text.charAt(i));
          i++;
        } else {
          clearInterval(intervalId);
          setIsComplete(true);
        }
      }, speed);
      return () => clearInterval(intervalId);
    }
  }, [text, speed]);

  return (
    <span>
      {displayedText}
      {!isComplete && <span className="animate-blink">|</span>}
    </span>
  );
};

export default Typewriter;