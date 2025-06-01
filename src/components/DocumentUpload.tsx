'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { uploadDocuments } from '../utils/api';
import { DocumentUploadFormData, UserIdProps } from '../types';
import FileInput from './FileInput';

export default function DocumentUpload({ userId }: UserIdProps) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<Omit<DocumentUploadFormData, 'documents'>>();
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const onSubmit: SubmitHandler<Omit<DocumentUploadFormData, 'documents'>> = async (data) => {
    try {
      // Make sure documents exist before proceeding
      if (selectedFiles.length === 0) {
        setResult({ 
          success: false, 
          message: 'Please select at least one document to upload' 
        });
        return;
      }

      // Create a FileList-like object from the array of Files
      const fileList = Object.assign(selectedFiles, {
        item: (index: number) => selectedFiles[index],
        length: selectedFiles.length
      }) as unknown as FileList;

      const result = await uploadDocuments(
        userId, 
        fileList, 
        data.collectionName
      );
      
      setResult({ success: true, message: result.message });
      setSelectedFiles([]);
      reset();
      
    } catch (error: any) {
      // Handle upload errors gracefully
      console.error("Upload error:", error);
      
      setResult({ 
        success: false, 
        message: error.response?.data?.detail || error.message || 'Upload failed'
      });
    }
  };

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
  };

  return (
    <div className="bg-green-100 border-2 border-green-500 shadow-lg rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-black">Upload Documents</h2>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="block text-sm font-bold text-black">
            Collection Name (optional)
          </label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-black"
            placeholder="Default Collection"
            {...register('collectionName')}
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-bold text-black mb-2">
            Documents
          </label>
          <FileInput 
            onFilesSelected={handleFilesSelected} 
            multiple={true} 
            accept=".pdf,.doc,.docx,.txt,.md"
          />
          <p className="mt-1 text-sm font-medium text-black">
            Accepted file types: PDF, DOC, DOCX, TXT, MD
          </p>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || selectedFiles.length === 0}
          className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Uploading...' : 'UPLOAD DOCUMENTS'}
        </button>
      </form>
      
      {result && (
        <div className={`mt-4 p-4 rounded-md border-2 ${result.success ? 'bg-green-100 border-green-500 text-black' : 'bg-red-100 border-red-500 text-black'}`}>
          <p className="text-base font-bold">{result.message}</p>
        </div>
      )}
    </div>
  );
} 