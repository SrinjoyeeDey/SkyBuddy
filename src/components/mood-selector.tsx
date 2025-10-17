import { Smile, Wind, Brain, Zap, Sparkles } from 'lucide-react';
import type { MoodType } from '../types/playlist';

interface MoodSelectorProps {
  selectedMood?: MoodType;
  onMoodChange: (mood: MoodType | undefined) => void;
}

const moodOptions: Array<{ value: MoodType; label: string; icon: React.ReactNode; color: string }> = [
  { value: 'happy', label: 'Happy', icon: <Smile className="w-5 h-5" />, color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/20' },
  { value: 'relaxed', label: 'Relaxed', icon: <Wind className="w-5 h-5" />, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20' },
  { value: 'focused', label: 'Focused', icon: <Brain className="w-5 h-5" />, color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20' },
  { value: 'energetic', label: 'Energetic', icon: <Zap className="w-5 h-5" />, color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20' },
  { value: 'calm', label: 'Calm', icon: <Sparkles className="w-5 h-5" />, color: 'bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20' },
];

const MoodSelector = ({ selectedMood, onMoodChange }: MoodSelectorProps) => {
  const handleMoodClick = (mood: MoodType) => {
    if (selectedMood === mood) {
      onMoodChange(undefined); // Deselect if clicking the same mood
    } else {
      onMoodChange(mood);
    }
  };
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">How are you feeling?</h3>
        <p className="text-sm text-muted-foreground">Choose a mood to discover perfect playlists</p>
      </div>
      
      <div className="flex flex-wrap justify-center gap-3">        {moodOptions.map((mood) => (
          <button
            key={mood.value}
            onClick={() => handleMoodClick(mood.value)}
            className={`
              group inline-flex items-center gap-3 px-6 py-4 rounded-2xl 
              transition-all duration-300 font-semibold text-sm
              border-2 hover:scale-105 hover:shadow-lg
              ${mood.color}
              ${selectedMood === mood.value 
                ? 'ring-4 ring-offset-2 ring-offset-background scale-105 shadow-lg border-transparent' 
                : 'border-transparent hover:border-current/20'
              }
            `}
          >
            <div className="transition-transform duration-300 group-hover:scale-110">
              {mood.icon}
            </div>
            <span className="font-bold">{mood.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MoodSelector;