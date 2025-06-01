'use client';

import React, { useState } from 'react';

interface FileInputProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
}

export default function FileInput({ onFilesSelected, accept = ".pdf,.doc,.docx,.txt,.md", multiple = true }: FileInputProps) {
  const [fileNames, setFileNames] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files);
    setFileNames(fileArray.map(file => file.name));
    onFilesSelected(fileArray);
  };

  return (
    <div className="w-full">
      <label className="block w-full cursor-pointer px-4 py-2 border border-gray-300 rounded-md text-center hover:bg-gray-50">
        <input 
          type="file" 
          className="hidden"
          onChange={handleFileChange}
          accept={accept}
          multiple={multiple}
        />
        <span className="text-blue-600">
          {multiple ? 'Choose files' : 'Choose a file'}
        </span>
      </label>
      
      {fileNames.length > 0 && (
        <div className="mt-2">
          <p className="text-sm text-gray-700 font-medium">Selected files:</p>
          <ul className="mt-1 text-sm text-gray-600 list-disc pl-5">
            {fileNames.map((name, index) => (
              <li key={index} className="truncate">
                {name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 