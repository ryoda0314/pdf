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
    isGridView?: boolean;
    onToggleGridView?: () => void;
}

export function PageThumbnails({ pagePlan, docs, selectedPageId, onSelect, onDelete, isGridView = false, onToggleGridView }: PageThumbnailsProps) {
    return (
        <div className={clsx(
            "bg-neutral-50 border-r border-neutral-200 flex flex-col shrink-0 z-10 transition-all duration-300",
            // When GridView is active, it takes over the full viewport relative to its parent (or fixed)
            isGridView ? "fixed inset-0 top-16 z-40 bg-neutral-100/95 backdrop-blur-md" : "w-80"
        )}>
            <div className="p-4 border-b border-neutral-200 bg-white flex items-center justify-between shadow-sm z-20">
                <div className="flex items-center gap-4">
                    <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest font-mono">
                        {isGridView ? 'Sequence Editor (Grid View)' : 'Sequence'}
                    </div>
                    {isGridView && (
                        <div className="text-xs text-neutral-500 hidden sm:block">
                            Drag to reorder • Scroll to view all
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onToggleGridView}
                        className={clsx(
                            "p-1.5 rounded hover:bg-neutral-100 transition-colors border border-transparent",
                            isGridView ? "text-orange-500 bg-orange-50 border-orange-200" : "text-neutral-400"
                        )}
                        title={isGridView ? "Close Grid View" : "Open Grid View"}
                    >
                        {isGridView ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        )}
                    </button>
                    <div className="bg-neutral-900 text-white px-2 py-0.5 text-[10px] font-mono">
                        {String(pagePlan.length).padStart(2, '0')}
                    </div>
                </div>
            </div>

            <div className={clsx(
                "flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent pb-32", // Added pb-32 for extra scroll space
                isGridView ? "grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-8 content-start m-auto max-w-7xl w-full" : "space-y-4"
            )}>
                <SortableContext items={pagePlan.map(p => p.id)} strategy={rectSortingStrategy}>
                    {pagePlan.map((item, index) => (
                        <SortableThumbnail
                            key={item.id}
                            item={item}
                            index={index}
                            doc={docs[item.docId]}
                            isSelected={item.id === selectedPageId}
                            onSelect={() => {
                                onSelect(item.id);
                            }}
                            onDelete={() => onDelete(item.id)}
                            isGridView={isGridView}
                        />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
}

interface ThumbnailProps extends React.HTMLAttributes<HTMLDivElement> {
    item: PagePlanItem;
    index: number;
    doc: PdfDoc;
    isSelected: boolean;
    isGridView?: boolean;
    onDelete?: (e: React.MouseEvent) => void;
    // For drag overlay usage, we might want to force certain styles
    isOverlay?: boolean;
    isDragging?: boolean;
}

export function Thumbnail({ item, index, doc, isSelected, isGridView, onDelete, isOverlay, isDragging, className, ...props }: ThumbnailProps) {
    return (
        <div
            className={clsx(
                "relative group bg-white border transition-all shadow-sm select-none",
                // Base Layout
                isGridView ? "p-4" : "p-3",

                // Active/Selected States
                (isSelected && !isOverlay) ? "border-orange-500 ring-1 ring-orange-500 shadow-md" : "border-transparent",
                (!isSelected && !isOverlay) && "hover:border-neutral-300",

                // Dragging States
                isDragging && "opacity-30 grayscale", // Placeholder look
                isOverlay && "border-orange-500 ring-4 ring-orange-500/20 shadow-2xl scale-105 rotate-2 z-50 cursor-grabbing !opacity-100", // Flying card look

                // Grid hover effects (only when not dragging)
                (isGridView && !isDragging && !isOverlay) && "hover:shadow-lg hover:-translate-y-1",

                className
            )}
            {...props}
        >
            <div className="absolute top-2 left-2 z-10 bg-neutral-900 text-white font-mono text-[10px] px-1.5 py-0.5">
                {String(index + 1).padStart(2, '0')}
            </div>

            {onDelete && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(e); }}
                    className="absolute top-2 right-2 z-10 p-1.5 bg-neutral-900/80 text-white rounded-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-sm backdrop-blur-sm"
                    title="Delete page"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            )}

            {/* Drag Handle - Only show if not overlay */}
            {!isOverlay && (
                <div className="absolute bottom-2 right-2 z-10 p-1.5 bg-neutral-900/10 text-neutral-900 rounded-sm cursor-grab opacity-0 group-hover:opacity-100 transition-all hover:bg-neutral-900 hover:text-white backdrop-blur-sm">
                    <GripVertical className="w-3.5 h-3.5" />
                </div>
            )}

            <div className="aspect-[3/4] bg-neutral-100 border border-neutral-100 overflow-hidden flex items-center justify-center pointer-events-none">
                <ThumbnailCanvas doc={doc} pageIndex={item.pageIndex} />
            </div>
        </div>
    );
}

function SortableThumbnail({ item, index, doc, isSelected, onSelect, onDelete, isGridView }: SortableThumbnailProps) {
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
    };

    return (
        <Thumbnail
            ref={setNodeRef}
            style={style}
            item={item}
            index={index}
            doc={doc}
            isSelected={isSelected}
            isGridView={isGridView}
            onDelete={onDelete}
            isDragging={isDragging}
            {...attributes}
            {...listeners}
            onClick={onSelect}
        />
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
