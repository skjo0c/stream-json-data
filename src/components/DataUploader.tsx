import React, { useState } from 'react';
import { Upload, Check, AlertCircle, Loader2 } from 'lucide-react';
import { JsonStreamer } from '../utils/jsonStreamer';

interface Props {
  data: any;
  onUploadComplete: () => void;
}

export function DataUploader({ data, onUploadComplete }: Props) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'completed' | 'error'>('idle');
  const [uploadStats, setUploadStats] = useState({ 
    totalSize: 0,
    uploaded: 0 
  });

  const uploadData = async () => {
    setStatus('uploading');
    const serializedData = JSON.stringify(data);
    const totalSize = serializedData.length;
    setUploadStats({ totalSize, uploaded: 0 });

    try {
      let uploadedSize = 0;
      const streamIterator = JsonStreamer.streamify(data);

      for await (const chunk of streamIterator) {
        await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Chunk-Type': 'partial'
          },
          body: JSON.stringify({ chunk })
        });

        uploadedSize += chunk.length;
        const newProgress = JsonStreamer.calculateProgress(uploadedSize, totalSize);
        setProgress(newProgress);
        setUploadStats(prev => ({ ...prev, uploaded: uploadedSize }));
      }

      // Signal end of transmission
      await fetch('/api/upload/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      setStatus('completed');
      onUploadComplete();
    } catch (error) {
      console.error('Upload error:', error);
      setStatus('error');
    }
  };

  const formatSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          onClick={uploadData}
          disabled={status === 'uploading'}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'uploading' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          {status === 'uploading' ? 'Uploading...' : 'Upload Data'}
        </button>

        {status !== 'idle' && (
          <div className="flex items-center gap-2 flex-1">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            {status === 'completed' && (
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
            )}
            {status === 'error' && (
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            )}
          </div>
        )}
      </div>

      {status === 'uploading' && (
        <div className="text-sm text-gray-600">
          Uploaded: {formatSize(uploadStats.uploaded)} / {formatSize(uploadStats.totalSize)}
        </div>
      )}

      {status === 'error' && (
        <div className="text-sm text-red-600">
          Upload failed. Please try again.
        </div>
      )}
    </div>
  );
}