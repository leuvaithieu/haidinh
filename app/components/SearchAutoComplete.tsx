'use client';

import { useEffect, useRef, useState } from 'react';

type SearchAutoCompleteProps<T> = {
    value: string;
    placeholder?: string;
    onChange: (value: string) => void;
    onSearch: (search: string) => Promise<T[]>;
    onSelect: (item: T) => void;
    getItemLabel: (item: T) => string;
    renderItem?: (item: T) => React.ReactNode;
};

export default function SearchAutoComplete<T>({
    value,
    placeholder = 'Tìm kiếm...',
    onChange,
    onSearch,
    onSelect,
    getItemLabel,
    renderItem,
}: SearchAutoCompleteProps<T>) {
    const [suggestions, setSuggestions] = useState<T[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const isFocusedRef = useRef(false);

    useEffect(() => {
        if (!value.trim()) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        const timer = setTimeout(async () => {
            const data = await onSearch(value);

            setSuggestions(data);

            // Chỉ mở dropdown nếu input vẫn đang được focus
            if (isFocusedRef.current && data.length > 0) {
                setIsOpen(true);
            } else {
                setIsOpen(false);
            }
        }, 300);

        return () => {
            clearTimeout(timer);
        };
    }, [value, onSearch]);

    function handleSelect(item: T) {
        const label = getItemLabel(item);

        onChange(label);
        setSuggestions([]);
        setIsOpen(false);

        onSelect(item);
    }

    return (
        <div className="relative w-full">
            <input
                type="text"
                value={value}
                placeholder={placeholder}
                onChange={(e) => {
                    onChange(e.target.value);
                }}
                onFocus={() => {
                    isFocusedRef.current = true;

                    if (suggestions.length > 0) {
                        setIsOpen(true);
                    }
                }}
                onBlur={() => {
                    isFocusedRef.current = false;
                    setIsOpen(false);
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />

            {isOpen && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                    {suggestions.map((item, index) => (
                        <button
                            key={index}
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelect(item);
                            }}
                            className="block w-full border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-50"
                        >
                            {renderItem
                                ? renderItem(item)
                                : getItemLabel(item)}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}