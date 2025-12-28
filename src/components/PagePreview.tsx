'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PdfDoc, PagePlanItem } from '@/lib/types';
import { PdfManager } from '@/lib/pdf/PdfManager';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { clsx } from 'clsx';
// import type for Typescript, not value
import type * as PDFJS from 'pdfjs-dist';

interface PagePreviewProps {
    selectedPageId: string | null;
    pagePlan: PagePlanItem[];
    docs: Record<string, PdfDoc>;
    zoom: number;
    setZoom: (z: number) => void;
    onSelect: (id: string) => void;
}

export function PagePreview({ selectedPageId, pagePlan, docs, zoom, setZoom, onSelect }: PagePreviewProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [rendering, setRendering] = useState(false);

    const selectedItem = pagePlan.find(p => p.id === selectedPageId);
    const doc = selectedItem ? docs[selectedItem.docId] : null; // Use the doc from the selected item
    const selectedIndex = pagePlan.findIndex(p => p.id === selectedPageId);

    const handlePrev = () => {
        if (selectedIndex > 0) {
            onSelect(pagePlan[selectedIndex - 1].id);
        }
    };

    const handleNext = () => {
        if (selectedIndex < pagePlan.length - 1) {
            onSelect(pagePlan[selectedIndex + 1].id);
        }
    };

    useEffect(() => {
        if (!selectedItem || !doc || !canvasRef.current) return;

        let active = true;
        const render = async () => {
            setRendering(true);
            try {
                const pdfjsLib = await import('pdfjs-dist');
                const loadingTask = pdfjsLib.getDocument(doc.bytes.slice());
                const pdf = await loadingTask.promise;

                if (!active) return;

                await PdfManager.renderPageToCanvas(
                    pdf,
                    selectedItem.pageIndex,
                    canvasRef.current!,
                    zoom
                );
            } catch (err) {
                console.error("Preview render error:", err);
            } finally {
                if (active) setRendering(false);
            }
        };

        render();
        return () => { active = false; };
    }, [selectedItem, doc, zoom]);

    if (!selectedItem || !doc) {
        return (
            <div className="flex-1 bg-neutral-100 flex items-center justify-center text-neutral-300 relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                <div className="text-center z-10">
                    <div className="bg-white p-6 border border-neutral-200 shadow-sm mb-6 inline-block">
                        <Maximize className="w-12 h-12 text-neutral-200" />
                    </div>
                    <p className="text-neutral-400 font-mono text-sm tracking-widest uppercase">Select page to inspect</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-neutral-100 relative flex flex-col overflow-hidden group/preview">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 z-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            {/* Navigation Buttons (Visible on Hover or Mobile always?) - Let's make them always visible but subtle, nice floating buttons */}
            <div className="absolute inset-y-0 left-0 w-24 flex items-center justify-start pl-4 z-20 pointer-events-none">
                <button
                    onClick={handlePrev}
                    disabled={selectedIndex <= 0}
                    className="pointer-events-auto p-3 rounded-full bg-white/80 backdrop-blur shadow-lg border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:scale-110 disabled:opacity-0 disabled:pointer-events-none transition-all duration-200"
                    title="Previous Page"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
            </div>

            <div className="absolute inset-y-0 right-0 w-24 flex items-center justify-end pr-4 z-20 pointer-events-none">
                <button
                    onClick={handleNext}
                    disabled={selectedIndex >= pagePlan.length - 1}
                    className="pointer-events-auto p-3 rounded-full bg-white/80 backdrop-blur shadow-lg border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:scale-110 disabled:opacity-0 disabled:pointer-events-none transition-all duration-200"
                    title="Next Page"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>

            {/* Zoom Controls - Floating, Sharp */}
            <div className="absolute bottom-8 right-8 flex gap-px bg-white border border-neutral-200 shadow-xl z-20">
                <button onClick={() => setZoom(Math.max(0.5, zoom - 0.25))} className="p-3 hover:bg-neutral-50 text-neutral-600 transition-colors border-r border-neutral-100" title="Zoom Out">
                    <ZoomOut className="w-4 h-4" />
                </button>
                <div className="flex items-center px-4 text-xs font-mono font-bold text-neutral-600 min-w-[4rem] justify-center bg-white">
                    {Math.round(zoom * 100)}%
                </div>
                <button onClick={() => setZoom(Math.min(3.0, zoom + 0.25))} className="p-3 hover:bg-neutral-50 text-neutral-600 transition-colors border-l border-neutral-100" title="Zoom In">
                    <ZoomIn className="w-4 h-4" />
                </button>
            </div>

            {/* Canvas Container */}
            <div ref={containerRef} className="flex-1 overflow-auto p-4 sm:p-12 flex items-center justify-center z-10">
                <div className={clsx("shadow-2xl shadow-neutral-900/10 transition-all duration-300 bg-white border border-neutral-200", rendering ? "opacity-50 blur-[1px]" : "opacity-100")}>
                    <canvas ref={canvasRef} className="bg-white block" />
                </div>
            </div>
        </div>
    );
}
