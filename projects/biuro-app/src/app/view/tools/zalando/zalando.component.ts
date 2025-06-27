import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import * as XLSX from 'xlsx';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { FormsModule } from '@angular/forms';
import { MonthlyPickerComponent } from '../../../utils/monthly-picker/monthly-picker.component';
pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/pdf.worker.min.mjs';

@Component({
  selector: 'app-zalando',
  standalone: true,
  imports: [MatBadgeModule, MatInputModule, MatButtonModule, CommonModule, MatTabsModule, FormsModule, MonthlyPickerComponent],
  templateUrl: './zalando.component.html',
  styleUrl: './zalando.component.scss'
})
export class ZalandoComponent {
  tabIndex = 0;

  prefix: string = '';
  suffix: string = '';
  date: Date = new Date();
  cardsFile: File | null = null;
  isSorting = false;

  csvResult: {
    name?: string;
    kod: string;
    date: string;
    start: string;
    hours: string;
  }[] = [];

  async onExtract() {
    if (!this.cardsFile) {
      return;
    }
    this.csvResult = [];

    const data = new Uint8Array(await this.cardsFile.arrayBuffer());
    const pdfDocument = await pdfjsLib.getDocument({ data }).promise;

    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const table = await this.extractTableFromPage(page);
      const name = await this.extractNameFromPage(page);
      const kod = this.getKodFromName(name);
      if (!kod) continue;
      const times = this.getCSVResultFromTable(table, kod);
      if (times.length > 0) {
        this.csvResult.push(...times);
      }
    }

    //make and csv file
    const csvContent = this.csvResult.map(row => {
      return `${row.kod};${row.date};${row.start};${row.hours}`;
    }).join('\n');
    console.log('CSV Content:', csvContent);

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Karty zalando ${this.date.getFullYear()}-${this.date.getMonth() + 1}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  getCSVResultFromTable(table: Record<string, string>[], kod: string): typeof this.csvResult {
    let result: typeof this.csvResult = [];

    table.forEach(row => {
      const day = row['oznaczenie_dnia_godz_nr_czecia_czenia_czenia'];
      const start = row['pora_wymiar_rane'];
      const hours = row['informacje_dodatkowe_licz_zakon_zakon_100']; //godz_dobowe_wolny

      if (day && start && hours) {
        const date = new Date(this.date.getTime());
        date.setMonth(this.date.getMonth());
        date.setDate(parseInt(day, 10) + 1);
        const formattedDate = date.toISOString().slice(0, 10);
        result.push({
          kod: kod,
          date: formattedDate,
          start: this.adjustNightTime(start),
          hours: hours
        });
      }
    });

    return result;
  }

  adjustNightTime(time: string): string {
    let [hourStr, minuteStr] = time.split(':');
    let hour = parseInt(hourStr, 10);
    let minute = parseInt(minuteStr, 10);

    if (hour >= 14) {
      minute += 15;
      if (minute >= 60) {
        minute -= 60;
        hour += 1;
      }
    }

    const paddedHour = hour.toString().padStart(2, '0');
    const paddedMinute = minute.toString().padStart(2, '0');

    return `${paddedHour}:${paddedMinute}`;
  }

  async extractTableFromPage(page: pdfjsLib.PDFPageProxy): Promise<Record<string, string>[]> {
    interface TextItem { str: string; x: number; y: number; }

    // 1) extract all text items
    const tc = await page.getTextContent();
    const items: TextItem[] = (tc.items as any[]).map(item => {
      const [, , , , x, y] = item.transform as number[];
      return { str: (item.str as string).trim(), x, y };
    });

    // 2) bucket into rows (±2pt Y-tolerance)
    const rowsMap = new Map<number, TextItem[]>();
    const tol = 2;
    for (const it of items) {
      let key = [...rowsMap.keys()].find(y0 => Math.abs(y0 - it.y) < tol);
      if (key === undefined) { key = it.y; rowsMap.set(key, []); }
      rowsMap.get(key)!.push(it);
    }

    // 3) sort rows top→bottom & cells left→right
    const rawRows = [...rowsMap.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([, cells]) =>
        cells.sort((a, b) => a.x - b.x).map(c => c.str)
      );

    // 4) locate header block and data start
    const headerStart = rawRows.findIndex(r => /oznaczenie/i.test(r[0] || ''));
    const dataStart = rawRows.findIndex(r => /^\d{1,2}$/.test(r[0] || ''));

    if (headerStart < 0 || dataStart <= headerStart) {
      throw new Error('Table header/data boundary not found');
    }

    // 5) slice out all header rows (often two lines) and the numeric data rows
    const headerRows = rawRows.slice(headerStart, dataStart);
    const dataRows = rawRows
      .slice(dataStart)
      .filter(r => /^\d{1,2}$/.test(r[0] || ''));

    // 6) figure out how many columns the header spans
    const colCount = Math.max(...headerRows.map(r => r.length));

    // 7) merge multi-line headers into one array of snake_case keys
    const mergeHeader = Array.from({ length: colCount }, (_, i) => {
      const txt = headerRows.map(r => r[i] || '').join(' ').replace(/\s+/g, ' ').trim();
      return txt
        .toLowerCase()
        // remove/replace diacritics if you like, and non-word chars:
        .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
    });

    // 8) build your row objects
    return dataRows.map(row => {
      const rec: Record<string, string> = {};
      mergeHeader.forEach((key, i) => rec[key] = row[i] ?? '');
      return rec;
    });
  }

  onCardsSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.cardsFile = input.files[0];
    }
  }

  getKodFromName(name: string): string {
    const parts = name.split(' ');
    console.log(`Extracting kod from name: ${name}`);

    let employee: typeof this.employees[0] | undefined = undefined;

    const employees = this.employees.filter(emp => emp.surname === parts[0].toUpperCase());
    if (employees.length === 1) {
      employee = employees[0];
    } else if (employees.length > 1) {
      employee = employees.find(emp => parts[1].toUpperCase().includes(emp.name));
    } else {
      console.warn(`No employee found for absence: ${name}`);
      return '';
    }
    if (!employee) {
      console.warn(`No matching employee for absence: ${name}`);
      return '';
    }

    return employee.kod;
  }

  async extractNameFromPage(page: pdfjsLib.PDFPageProxy): Promise<string> {
    const textContent = await page.getTextContent();
    const text = textContent.items.map((item: any) => item.str).join(' ');

    const regex = new RegExp(`${this.prefix}(.*?)${this.suffix}`, 's'); // Example regex, adjust for your use case
    const nameMatch = text.match(regex);
    const employeeName = nameMatch ? nameMatch[1].trim() : ``;

    return employeeName;
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
    if (!this.cardsFile) {
      return;
    }

    try {
      this.isSorting = true;
      // Extract text content for sorting
      const pageTexts = await this.extractTextFromPDF(this.cardsFile);

      // Load the PDF
      const pdfBytes = await this.cardsFile.arrayBuffer();
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
      a.download = `${this.cardsFile.name}_sorted.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      console.log('Sorted PDF created and downloaded.');
    } catch (error) {
      console.error('Error:', error);
    }
    this.isSorting = false;
  }

  absencesFile: File | null = null;
  absences: {
    employee: string,
    surname: string,
    name: string,
    absenceType: string,
    startDate: string,
    endDate: string,
    matched?: boolean
  }[] = [];

  employeesFile: File | null = null;
  employees: {
    name: string,
    surname: string,
    kod: string,
  }[] = [];

  definitionsFile: File | null = null;
  definitions: {
    name: string,
    reason: string,
    mapFrom: string
  }[] = [];

  results: {
    kod: string,
    def: string,
    reason: string,
    from: string,
    to: string,
  }[] = [];

  onMatch() {
    this.results = [];
    this.absences.forEach(absence => {
      let employee: typeof this.employees[0] | undefined = undefined;
      const employees = this.employees.filter(emp => emp.surname === absence.surname);
      if (employees.length === 1) {
        employee = employees[0];
      } else if (employees.length > 1) {
        employee = employees.find(emp => absence.name.includes(emp.name));
      } else {
        console.warn(`No employee found for absence: ${absence.employee}`);
      }
      if (!employee) {
        console.warn(`No matching employee for absence: ${absence.employee}`);
        return;
      }

      const definition = this.definitions.find(def => def.mapFrom === absence.absenceType);
      if (!definition) {
        console.warn(`No definition found for absence type: ${absence.absenceType}`);
        return;
      }
      absence.matched = true;

      this.results.push({
        kod: employee.kod,
        def: definition.name,
        reason: definition.reason,
        from: absence.startDate,
        to: absence.endDate
      });
    });
    console.log('Matching results:', this.results);
  }

  async onExport() {
    const aoa = this.results.map(result => [
      'NieobecnośćPracownika',
      'PracownikFirmy',
      result.kod,
      result.def,
      result.reason,
      result.from,
      result.to
    ]);
    aoa.unshift(['Class', 'Pracownik:Class', 'Pracownik:Kod', 'Definicja:Nazwa', 'Zwolnienie.Przyczyna', 'Okres.Od', 'Okres.Do']);

    const worksheet = XLSX.utils.aoa_to_sheet(aoa);
    const tsv = XLSX.utils.sheet_to_txt(worksheet, { FS: '\t' });
    await navigator.clipboard.writeText(tsv);
  }


  onLoadAbsences(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.absencesFile = input.files[0];
    } else return;

    const reader = new FileReader();
    reader.onload = (e) => {
      console.log('File loaded:', this.absencesFile);
      const data = new Uint8Array(reader.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: 10, blankrows: false });
      console.log('Sheet data:', sheetData);

      const surnameRegex = /^[\p{L}\p{M}]+/u;
      const nameRegex = /^(?:[\p{L}\p{M}]+\s+)(.*?)(?=\s*\()/u;

      this.absences = sheetData.map((row: any) => ({
        employee: row[0],
        absenceType: row[2],
        startDate: row[3],
        endDate: row[4],
        surname: (row[0].match(surnameRegex)?.[0] || '').toUpperCase(),
        name: (row[0].match(nameRegex)?.[1] || '').toUpperCase(),
      }));
      console.log('Parsed absences:', this.absences);
    };

    reader.readAsArrayBuffer(this.absencesFile as File);
  }

  onLoadDefinitions(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.definitionsFile = input.files[0];
    } else return;

    const reader = new FileReader();
    reader.onload = (e) => {
      console.log('File loaded:', this.definitionsFile);
      const data = new Uint8Array(reader.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      this.parseEmployees(workbook.Sheets['pracownicy']);
      console.log('Parsed employees:', this.employees);
      this.parseDefinitions(workbook.Sheets['nieobecnosci']);
      console.log('Parsed definitions:', this.definitions);
    };

    reader.readAsArrayBuffer(this.definitionsFile as File);
  }

  parseEmployees(sheet: XLSX.WorkSheet) {
    const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 0, blankrows: false });

    this.employees = sheetData.map((row: any) => ({
      name: row["Imie"].toUpperCase(),
      surname: row["Nazwisko"].toUpperCase(),
      kod: row["Kod"]
    }));

  }

  parseDefinitions(sheet: XLSX.WorkSheet) {
    const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 0, blankrows: false });
    this.definitions = sheetData.map((row: any) => ({
      name: row["Definicja:Nazwa"],
      reason: row["Zwolnienie.Przyczyna"],
      mapFrom: row["zalando"],
    }));
  }
}
