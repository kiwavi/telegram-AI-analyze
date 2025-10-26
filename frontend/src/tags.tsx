import React, { useState } from "react";

type TagInputProps = {
    onChange: (tags: string[]) => void;
};

export default function FetchTags({ onChange }: TagInputProps) {
    const [input, setInput] = useState<string>("");
    const [tags, setTags] = useState<string[]>([]);

    const addTag = () => {
        const trimmed = input.trim();
        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed]);
            onChange([...tags, trimmed]);
        }
        setInput("");
    };

    const removeTag = (index: number) => {
        setTags(tags.filter((_, i) => i !== index));
        onChange(tags.filter((_, i) => i !== index));
    };

    return (
        <div className="max-w-md mx-auto p-4">
            <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag, index) => (
                    <span
                        key={index}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center space-x-2"
                    >
                        <span>{tag}</span>
                        <button
                            onClick={() => removeTag(index)}
                            className="ml-2 text-sm"
                        >
                            ✕
                        </button>
                    </span>
                ))}
            </div>

            <div className="flex gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTag()}
                    placeholder="Type a tag..."
                    className="border border-gray-300 rounded px-3 py-1 w-full"
                />
                <button
                    onClick={addTag}
                    className="bg-blue-500 text-white px-4 py-1 rounded"
                >
                    Add
                </button>
            </div>
        </div>
    );
}
