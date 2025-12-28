'use client';

import React from 'react';
import { usePdfEditor } from '@/hooks/usePdfEditor';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { PageThumbnails } from './PageThumbnails';
import { PagePreview } from './PagePreview';
import { Toolbar } from './Toolbar';
import { UploadZone } from './UploadZone';
// Refresh imports

export function PdfWorkspace() {
    const {
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
    } = usePdfEditor();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id && over) {
            movePage(active.id as string, over.id as string);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 text-gray-900">
            <Toolbar
                pageCount={pagePlan.length}
                onAddPdf={addPdf}
                isProcessing={isProcessing}
                docs={docs}
                pagePlan={pagePlan}
            />
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                    <p>{error}</p>
                </div>
            )}

            {/* Empty State Overlay */}
            {pagePlan.length === 0 && !isProcessing && (
                <div className="absolute inset-0 bg-gray-50 z-40 flex items-center justify-center p-8">
                    <div className="max-w-xl w-full bg-white p-8 rounded-xl shadow-xl border text-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">PDF Editor</h2>
                        <p className="text-gray-500 mb-8">Upload a PDF to start editing, organizing, and merging.</p>
                        <UploadZone onFileSelect={addPdf} />
                    </div>
                </div>
            )}

            <div className="flex flex-1 overflow-hidden">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <PageThumbnails
                        pagePlan={pagePlan}
                        docs={docs}
                        selectedPageId={selectedPageId}
                        onSelect={setSelectedPageId}
                        onDelete={deletePage}
                    />
                </DndContext>

                <PagePreview
                    selectedPageId={selectedPageId}
                    pagePlan={pagePlan}
                    docs={docs}
                    zoom={zoom}
                    setZoom={setZoom}
                />
            </div>
            {/* Overlay Loading State */}
            {isProcessing && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded shadow-lg animate-pulse">
                        Processing...
                    </div>
                </div>
            )}
        </div>
    );
}
