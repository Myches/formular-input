// components/TagDropdown.tsx
import React, { useState } from 'react';
import { useFormulaStore } from '../store/formular-store';
interface TagDropdownProps {
  tagId: string;
}

 const TagDropdown: React.FC<TagDropdownProps> = ({ tagId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { removeTag } = useFormulaStore();
  
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    removeTag(tagId);
    setIsOpen(false);
  };
  
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="ml-1 px-1 py-0.5 bg-gray-200 rounded text-xs"
      >
        ▼
      </button>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-40 bg-white shadow-lg rounded border border-gray-200">
          <div className="py-1">
            <a href="#" className="block px-4 py-2 text-sm hover:bg-gray-100" onClick={(e) => {
              e.preventDefault();
              setIsOpen(false);
            }}>
              Edit Tag
            </a>
            <a href="#" className="block px-4 py-2 text-sm hover:bg-gray-100" onClick={(e) => {
              e.preventDefault();
              setIsOpen(false);
            }}>
              Change Value
            </a>
            <a href="#" className="block px-4 py-2 text-sm hover:bg-gray-100" onClick={handleDelete}>
              Delete Tag
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagDropdown