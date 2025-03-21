"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useSuggestions } from '../api/api';
import { Suggestion } from '../types/formular';

interface Tag {
  id: string;
  value: string;
  type: 'tag';
}

export const FormulaInput: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [tags, setTags] = useState<Tag[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const { data: suggestions = [], isLoading } = useSuggestions(inputValue);

  const operands = ['+', '-', '*', '/', '(', ')', '^'];

  // Handle clicks outside the suggestions dropdown
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

  // Update suggestion position
  useEffect(() => {
    if (showSuggestions && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setCursorPosition({
        x: rect.left,
        y: rect.bottom + window.scrollY,
      });
    }
  }, [showSuggestions, inputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (e.target.value.trim()) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const addTag = (tag: Omit<Tag, 'id'>) => {
    const newTag = { ...tag, id: Math.random().toString(36).substr(2, 9) };
    setTags([...tags, newTag]);
    return newTag;
  };

  const removeTag = (id: string) => {
    setTags(tags.filter((tag) => tag.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      // Remove the last tag when backspace is pressed and input is empty
      setTags(tags.slice(0, -1));
    } else if (e.key === 'Enter' && inputValue) {
      e.preventDefault();
      handleAddItem();
    } else if (e.key === ' ' && inputValue.trim()) {
      // Add a new tag when space is pressed and there's input
      e.preventDefault();
      handleAddItem();
    }
  };

  const handleAddItem = () => {
    if (inputValue.trim()) {
      // Only add API suggestions as tags
      const suggestion = suggestions.find((s) => s.name === inputValue);
      if (suggestion) {
        addTag({ value: inputValue, type: 'tag' });
        setInputValue('');
        setShowSuggestions(false);
      }
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    addTag({ value: suggestion.name, type: 'tag' });
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  // Only show suggestions if we have matches and not loading
  const shouldShowSuggestions = showSuggestions && !isLoading && suggestions.length > 0;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <label htmlFor="formula-input" className="block text-sm font-medium text-gray-700 mb-1">
        Formula Input
      </label>
      <div
        ref={containerRef}
        className={`border rounded-lg p-2 flex flex-wrap items-center bg-white transition-all duration-200 ${
          isFocused ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-300 hover:border-gray-400'
        }`}
        onClick={focusInput}
      >
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="flex items-center m-1 px-2 py-1 rounded-md border bg-blue-100 text-blue-800 border-blue-200"
          >
            <span className="text-sm font-medium">{tag.value}</span>
            <button
              type="button"
              className="ml-1 text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag.id);
              }}
            >
              <span className="text-xs">×</span>
            </button>
          </div>
        ))}

        <input
          id="formula-input"
          ref={inputRef}
          type="text"
          className="flex-grow outline-none px-2 py-1.5 min-w-20 text-gray-700 placeholder-gray-400 text-sm"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true);
            if (inputValue.trim() && suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onBlur={() => {
            setIsFocused(false);
          }}
          placeholder={tags.length > 0 ? "" : "Type to enter formula..."}
        />
      </div>

      {shouldShowSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 mt-1 w-64 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg"
          style={{
            left: cursorPosition.x,
            top: cursorPosition.y,
          }}
        >
          <ul className="py-1">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.id}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="font-medium text-sm">{suggestion.name}</div>
                <div className="text-xs text-gray-500">{suggestion.category}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-2 text-xs text-gray-500">
        Press space or enter to add an item. Use operators (+, -, *, /, ^, (, )) and numbers directly.
      </p>
    </div>
  );
};