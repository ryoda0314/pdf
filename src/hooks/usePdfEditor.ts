import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PdfDoc, PagePlanItem, PdfEditorState } from '@/lib/types';
import { PdfManager } from '@/lib/pdf/PdfManager';
import type * as pdfjsLib from 'pdfjs-dist';
import { arrayMove } from '@dnd-kit/sortable';

export const usePdfEditor = () => {
    const [docs, setDocs] = useState<Record<string, PdfDoc>>({});
    const [pagePlan, setPagePlan] = useState<PagePlanItem[]>([]);
    const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
    const [zoom, setZoom] = useState<number>(1.0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const addPdf = useCallback(async (file: File) => {
        setIsProcessing(true);
        setError(null);

        // Enforce 50MB Limit
        const MAX_SIZE = 50 * 1024 * 1024; // 50MB
        if (file.size > MAX_SIZE) {
            setError(`File size exceeds 50MB limit: ${file.name}`);
            setIsProcessing(false);
            return;
        }

        try {
            const { doc: proxy, bytes } = await PdfManager.loadPdf(file);
            const docId = uuidv4();

            const newDoc: PdfDoc = {
                id: docId,
                name: file.name,
                byteLength: bytes.byteLength,
                pageCount: proxy.numPages,
                bytes: bytes,
            };

            setDocs(prev => ({ ...prev, [docId]: newDoc }));

            // Append pages to pagePlan
            const newPages: PagePlanItem[] = Array.from({ length: proxy.numPages }).map((_, i) => ({
                id: `${docId}-${i}-${uuidv4()}`,
                docId,
                pageIndex: i,
                rotation: 0,
            }));

            setPagePlan(prev => [...prev, ...newPages]);

            // Auto-select first page if none selected
            if (!selectedPageId && newPages.length > 0) {
                setSelectedPageId(newPages[0].id);
            }

        } catch (err) {
            console.error(err);
            setError('Failed to load PDF. It might be corrupted or password protected.');
        } finally {
            setIsProcessing(false);
        }
    }, [selectedPageId]);

    const deletePage = useCallback((id: string) => {
        setPagePlan(prev => {
            const newPlan = prev.filter(p => p.id !== id);
            // If we deleted the selected page, select the next one or previous one or null
            if (id === selectedPageId) {
                const index = prev.findIndex(p => p.id === id);
                // Try next one, if not, try previous
                if (newPlan.length > 0) {
                    const nextCandidate = newPlan[Math.min(index, newPlan.length - 1)];
                    setSelectedPageId(nextCandidate.id);
                } else {
                    setSelectedPageId(null);
                }
            }
            return newPlan;
        });
    }, [selectedPageId]);

    const movePage = useCallback((activeId: string, overId: string) => {
        setPagePlan((items) => {
            const oldIndex = items.findIndex((i) => i.id === activeId);
            const newIndex = items.findIndex((i) => i.id === overId);
            return arrayMove(items, oldIndex, newIndex);
        });
    }, []);

    return {
        docs,
        pagePlan,
        selectedPageId,
        setSelectedPageId,
        zoom,
        setZoom,
        isProcessing,
        error,
        addPdf,
        deletePage,
        movePage
    };
};
