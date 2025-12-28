'use client';

import React from 'react';
import { usePdfEditor } from '@/hooks/usePdfEditor';
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, MouseSensor, TouchSensor, useSensor, useSensors, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { PageThumbnails, Thumbnail } from './PageThumbnails';
import { PagePreview } from './PagePreview';
import { Toolbar } from './Toolbar';
import { UploadZone } from './UploadZone';
import { Home } from './Home';

export function PdfWorkspace() {
    const [isGridView, setIsGridView] = React.useState(false);
    const [activeId, setActiveId] = React.useState<string | null>(null);
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
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id && over) {
            movePage(active.id as string, over.id as string);
        }
        setActiveId(null);
    };

    const handleDragCancel = () => {
        setActiveId(null);
    };

    // Find the active item data for the overlay
    const activeItem = activeId ? pagePlan.find(p => p.id === activeId) : null;
    const activeDoc = activeItem ? docs[activeItem.docId] : null;

    // Show Home (Top Page) if no pages exist and not currently processing
    if (pagePlan.length === 0 && !isProcessing) {
        return (
            <>
                {error && (
                    <div className="fixed top-4 right-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 shadow-lg z-50 rounded-r" role="alert">
                        <p className="font-medium">Error</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}
                <Home onFileSelect={addPdf} />
            </>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-neutral-100 text-neutral-900 font-sans">
            <Toolbar
                pageCount={pagePlan.length}
                onAddPdf={addPdf}
                isProcessing={isProcessing}
                docs={docs}
                pagePlan={pagePlan}
                onToggleGridView={() => setIsGridView(!isGridView)}
            />
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 shadow-sm z-30" role="alert">
                    <p className="font-medium">Error</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            <div className="flex flex-1 overflow-hidden">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragCancel={handleDragCancel}
                >
                    <PageThumbnails
                        pagePlan={pagePlan}
                        docs={docs}
                        selectedPageId={selectedPageId}
                        onSelect={setSelectedPageId}
                        onDelete={deletePage}
                        isGridView={isGridView}
                        onToggleGridView={() => setIsGridView(!isGridView)}
                    />

                    <DragOverlay>
                        {activeItem && activeDoc ? (
                            <Thumbnail
                                item={activeItem}
                                index={pagePlan.indexOf(activeItem)}
                                doc={activeDoc}
                                isSelected={activeItem.id === selectedPageId}
                                isGridView={isGridView}
                                isOverlay
                            />
                        ) : null}
                    </DragOverlay>
                </DndContext>

                <PagePreview
                    selectedPageId={selectedPageId}
                    pagePlan={pagePlan}
                    docs={docs}
                    zoom={zoom}
                    setZoom={setZoom}
                    onSelect={setSelectedPageId}
                />
            </div>

            {isProcessing && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white px-8 py-6 rounded-xl shadow-2xl flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-600 font-medium animate-pulse">Processing PDF...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
