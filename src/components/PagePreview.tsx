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
}

export function PagePreview({ selectedPageId, pagePlan, docs, zoom, setZoom }: PagePreviewProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [rendering, setRendering] = useState(false);

    const selectedItem = pagePlan.find(p => p.id === selectedPageId);
    const doc = selectedItem ? docs[selectedItem.docId] : null;

    useEffect(() => {
        if (!selectedItem || !doc || !canvasRef.current) return;

        let active = true;
        const render = async () => {
            setRendering(true);
            try {
                // Re-instantiate document for rendering
                // Optimization: In a real app we would cache the PDFDocumentProxy
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
            <div className="flex-1 bg-gray-200 flex items-center justify-center text-gray-400">
                <div className="text-center">
                    <Maximize className="w-16 h-16 mx-auto mb-2 opacity-20" />
                    <p>Select a page to preview</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-gray-200 relative flex flex-col overflow-hidden">
            {/* Zoom Controls */}
            <div className="absolute bottom-6 right-6 flex gap-2 bg-white p-1 rounded-lg shadow-md z-20">
                <button onClick={() => setZoom(Math.max(0.5, zoom - 0.25))} className="p-2 hover:bg-gray-100 rounded" title="Zoom Out">
                    <ZoomOut className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex items-center px-2 text-sm font-medium text-gray-700 w-16 justify-center">
                    {Math.round(zoom * 100)}%
                </div>
                <button onClick={() => setZoom(Math.min(3.0, zoom + 0.25))} className="p-2 hover:bg-gray-100 rounded" title="Zoom In">
                    <ZoomIn className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            {/* Canvas Container */}
            <div ref={containerRef} className="flex-1 overflow-auto p-8 flex items-center justify-center">
                <div className={clsx("shadow-2xl transition-opacity", rendering ? "opacity-50" : "opacity-100")}>
                    <canvas ref={canvasRef} className="bg-white" />
                </div>
            </div>
        </div>
    );
}
