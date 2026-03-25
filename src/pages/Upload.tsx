import React, { useState } from 'react';
import { FileDropzone } from '../components/shared/FileDropzone';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

export const Upload: React.FC = () => {
  const [uploadStep, setUploadStep] = useState<'upload' | 'preview' | 'results'>('upload');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mappings, setMappings] = useState<Array<{ column: string; field: string; confidence: number }> | null>(null);

  const handleFileSelect = (file: File) => {
    setFileName(file.name);
    setIsProcessing(true);

    // Simulate AI column mapping
    setTimeout(() => {
      setMappings([
        { column: 'Full Name', field: 'full_name', confidence: 0.98 },
        { column: 'DOB', field: 'date_of_birth', confidence: 0.92 },
        { column: 'Gender', field: 'gender', confidence: 0.95 },
        { column: 'District', field: 'district', confidence: 0.97 },
        { column: 'School', field: 'institution_name', confidence: 0.88 },
        { column: 'Parent Phone', field: 'parent_phone', confidence: 0.91 },
      ]);
      setUploadStep('preview');
      setIsProcessing(false);
    }, 2000);
  };

  const handleConfirmImport = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setUploadStep('results');
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Upload Student Data</h1>
        <p className="text-slate-600 mt-1">
          Import student information from CSV or Excel files. The system will automatically map columns and detect duplicates.
        </p>
      </div>

      {/* Upload step */}
      {uploadStep === 'upload' && (
        <div className="space-y-4">
          <FileDropzone onFile={handleFileSelect} />
        </div>
      )}

      {/* Preview step */}
      {uploadStep === 'preview' && !isProcessing && mappings && (
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Column Mapping Preview</h2>
            <p className="text-sm text-slate-600 mb-4">File: <strong>{fileName}</strong> • {142} rows detected</p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">CSV Column</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">Database Field</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {mappings.map((mapping, idx) => (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-900 font-medium">{mapping.column}</td>
                      <td className="px-4 py-3 text-slate-600">{mapping.field}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {mapping.confidence >= 0.9 ? (
                            <>
                              <CheckCircle size={16} className="text-green-600" />
                              <span className="text-green-600 font-medium">{Math.round(mapping.confidence * 100)}%</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle size={16} className="text-amber-600" />
                              <span className="text-amber-600 font-medium">{Math.round(mapping.confidence * 100)}%</span>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleConfirmImport}
                disabled={isProcessing}
                className="px-6 py-2 bg-sidebar-accent text-white font-medium rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
              >
                Confirm & Import
              </button>
              <button
                onClick={() => {
                  setUploadStep('upload');
                  setFileName(null);
                  setMappings(null);
                }}
                className="px-6 py-2 border border-slate-300 text-slate-900 font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Processing step */}
      {isProcessing && (
        <div className="card p-12 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-slate-200 border-t-sidebar-accent rounded-full mx-auto mb-4" />
          <p className="text-lg font-semibold text-slate-900">
            {uploadStep === 'preview' ? 'Importing data...' : 'Processing...'}
          </p>
          <p className="text-sm text-slate-600 mt-2">This may take a minute</p>
        </div>
      )}

      {/* Results step */}
      {uploadStep === 'results' && !isProcessing && (
        <div className="space-y-4">
          <div className="card p-8 bg-gradient-to-br from-green-50 to-slate-50">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Import Complete!</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <p className="text-sm text-slate-600 mb-2">Records Imported</p>
                <p className="text-3xl font-bold text-green-600">142</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-amber-200">
                <p className="text-sm text-slate-600 mb-2">Duplicates Merged</p>
                <p className="text-3xl font-bold text-amber-600">3</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-slate-600 mb-2">Under Review</p>
                <p className="text-3xl font-bold text-blue-600">2</p>
              </div>
            </div>

            <div className="space-y-3 mt-6">
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-slate-900">Data validation passed</p>
                  <p className="text-sm text-slate-600">All records meet format requirements</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-slate-900">2 records require manual review</p>
                  <p className="text-sm text-slate-600">Missing required fields detected</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={20} className="text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-slate-900">Processing continues</p>
                  <p className="text-sm text-slate-600">AI deduplication running in background</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setUploadStep('upload');
                  setFileName(null);
                  setMappings(null);
                }}
                className="px-6 py-3 bg-sidebar-accent text-white font-medium rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Upload Another File
              </button>
              <button
                onClick={() => {}}
                className="px-6 py-3 border border-slate-300 text-slate-900 font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                Review Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
