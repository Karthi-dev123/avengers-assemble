import React, { useRef } from 'react';
import { Upload as UploadIcon } from 'lucide-react';

interface FileDropzoneProps {
  onFile?: (file: File) => void;
  accept?: string;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({ onFile, accept = '.csv,.xlsx,.xls' }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFile?.(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files?.length) {
      onFile?.(files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
        isDragging
          ? 'border-sidebar-accent bg-slate-50'
          : 'border-slate-300 hover:border-slate-400'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        className="inline-flex flex-col items-center gap-3 mb-2"
      >
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
          <UploadIcon size={32} className="text-sidebar-accent" />
        </div>
      </button>

      <h3 className="font-semibold text-slate-900 mb-1">Drop your CSV or Excel file here</h3>
      <p className="text-sm text-slate-600">or click to browse</p>
      <p className="text-xs text-slate-500 mt-2">Supported formats: CSV, XLSX, XLS</p>
    </div>
  );
};
