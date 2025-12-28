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
    onToggleGridView?: () => void;
}

export function Toolbar({ pageCount, onAddPdf, isProcessing, docs, pagePlan, onToggleGridView }: ToolbarProps) {
    const [isExporting, setIsExporting] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

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

    const handleAddClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onAddPdf(file);
        }
        event.target.value = '';
    };

    return (
        <div className="h-14 sm:h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-3 sm:px-6 shrink-0 z-50 shadow-sm relative">
            {/* Brand / Logo Area */}
            <div className="flex items-center gap-2 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-neutral-900 rounded-lg flex items-center justify-center text-white font-bold shadow-md shrink-0 overflow-hidden">
                    <img src="/logo.png" alt="Nano Banana Pro Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                    <h1 className="text-neutral-900 font-bold tracking-tight text-base sm:text-lg leading-none hidden sm:block">PDF Merger</h1>
                    <h1 className="text-neutral-900 font-bold tracking-tight text-lg leading-none sm:hidden">PDF Merger</h1>
                </div>
            </div>

            {/* Center Actions - Hidden on mobile */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden sm:block">
                <div className="px-4 py-1.5 bg-neutral-100/80 backdrop-blur rounded-full flex items-center gap-3 border border-neutral-200/60 shadow-inner">
                    <span className="text-neutral-500 text-xs font-medium uppercase tracking-wide">Total Pages</span>
                    <span className="text-neutral-900 font-bold font-mono min-w-[1.5em] text-center">{String(pageCount).padStart(2, '0')}</span>
                </div>
            </div>

            {/* Primary Actions */}
            <div className="flex items-center gap-2">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf"
                    className="hidden"
                />

                {/* Grid Toggle: Always visible */}
                {onToggleGridView && (
                    <button
                        onClick={onToggleGridView}
                        className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 text-neutral-600 hover:text-neutral-900 bg-neutral-100 rounded-lg transition-colors border border-neutral-200 hover:border-neutral-300"
                        title="Grid View"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    </button>
                )}

                <button
                    onClick={handleAddClick}
                    className="flex items-center gap-2 px-2 sm:px-3 py-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all font-medium text-sm group border border-transparent hover:border-neutral-200"
                    title="Add PDF"
                >
                    <div className="w-5 h-5 sm:w-auto sm:h-auto flex items-center justify-center">
                        <div className="p-1 bg-neutral-200 rounded text-neutral-500 group-hover:bg-white group-hover:text-neutral-900 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </div>
                    </div>
                    <span className="hidden sm:inline">Add PDF</span>
                </button>

                <button
                    onClick={handleExport}
                    disabled={isProcessing || pageCount === 0}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-neutral-900 text-white rounded-lg font-medium text-sm hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                    title="Export PDF"
                >
                    {isProcessing ? '...' : (
                        <>
                            <span className="hidden sm:inline">Export</span>
                            <Download className="w-4 h-4 sm:ml-0.5" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
