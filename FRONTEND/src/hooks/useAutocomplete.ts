// hooks/useAutocomplete.ts
import { useState, useEffect, useRef } from 'react';
import { type AddressSuggestion } from '../types/cargo';

export default function useAutocomplete(
    fetchSuggestions: (query: string) => Promise<AddressSuggestion[]>,
    initialValue: string = ''
) {
    const [value, setValue] = useState(initialValue);
    const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const debounceRef = useRef<number | null>(null);

    useEffect(() => {
        if (value.length < 3) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = window.setTimeout(async () => {
            const results = await fetchSuggestions(value);
            setSuggestions(results);
            setIsOpen(results.length > 0);
        }, 300);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [value, fetchSuggestions]);

    const selectSuggestion = (selectedValue: string) => {
        setValue(selectedValue);
        setIsOpen(false);
    };

    return {
        value,
        setValue,
        suggestions,
        isOpen,
        setIsOpen,
        selectSuggestion,
    };
}