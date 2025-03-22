// components/FormulaInput.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useFormulaStore } from '../store/formular-store';
import { useSuggestions } from '../api/api';
import { Suggestion } from '../types/formular';

export const FormulaInput: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [result, setResult] = useState<number | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  const { tags, addTag, removeTag, selectedTagId, setSelectedTagId, calculateFormula } = useFormulaStore();
  
  const { data: suggestions = [], isLoading } = useSuggestions(inputValue);
  
  const operands = ['+', '-', '*', '/', '(', ')', '^'];
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) && 
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
    
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setCursorPosition({
        x: rect.left,
        y: rect.bottom
      });
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
    
      const lastTag = tags[tags.length - 1];
      removeTag(lastTag.id);
    } else if (e.key === 'Enter' && inputValue) {
      handleAddItem();
    } else if (operands.includes(e.key)) {
      e.preventDefault();
      addTag({ value: e.key, type: 'operand' });
      setInputValue('');
    } else if (e.key === ' ' && inputValue.trim()) {
      // Add a new tag when space is pressed and there's input
      handleAddItem();
    }
  };
  
  const handleAddItem = () => {
    if (inputValue.trim()) {
      if (!isNaN(Number(inputValue))) {
        // It's a number
        addTag({ value: inputValue, type: 'number' });
      } else {
        // It's a tag
        addTag({ value: inputValue, type: 'tag' });
      }
      setInputValue('');
      setShowSuggestions(false);
    }
  };
  
  const handleSuggestionClick = (suggestion: Suggestion) => {
    addTag({ value: suggestion.name, type: 'tag' });
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };
  
  const handleTagClick = (tagId: string) => {
    setSelectedTagId(tagId);
  };
  
  const handleCalculate = () => {
    const value = calculateFormula();
    setResult(value);
  };
  
  return (
    <div className="w-full max-w-2xl mx-auto mt-10">
      <div className="border border-gray-300 rounded-md p-2 flex flex-wrap items-center bg-white">
        {tags.map((tag) => (
          <div 
            key={tag.id}
            className={`flex items-center m-1 px-2 py-1 rounded ${
              tag.type === 'tag' 
                ? 'bg-blue-100 text-blue-800' 
                : tag.type === 'operand' 
                ? 'bg-gray-200 text-gray-800' 
                : 'bg-green-100 text-green-800'
            } ${selectedTagId === tag.id ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => handleTagClick(tag.id)}
          >
            <span>{tag.value}</span>
          </div>
        ))}
        
        <input
          ref={inputRef}
          type="text"
          className="flex-grow outline-none px-2 py-1 min-w-20"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (inputValue) setShowSuggestions(true);
          }}
          placeholder="Enter formular"
        />
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-10 mt-2 w-64 max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg"
          style={{
            left: cursorPosition.x,
            top: cursorPosition.y
          }}
        >
          <ul>
            {suggestions.map((suggestion) => (
              <li 
                key={suggestion.id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="font-medium">{suggestion.name}</div>
                <div className="text-xs text-gray-500">{suggestion.category}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="mt-4 flex space-x-4">
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
          onClick={handleCalculate}
        >
          Calculate
        </button>
        
        {result !== null && (
          <div className="flex items-center">
            <span className="font-medium mr-2">Result:</span>
            <span>{result}</span>
          </div>
        )}
      </div>
    </div>
  );
};