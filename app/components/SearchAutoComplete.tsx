'use client';

import { useEffect, useState } from 'react';

type SearchAutoCompleteProps<T> = {
    placeholder?: string;
    onSearch: (search: string) => Promise<T[]>;
    onSelect: (item: T) => void;
    getItemLabel: (item: T) => string;
    renderItem?: (item: T) => React.ReactNode;
};

export default function SearchAutoComplete<T>({
    placeholder = 'Tìm kiếm...',
    onSearch,
    onSelect,
    getItemLabel,
    renderItem,
}: SearchAutoCompleteProps<T>) {
    const [search, setSearch] = useState('');
    const [suggestions, setSuggestions] = useState<T[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!search.trim()) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        const timer = setTimeout(async () => {
            const data = await onSearch(search);

            setSuggestions(data);

            if (data.length > 0) {
                setIsOpen(true);
            } else {
                setIsOpen(false);
            }
        }, 300);

        return () => {
            clearTimeout(timer);
        };
    }, [search, onSearch]);

    function handleSelect(item: T) {
        setSearch(getItemLabel(item));

        setSuggestions([]);
        setIsOpen(false);

        onSelect(item);
    }

    return (
        <div className="relative w-full">
            <input
                type="text"
                value={search}
                placeholder={placeholder}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => {
                    if (suggestions.length > 0) {
                        setIsOpen(true);
                    }
                }}
                onBlur={() => {
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