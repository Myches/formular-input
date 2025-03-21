"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSuggestions } from "../api/api";
import { Suggestion } from "../types/formular";
import { v4 as uuidv4 } from "uuid"; // Import UUID library for unique IDs

interface Tag {
  id: string;
  value: string;
  type: "tag";
}

export const FormulaInput: React.FC = () => {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [tags, setTags] = useState<Tag[]>([]);
  const [formula, setFormula] = useState<(string | Tag)[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const { data: suggestions = [], isLoading } = useSuggestions(inputValue);

  const operands = ["+", "-", "*", "/", "(", ")", "^"];

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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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

  const addTag = (tag: Omit<Tag, "id">) => {
    const newTag = { ...tag, id: uuidv4() }; // Use UUID for unique IDs
    setTags([...tags, newTag]);
    return newTag;
  };

  const removeTag = (id: string) => {
    setTags(tags.filter((tag) => tag.id !== id));
    setFormula(formula.filter((item) => typeof item === "string" || item.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && inputValue === "" && formula.length > 0) {
      setFormula(formula.slice(0, -1));
    } else if (e.key === "Enter" && inputValue) {
      e.preventDefault();
      handleAddItem();
    } else if (operands.includes(e.key)) {
      e.preventDefault();
      setFormula([...formula, e.key]);
      setInputValue("");
    } else if (e.key === " " && inputValue.trim()) {
      e.preventDefault();
      handleAddItem();
    }
  };

  const handleAddItem = () => {
    if (inputValue.trim()) {
      if (!isNaN(Number(inputValue))) {
        // If the input is a number, add it to the formula
        setFormula([...formula, inputValue]);
      } else {
        // If the input is a suggestion, find the matching suggestion and add it as a tag
        const suggestion = suggestions.find((s) => s.name === inputValue);
        if (suggestion) {
          const newTag = addTag({ value: inputValue, type: "tag" });
          setFormula([...formula, newTag]);
        }
      }
      // Clear the input value and hide suggestions
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    const newTag = addTag({ value: suggestion.name, type: "tag" });
    setFormula([...formula, newTag]);
    setInputValue("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const shouldShowSuggestions = showSuggestions && !isLoading && suggestions.length > 0;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <label htmlFor="formula-input" className="block text-sm font-medium text-gray-700 mb-1">
        Formula Input
      </label>
      <div
        ref={containerRef}
        className={`border rounded-lg p-2 flex flex-wrap items-center bg-white transition-all duration-200 ${
          isFocused ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-300 hover:border-gray-400"
        }`}
        onClick={focusInput}
      >
        {/* Render the formula */}
        {formula.map((item, index) =>
          typeof item === "string" ? (
            // Render numbers or operands as plain text
            <span key={`plain-${index}-${item}`} className="text-sm font-medium text-gray-700">
              {item}
            </span>
          ) : (
            // Render tags with the × icon
            <div
              key={`tag-${item.id}`} // Use the tag's unique id as the key
              className="flex items-center m-1 px-2 py-1 rounded-md border bg-blue-100 text-blue-800 border-blue-200"
            >
              <span className="text-sm font-medium">{item.value}</span>
              <button
                type="button"
                className="ml-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(item.id);
                }}
              >
                <span className="text-xs">×</span>
              </button>
            </div>
          )
        )}

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
          placeholder={formula.length > 0 ? "" : "Type to enter formula..."}
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
                key={suggestion.id} // Ensure each suggestion has a unique key
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