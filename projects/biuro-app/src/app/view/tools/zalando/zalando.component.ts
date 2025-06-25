import { Component } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { read } from 'fs';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-zalando',
  standalone: true,
  imports: [MatBadgeModule, MatInputModule, MatButtonModule],
  templateUrl: './zalando.component.html',
  styleUrl: './zalando.component.scss'
})
export class ZalandoComponent {

  absencesFile: File | null = null;
  absences: {
    employee: string,
    absenceType: string,
    startDate: string,
    endDate: string,
  }[] = [];

  employeesFile: File | null = null;
  employees: {
    name: string,
    surname: string,
    kod: string,
    pesel: string,
  }[] = [];

  onLoadEmployees(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.employeesFile = input.files[0];
    } else return;

    const reader = new FileReader();
    reader.onload = (e) => {
      console.log('File loaded:', this.employeesFile);
      const data = new Uint8Array(reader.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 0, blankrows: false });
      console.log('Sheet data:', sheetData);

      this.employees = sheetData.map((row: any) => ({
        name: row["Imie"],
        surname: row["Nazwisko"],
        kod: row["Kod"],
        pesel: row["Workers.Info.Historia.PESEL"],
      }));
      console.log('Parsed employees:', this.employees);
    }

    reader.readAsArrayBuffer(this.employeesFile as File);
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

      this.absences = sheetData.map((row: any) => ({
        employee: row[0],
        absenceType: row[2],
        startDate: row[3],
        endDate: row[4],
      }));
      console.log('Parsed absences:', this.absences);
    };

    reader.readAsArrayBuffer(this.absencesFile as File);
  }

  onLoadDefinitions() {
    // Logic to load definitions goes here
  }
}
