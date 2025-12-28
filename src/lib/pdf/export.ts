import { PDFDocument } from 'pdf-lib';
import { PagePlanItem, PdfDoc } from '@/lib/types';

export async function exportPdf(pagePlan: PagePlanItem[], docs: Record<string, PdfDoc>): Promise<Blob> {
    const outPdf = await PDFDocument.create();

    // Group pages by docId to minimize parsing overhead
    // However, since the order in pagePlan uses potentially interleaved pages,
    // we must iterate pagePlan and copy individually.
    // To optimize, we can cache the loaded PDFDocuments.

    const loadedDocs: Record<string, PDFDocument> = {};

    for (const item of pagePlan) {
        let sourcePdf = loadedDocs[item.docId];
        if (!sourcePdf) {
            const docData = docs[item.docId];
            if (!docData) throw new Error(`Document not found for id ${item.docId}`);
            sourcePdf = await PDFDocument.load(docData.bytes);
            loadedDocs[item.docId] = sourcePdf;
        }

        const [copiedPage] = await outPdf.copyPages(sourcePdf, [item.pageIndex]);
        // Apply rotation if needed (not tracked in current simple model, but easy to add)
        // if (item.rotation) copiedPage.setRotation(degrees(item.rotation));

        outPdf.addPage(copiedPage);
    }

    const pdfBytes = await outPdf.save();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new Blob([pdfBytes as any], { type: 'application/pdf' });
}
