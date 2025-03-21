// types.ts
interface Tag {
    id: string;
    value: string;
    type: 'tag' | 'operand' | 'number';
  }
  
  interface Suggestion {
    id: string;
    name: string;
    category: string;
  }
  
  export type { Tag, Suggestion };