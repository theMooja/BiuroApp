import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-zalando',
  standalone: true,
  imports: [MatBadgeModule, MatInputModule, MatButtonModule, CommonModule],
  templateUrl: './zalando.component.html',
  styleUrl: './zalando.component.scss'
})
export class ZalandoComponent {

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
