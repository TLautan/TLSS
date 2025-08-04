// frontend/components/common/global-search.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { globalSearch } from '@/lib/api';
import { SearchResult } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Search, User, Building, DollarSign } from 'lucide-react';

// Custom hook for debouncing
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => { clearTimeout(handler); };
  }, [value, delay]);
  return debouncedValue;
};

const getIcon = (type: SearchResult['type']) => {
    switch (type) {
        case 'user': return <User className="mr-2 h-4 w-4" />;
        case 'company': return <Building className="mr-2 h-4 w-4" />;
        case 'deal': return <DollarSign className="mr-2 h-4 w-4" />;
        default: return null;
    }
}

const getLink = (item: SearchResult) => {
    switch (item.type) {
        case 'user': return `/users`; // Or a future user detail page
        case 'company': return `/companies/${item.id}`;
        case 'deal': return `/deals/${item.id}`;
        default: return '/';
    }
}

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.length > 1) {
        const searchResults = await globalSearch(debouncedQuery);
        setResults(searchResults);
        setIsOpen(true);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    };
    performSearch();
  }, [debouncedQuery]);

  const handleSelect = (path: string) => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    router.push(path);
  }

  return (
    <Command className="relative rounded-lg border w-full max-w-md">
      <CommandInput
        placeholder="Search deals, companies, users..."
        value={query}
        onValueChange={setQuery}
        onFocus={() => query.length > 1 && setIsOpen(true)}
      />
      {isOpen && (
        <div className="absolute top-full mt-1 w-full z-10">
          <CommandList>
            {results.length === 0 && debouncedQuery.length > 1 && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}
            <CommandGroup heading="Results">
              {results.map(item => (
                <CommandItem key={`${item.type}-${item.id}`} onSelect={() => handleSelect(getLink(item))}>
                  {getIcon(item.type)}
                  <span>{item.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </div>
      )}
    </Command>
  );
}