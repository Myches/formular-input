
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Tag } from '../types/formular';

interface FormulaState {
  tags: Tag[];
  selectedTagId: string | null;
  addTag: (tag: Omit<Tag, 'id'>) => void;
  removeTag: (id: string) => void;
  setSelectedTagId: (id: string | null) => void;
  calculateFormula: () => number | null;
}

export const useFormulaStore = create<FormulaState>((set, get) => ({
  tags: [],
  selectedTagId: null,
  
  addTag: (tag) => {
    const newTag = { ...tag, id: uuidv4() };
    set((state) => ({
      tags: [...state.tags, newTag],
      selectedTagId: newTag.id,
    }));
  },
  
  removeTag: (id) => {
    set((state) => ({
      tags: state.tags.filter((tag) => tag.id !== id),
      selectedTagId: state.selectedTagId === id ? null : state.selectedTagId,
    }));
  },
  
  setSelectedTagId: (id) => {
    set({ selectedTagId: id });
  },
  
  calculateFormula: () => {
    const { tags } = get();
    if (tags.length === 0) return null;
    
    try {
      // Convert tags to a formula string
      const formula = tags.map((tag) => {
        if (tag.type === 'tag') {
          return '10';
        }
        return tag.value;
      }).join(' ');
      
      
      return new Function(`return ${formula}`)();
    } catch (error) {
      console.error('Error calculating formula:', error);
      return null;
    }
  },
}));