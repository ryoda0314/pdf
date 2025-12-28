'use client';

import React, { useEffect, useRef } from 'react';
import { useSortable, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, GripVertical } from 'lucide-react';
import { PdfDoc, PagePlanItem } from '@/lib/types';
import { PdfManager } from '@/lib/pdf/PdfManager';
import { clsx } from 'clsx';

interface PageThumbnailsProps {
    pagePlan: PagePlanItem[];
    docs: Record<string, PdfDoc>;
    selectedPageId: string | null;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
}

export function PageThumbnails({ pagePlan, docs, selectedPageId, onSelect, onDelete }: PageThumbnailsProps) {
    return (
        <div className="w-64 bg-gray-100 border-r flex flex-col shrink-0">
            <div className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pages</div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                <SortableContext items={pagePlan.map(p => p.id)} strategy={rectSortingStrategy}>
                    {pagePlan.map((item, index) => (
                        <SortableThumbnail
                            key={item.id}
                            item={item}
                            index={index}
                            doc={docs[item.docId]}
                            isSelected={item.id === selectedPageId}
                            onSelect={() => onSelect(item.id)}
                            onDelete={() => onDelete(item.id)}
                        />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
}

interface SortableThumbnailProps {
    item: PagePlanItem;
    index: number;
    doc: PdfDoc;
    isSelected: boolean;
    onSelect: () => void;
    onDelete: (e: React.MouseEvent) => void;
}

function SortableThumbnail({ item, index, doc, isSelected, onSelect, onDelete }: SortableThumbnailProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={clsx(
                "relative group bg-white rounded-lg shadow-sm border-2 transition-all p-2",
                isSelected ? "border-blue-500 ring-1 ring-blue-500" : "border-transparent hover:border-gray-300"
            )}
            onClick={onSelect}
        >
            <div className="absolute top-2 left-2 z-10 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                {index + 1}
            </div>

            <button
                onClick={(e) => { e.stopPropagation(); onDelete(e); }}
                className="absolute top-2 right-2 z-10 p-1 bg-white/90 rounded text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-700"
                title="Delete page"
            >
                <Trash2 className="w-4 h-4" />
            </button>

            {/* Drag Handle */}
            <div {...attributes} {...listeners} className="absolute bottom-2 right-2 z-10 p-1 cursor-grab opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600">
                <GripVertical className="w-4 h-4" />
            </div>

            <div className="aspect-[3/4] bg-gray-200 rounded overflow-hidden flex items-center justify-center">
                <ThumbnailCanvas doc={doc} pageIndex={item.pageIndex} />
            </div>
        </div>
    );
}

function ThumbnailCanvas({ doc, pageIndex }: { doc: PdfDoc, pageIndex: number }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loaded, setLoaded] = React.useState(false);

    useEffect(() => {
        let active = true;
        const render = async () => {
            if (!canvasRef.current) return;
            try {
                // To properly render, we need to re-load the document via pdf.js logic using the bytes.
                // Since PdfDoc only holds the proxy from the initial load which might be "detached" if we didn't keep it alive?
                // Actually PdfManager.loadPdf returned the proxy. We need to store that proxy or re-hydrate it.
                // Storing Proxy in React State (docs) is non-serializable but often works in client components.
                // However, for best practice, let's re-parse bytes if needed, OR we should have stored the proxy in a global cache (not in Redux/State).
                // For this helper, let's assume we re-load efficiently or cache.
                // OPTIMIZATION: In this simplified version, we'll re-load from bytes. In production, use an LRU cache for PDFDocumentProxy.

                const loadingTask = (await import('pdfjs-dist')).getDocument(doc.bytes.slice());
                const pdf = await loadingTask.promise;
                if (!active) return;

                await PdfManager.renderPageToCanvas(pdf, pageIndex, canvasRef.current, 0.3); // Scale 0.3
                if (active) setLoaded(true);
            } catch (e) {
                console.error(e);
            }
        };
        render();
        return () => { active = false; };
    }, [doc, pageIndex]);

    return <canvas ref={canvasRef} className="w-full h-full object-contain" />;
}
