'use client';

import React from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';
import { clsx } from 'clsx';

interface UploadZoneProps {
    onFileSelect: (file: File) => void;
    className?: string;
    isCompact?: boolean;
}

export function UploadZone({ onFileSelect, className, isCompact = false }: UploadZoneProps) {
    const onDrop = React.useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            onFileSelect(acceptedFiles[0]);
        }
    }, [onFileSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false
    });

    return (
        <div
            {...getRootProps()}
            className={clsx(
                "cursor-pointer border-2 border-dashed rounded-lg transition-colors flex flex-col items-center justify-center text-center",
                isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50",
                isCompact ? "p-4" : "p-12",
                className
            )}
        >
            <input {...getInputProps()} />
            <UploadCloud className={clsx("text-gray-400 mb-2", isCompact ? "w-6 h-6" : "w-12 h-12")} />
            {isCompact ? (
                <span className="text-sm font-medium text-gray-600">Add PDF</span>
            ) : (
                <>
                    <p className="text-lg font-medium text-gray-700">
                        {isDragActive ? "Drop PDF here" : "Drag & drop PDF here"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">or click to browse</p>
                </>
            )}
        </div>
    );
}
