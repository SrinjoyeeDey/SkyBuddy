import { useState } from 'react';
import { Smile, Wind, Brain, Zap, Sparkles } from 'lucide-react';
import type { MoodType } from '@/types/playlist';

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
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium text-muted-foreground">How are you feeling?</h3>
        <span className="text-xs text-muted-foreground">(Optional)</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {moodOptions.map((mood) => (
          <button
            key={mood.value}
            onClick={() => handleMoodClick(mood.value)}
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-full 
              transition-all duration-200 font-medium text-sm
              ${mood.color}
              ${selectedMood === mood.value 
                ? 'ring-2 ring-offset-2 ring-offset-background scale-105' 
                : 'scale-100'
              }
            `}
          >
            {mood.icon}
            <span>{mood.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MoodSelector;