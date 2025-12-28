import type { PDFDocumentProxy } from 'pdfjs-dist';

export class PdfManager {
    static async loadPdf(file: File): Promise<{ doc: PDFDocumentProxy; bytes: Uint8Array }> {
        // Dynamic import to avoid SSR/Build crashes
        const pdfjsLib = await import('pdfjs-dist');

        // Initialize worker if needed
        if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
        }

        const arrayBuffer = await file.arrayBuffer();
        // Create separate Uint8Array copies to prevent ArrayBuffer transfer/detachment
        const bytesForPdfJs = new Uint8Array(arrayBuffer);
        const bytesForStorage = new Uint8Array(bytesForPdfJs); // Copy of the copy

        const loadingTask = pdfjsLib.getDocument({
            data: bytesForPdfJs,
            cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
            cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        return { doc, bytes: bytesForStorage };
    }

    static async renderPageToCanvas(
        pdfDoc: PDFDocumentProxy,
        pageIndex: number,
        canvas: HTMLCanvasElement,
        scale: number
    ) {
        const page = await pdfDoc.getPage(pageIndex + 1); // pdf.js is 1-based
        const viewport = page.getViewport({ scale });

        // High-DPI rendering support
        const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

        // Set actual canvas size to (viewport * pixelRatio)
        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);

        // Set display size (css) to scale
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas context not available');

        // Scale context to match pixel ratio
        context.scale(pixelRatio, pixelRatio);

        const renderContext = {
            canvasContext: context,
            viewport: viewport,
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await page.render(renderContext as any).promise;
    }
}
