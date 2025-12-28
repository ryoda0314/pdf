'use client';

import React from 'react';
import { UploadZone } from './UploadZone';
import { Download } from 'lucide-react';
import { exportPdf } from '@/lib/pdf/export';
import { PdfDoc, PagePlanItem } from '@/lib/types';

interface ToolbarProps {
    pageCount: number;
    onAddPdf: (file: File) => void;
    isProcessing: boolean;
    docs: Record<string, PdfDoc>;
    pagePlan: PagePlanItem[];
}

export function Toolbar({ pageCount, onAddPdf, isProcessing, docs, pagePlan }: ToolbarProps) {
    const [isExporting, setIsExporting] = React.useState(false);

    const handleExport = async () => {
        if (pageCount === 0) return;
        setIsExporting(true);
        try {
            const blob = await exportPdf(pagePlan, docs);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `merged-${new Date().toISOString().slice(0, 10)}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
            alert('Export failed. See console for details.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="h-16 bg-white border-b flex items-center px-4 justify-between shrink-0 z-10">
            <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold text-gray-800">PDF Editor</h1>
                <div className="h-6 w-px bg-gray-200 mx-2" />
                <span className="text-sm text-gray-500 font-medium">
                    {pageCount} page{pageCount !== 1 ? 's' : ''}
                </span>
            </div>

            <div className="flex items-center space-x-3">
                <div className="w-40 relative h-10">
                    {/* Compact Upload Zone overlaid/styled as button */}
                    <UploadZone
                        onFileSelect={onAddPdf}
                        isCompact
                        className="absolute inset-0 border border-gray-200 hover:border-blue-400 !p-0 flex-row gap-2 !justify-center bg-white"
                    />
                </div>

                <button
                    onClick={handleExport}
                    disabled={isProcessing || isExporting || pageCount === 0}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <Download className="w-4 h-4" />
                    <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
                </button>
            </div>
        </div>
    );
}
