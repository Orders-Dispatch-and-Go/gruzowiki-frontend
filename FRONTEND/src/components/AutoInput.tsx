// components/AutoInput.tsx
import React, { useEffect, useRef } from "react";
import useAutocomplete from "../hooks/useAutocomplete";
import type { AddressData, AddressSuggestion } from "../types/cargo";

interface AutoInputProps {
    label?: string;
    value: string;
    onChange: (value: string | AddressData) => void;
    onValidChange?: (isValid: boolean) => void;
    onRemove?: () => void;
    fetchSuggestions: (query: string) => Promise<AddressSuggestion[]>;
}

const AutoInput: React.FC<AutoInputProps> = ({
    label,
    value,
    onChange,
    onValidChange,
    onRemove,
    fetchSuggestions,
}) => {
    const {
        value: inputValue,
        setValue: setInputValue,
        suggestions,
        isOpen,
        setIsOpen,
        selectSuggestion,
    } = useAutocomplete(fetchSuggestions, value);

    const containerRef = useRef<HTMLDivElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);
        onChange(val);
        if (onValidChange) {
            onValidChange(false);
        }
    };

    const handleSelect = (val: AddressSuggestion) => {
        selectSuggestion(val.displayName);
        const addressData: AddressData = {
            address: val.displayName,
            isValid: true,
            coords: { lat: val.lat, lon: val.lon },
        };
        onChange(addressData);
        console.log({ lat: val.lat, lon: val.lon });
        if (onValidChange) {
            onValidChange(true);
        }
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [setIsOpen]);

    return (
        <div className="auto-input" ref={containerRef}>
            <div className="input-with-remove">
                <input
                    type="text"
                    placeholder={label}
                    value={inputValue}
                    onChange={handleChange}
                    onFocus={() => setIsOpen(suggestions.length > 0)}
                />
                {onRemove && (
                    <button className="remove-button" onClick={onRemove}>
                        ✖
                    </button>
                )}
            </div>
            {isOpen && suggestions.length > 0 && (
                <ul className="suggestions-list">
                    {suggestions.map((s, i) => (
                        <li key={i} onClick={() => handleSelect(s)}>
                            {s.displayName}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AutoInput;