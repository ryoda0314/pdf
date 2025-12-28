import { describe, it, expect } from 'vitest';
import { exportPdf } from './export';
import { PDFDocument } from 'pdf-lib';
import { PdfDoc, PagePlanItem } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

describe('exportPdf', () => {
    it('should generate a merged PDF from pagePlan', async () => {
        // 1. Create dummy PDFs
        const doc1 = await PDFDocument.create();
        doc1.addPage([100, 100]);
        doc1.addPage([100, 100]);
        const bytes1 = await doc1.save();

        const doc2 = await PDFDocument.create();
        doc2.addPage([200, 200]);
        const bytes2 = await doc2.save();

        const id1 = uuidv4();
        const id2 = uuidv4();

        const docs: Record<string, PdfDoc> = {
            [id1]: {
                id: id1,
                name: 'doc1.pdf',
                byteLength: bytes1.byteLength,
                pageCount: 2,
                bytes: bytes1.buffer as ArrayBuffer,
            },
            [id2]: {
                id: id2,
                name: 'doc2.pdf',
                byteLength: bytes2.byteLength,
                pageCount: 1,
                bytes: bytes2.buffer as ArrayBuffer,
            }
        };

        // 2. Create a plan: Doc1 Page 1, Doc2 Page 0, Doc1 Page 0 (Reordered & Mixed)
        const pagePlan: PagePlanItem[] = [
            { id: 'p1', docId: id1, pageIndex: 1, rotation: 0 },
            { id: 'p2', docId: id2, pageIndex: 0, rotation: 0 },
            { id: 'p3', docId: id1, pageIndex: 0, rotation: 0 },
        ];

        // 3. Export
        const resultBlob = await exportPdf(pagePlan, docs);

        // 4. Verify
        expect(resultBlob).toBeInstanceOf(Blob);
        expect(resultBlob.size).toBeGreaterThan(0);
        expect(resultBlob.type).toBe('application/pdf');

        // Verify content by loading it back
        const arrayBuffer = await resultBlob.arrayBuffer();
        const resultPdf = await PDFDocument.load(arrayBuffer);
        expect(resultPdf.getPageCount()).toBe(3);

        // We can check page sizes to verify order
        const p1 = resultPdf.getPage(0);
        expect(p1.getSize().width).toBe(100); // doc1

        const p2 = resultPdf.getPage(1);
        expect(p2.getSize().width).toBe(200); // doc2

        const p3 = resultPdf.getPage(2);
        expect(p3.getSize().width).toBe(100); // doc1
    });
});
