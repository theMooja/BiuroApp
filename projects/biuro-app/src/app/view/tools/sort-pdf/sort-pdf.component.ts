import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

@Component({
  selector: 'app-sort-pdf',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatButtonModule, FormsModule],
  templateUrl: './sort-pdf.component.html',
  styleUrls: ['./sort-pdf.component.scss']
})
export class SortPdfComponent {
  prefix: string = '';
  suffix: string = '';
  selectedFile: File | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  async extractTextFromPDF(file: File): Promise<string[]> {
    const data = new Uint8Array(await file.arrayBuffer());
    const pdfDocument = await pdfjsLib.getDocument({ data }).promise;
    const pageTexts: string[] = [];

    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      const text = textContent.items.map((item: any) => item.str).join(' ');
      pageTexts.push(text);
    }

    return pageTexts;
  }

  async onSort(): Promise<void> {
    if (!this.selectedFile) {
      return;
    }

    try {
      // Extract text content for sorting
      const pageTexts = await this.extractTextFromPDF(this.selectedFile);

      // Load the PDF
      const pdfBytes = await this.selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);

      // Collect pages with their respective text
      const pageDetails = pageTexts.map((text, index) => {
        // Extract employee name based on a pattern (adjust as needed)
        const regex = new RegExp(`${this.prefix}(.*?)${this.suffix}`, 's'); // Example regex, adjust for your use case
        const nameMatch = text.match(regex);
        const employeeName = nameMatch ? nameMatch[1].trim() : `Unknown ${index}`;

        return { index, employeeName };
      });

      // Sort by employee name
      pageDetails.sort((a, b) => a.employeeName.localeCompare(b.employeeName));

      // Create a new sorted PDF
      const newPdfDoc = await PDFDocument.create();
      for (const detail of pageDetails) {
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [detail.index]);
        newPdfDoc.addPage(copiedPage);
      }

      // Save the sorted PDF
      const sortedPdfBytes = await newPdfDoc.save();
      const blob = new Blob([sortedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.selectedFile.name}_sorted.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      console.log('Sorted PDF created and downloaded.');
    } catch (error) {
      console.error('Error:', error);
    }
  }
}
