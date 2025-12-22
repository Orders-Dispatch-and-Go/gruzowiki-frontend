// components/AutoInput.tsx
import React, { useEffect, useRef } from "react";
import { Input, Button, Space, Menu, Flex } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import useAutocomplete from "../hooks/useAutocomplete";
import type { AddressData, AddressSuggestion } from "../types/cargo";

interface AutoInputProps {
    label?: string;
    value: string;
    onChange: (value: string | AddressData) => void;
    onValidChange?: (isValid: boolean) => void;
    onRemove?: () => void;
    fetchSuggestions: (query: string) => Promise<AddressSuggestion[]>;
    placeholder?: string;
}

const AutoInput: React.FC<AutoInputProps> = ({
    label,
    value,
    onChange,
    onValidChange,
    onRemove,
    fetchSuggestions,
    placeholder,
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
        <Flex vertical gap={4} ref={containerRef} style={{ position: "relative" }}>

            <Space.Compact style={{ width: "100%" }}>
                <Input
                    placeholder={placeholder || label}
                    value={inputValue}
                    onChange={handleChange}
                    onFocus={() => setIsOpen(suggestions.length > 0)}
                    style={{ width: "100%" }}
                />
                {onRemove && (
                    <Button
                        icon={<CloseOutlined />}
                        onClick={onRemove}
                        danger
                    />
                )}
            </Space.Compact>

            {isOpen && suggestions.length > 0 && (
                <Menu
                    style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        zIndex: 1050,
                        marginTop: 4,
                        maxHeight: 250,
                        overflowY: "auto",
                    }}
                >
                    {suggestions.map((suggestion, index) => (
                        <Menu.Item
                            key={index}
                            onClick={() => handleSelect(suggestion)}
                            style={{ padding: "8px 12px" }}
                        >
                            {suggestion.displayName}
                        </Menu.Item>
                    ))}
                </Menu>
            )}
        </Flex>
    );
};

export default AutoInput;
