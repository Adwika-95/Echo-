import React from 'react';
const LoadingAnimation: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6">
      <div className="flex items-end space-x-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="w-1 bg-[#1db954] rounded-full animate-bounce"
            style={{
              height: `${20 + (i % 2) * 15}px`,
              animationDelay: `${i * 0.15}s`,
              animationDuration: '0.8s',
            }}
          />
        ))}
      </div>
      <div className="text-center space-y-2">
        <p className="text-xl font-bold text-white">Finding your music...</p>
        <p className="text-sm text-[#b3b3b3]">This may take a few seconds</p>
      </div>
    </div>
  );
};
export default LoadingAnimation;
