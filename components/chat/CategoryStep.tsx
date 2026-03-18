import { Smile, User, Sparkles } from 'lucide-react';

const categories = [
  { id: 'face', label: 'Face', icon: Smile },
  { id: 'body', label: 'Body', icon: User },
  { id: 'non-surgical', label: 'Non-Surgical', icon: Sparkles },
] as const;

interface CategoryStepProps {
  onSelect: (category: string) => void;
}

export function CategoryStep({ onSelect }: CategoryStepProps) {
  return (
    <div className="p-4 flex flex-col h-full">
      <h4 className="text-stone-800 font-serif text-lg mb-1">What are you interested in?</h4>
      <p className="text-stone-500 text-sm mb-4">Select a category to get started.</p>
      <div className="grid grid-cols-1 gap-3">
        {categories.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className="flex items-center gap-4 p-4 bg-stone-50 hover:bg-gold-50 border border-stone-200 hover:border-gold-300 rounded-xl transition-all duration-300 text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-white group-hover:bg-gold-100 flex items-center justify-center transition-colors shadow-sm">
              <Icon className="w-6 h-6 text-gold-600" />
            </div>
            <span className="text-stone-800 font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
