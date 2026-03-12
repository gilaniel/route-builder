import { useState, useEffect, useRef } from "react";
import { useYMaps } from "@pbe/react-yandex-maps";
import { LucideIcon } from "lucide-react";
import useDebounceCallback from "../useDebounce";

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon: LucideIcon;
  iconColorClass: string;
}

export default function AddressInput({
  value,
  onChange,
  placeholder,
  icon: Icon,
  iconColorClass,
}: AddressInputProps) {
  const ymaps = useYMaps(["suggest"]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const debouncedText = useDebounceCallback(value, 500);

  useEffect(() => {
    return;
    if (!ymaps || !debouncedText || !isOpen) {
      setSuggestions([]);
      return;
    }

    let canceled = false;

    // ymaps.suggest returns a Promise
    ymaps
      .suggest(value)
      .then((items: any[]) => {
        if (!canceled) {
          setSuggestions(items);
        }
      })
      .catch((e) => {
        console.log(e);
        // Ignore errors (e.g., network issues during typing)
      });

    return () => {
      canceled = true;
    };
  }, [ymaps, debouncedText, isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className={`h-5 w-5 ${iconColorClass}`} />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        placeholder={placeholder}
        required
      />

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((item, index) => (
            <li
              key={index}
              className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-0"
              onMouseDown={(e) => {
                // Prevent input blur before click fires
                e.preventDefault();
              }}
              onClick={() => {
                onChange(item.value);
                setIsOpen(false);
              }}
            >
              <div className="font-medium text-gray-900">
                {item.displayName}
              </div>
              {item.value !== item.displayName && (
                <div className="text-xs text-gray-500 truncate">
                  {item.value}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
