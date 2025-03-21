
"use client"

import type { NextPage } from 'next';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FormulaInput } from './components/FormularInput';
const queryClient = new QueryClient();


const Home: NextPage = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Formula Input with Autocomplete</h1>
        <FormulaInput />
      </div>
    </QueryClientProvider>
  );
};

export default Home;