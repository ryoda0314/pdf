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
        <div className="h-16 bg-neutral-900 border-b border-white/10 flex items-center justify-between px-6 shrink-0 z-50">
            {/* Brand / Logo Area */}
            <div className="flex items-center gap-4">
                <div className="w-9 h-9 bg-orange-500 flex items-center justify-center font-mono font-bold text-black text-lg shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                    P
                </div>
                <div>
                    <h1 className="text-white font-bold tracking-tight text-lg leading-none">PDF CONTROL</h1>
                    <span className="text-neutral-500 font-mono text-[10px] tracking-widest uppercase">Editor Console</span>
                </div>
            </div>

            {/* Center Actions */}
            <div className="flex items-center gap-1 bg-neutral-800/50 p-1 rounded-sm border border-white/5">
                <div className="h-8 px-4 flex items-center justify-center border-r border-white/10">
                    <span className="text-neutral-400 font-mono text-xs uppercase mr-2">Pages:</span>
                    <span className="text-white font-mono font-bold">{pageCount}</span>
                </div>

                {/* Secondary Add Button */}
                <div className="relative h-8 w-24">
                    <UploadZone
                        onFileSelect={onAddPdf}
                        isCompact
                        className="absolute inset-0 border-0 bg-transparent hover:bg-white/5 text-neutral-300 hover:text-white !p-0 flex-row gap-2 !justify-center !rounded-sm"
                    />
                </div>
            </div>

            {/* Primary Actions */}
            <div className="flex items-center gap-3">
                <button
                    onClick={handleExport}
                    disabled={isProcessing || pageCount === 0}
                    className="group relative px-6 py-2 bg-white text-black font-bold text-sm uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-500 transition-colors duration-200"
                >
                    <span className="relative z-10 flex items-center gap-2">
                        {isProcessing ? 'Processing...' : 'Export PDF'}
                        {!isProcessing && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
                    </span>
                    <div className="absolute inset-0 bg-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200 z-0"></div>
                </button>
            </div>
        </div>
    );
}
