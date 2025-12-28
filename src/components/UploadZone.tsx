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
                "cursor-pointer border-2 border-dashed rounded-xl transition-all duration-200 ease-in-out flex flex-col items-center justify-center text-center group",
                isDragActive
                    ? "border-blue-500 bg-blue-50 scale-[1.02] shadow-lg"
                    : "border-slate-300 hover:border-blue-400 hover:bg-slate-50 hover:shadow-md",
                isCompact ? "p-4" : "p-12",
                className
            )}
        >
            <input {...getInputProps()} />
            <div className={clsx("transition-transform duration-300", isDragActive ? "scale-110" : "group-hover:scale-110")}>
                <UploadCloud className={clsx("mb-3 text-slate-400 group-hover:text-blue-500 transition-colors", isCompact ? "w-6 h-6" : "w-12 h-12")} />
            </div>
            {isCompact ? (
                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">Add PDF</span>
            ) : (
                <>
                    <p className="text-lg font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                        {isDragActive ? "Drop PDF here" : "Drag & drop PDF here"}
                    </p>
                    <p className="text-sm text-slate-500 mt-2">or click to browse</p>
                </>
            )}
        </div>
    );
}
