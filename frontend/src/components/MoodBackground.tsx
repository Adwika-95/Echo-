import React from 'react';
interface MoodBackgroundProps {
  mood: string | null;
}
const MoodBackground: React.FC<MoodBackgroundProps> = ({ mood }) => {
  const getMoodGradient = (moodText: string | null) => {
    if (!moodText) return 'from-[#121212] to-[#121212]';
    const lowerMood = moodText.toLowerCase();
    if (/(calm|chill|relax|peaceful)/.test(lowerMood)) return 'from-[#0d1421] via-[#121212] to-[#121212]';
    if (/(party|energetic|dance|upbeat)/.test(lowerMood)) return 'from-[#2d1b1b] via-[#121212] to-[#121212]';
    if (/(sad|melanchol|blue|depress)/.test(lowerMood)) return 'from-[#0a0a0a] via-[#121212] to-[#1a1a1a]';
    if (/(romantic|love|intimate)/.test(lowerMood)) return 'from-[#1a0d14] via-[#121212] to-[#121212]';
    if (/(focus|study|concentrate)/.test(lowerMood)) return 'from-[#0d1a0d] via-[#121212] to-[#121212]';
    return 'from-[#121212] to-[#121212]';
  };
  const gradientClass = getMoodGradient(mood);
  return (
    <div className="fixed inset-0 -z-10">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} transition-all duration-1000 ease-in-out`} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
    </div>
  );
};
export default MoodBackground;
