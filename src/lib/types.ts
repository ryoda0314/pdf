export interface PdfDoc {
    id: string; // Unique ID for the document (UUID)
    name: string; // File name
    byteLength: number;
    pageCount: number;
    bytes: Uint8Array; // Raw PDF data as Uint8Array (avoids ArrayBuffer detachment issues)
}

export interface PagePlanItem {
    id: string; // Unique ID for this page item (e.g. `${docId}-${pageIndex}-${uuid}`)
    docId: string; // Reference to the parent doc
    pageIndex: number; // 0-based index in the ORIGINAL document
    rotation: number; // Rotation in degrees (0, 90, 180, 270)
}

export interface PdfEditorState {
    docs: Record<string, PdfDoc>; // Map of docId -> PdfDoc
    pagePlan: PagePlanItem[]; // Ordered list of pages to export
    selectedPageId: string | null;
    zoom: number; // Scale factor for preview (e.g. 1.0)
    isProcessing: boolean; // For showing loading indicators
}
