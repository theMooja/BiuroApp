import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import Papa from 'papaparse';
import { FormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-account-swap',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, CommonModule, FormsModule, MatBadgeModule],
  templateUrl: './account-swap.component.html',
  styleUrl: './account-swap.component.scss'
})
export class AccountSwapComponent {
  clients: {
    name: string;
    nip: string;
    account: string;
    matched: boolean;
    no: string;
  }[] = [];

  transactions: {
    name: string;
    nip: string;
    no: string;
    account: string;
    matched: boolean;
  }[] = [];

  clientsFile: File | null = null;
  transactionsFile: File | null = null;

  clientsColumns: { label: string, value: string }[] = [
    { label: 'Nazwa', value: 'Nazwa' },
    { label: 'NIP', value: 'NIP' },
    { label: 'Nr konta', value: 'account' },
    { label: 'Nr faktury', value: 'no' }
  ];

  transactionColumns: { label: string, value: number }[] = [
    { label: 'Tytuł', value: 1 },
    { label: 'NIP', value: 2 },
    { label: 'Nr konta', value: 3 },
    { label: 'Nr faktury', value: 4 }

  ];
  ommit: number = 34;

  onTransactionsFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.transactionsFile = input.files[0];
    this.parseTransactionsFile();
    console.log('Selected transactions file:', this.transactionsFile);
  }

  parseTransactionsFile() {
    if (!this.transactionsFile) return;
    Papa.parse(this.transactionsFile as File, {
      header: false,
      skipEmptyLines: true,
      comments: '#',
      delimiter: ';',
      beforeFirstChunk: chunk => {
        const lines = chunk.split(/\r\n|\n|\r/);
        return lines.slice(this.ommit).join('\n'); // skip first 20 lines
      },
      complete: (results: any) => {
        this.transactions = results.data.map((row: any) => ({
          name: row[this.transactionColumns[0].value] || '',
          nip: row[this.transactionColumns[1].value] || '',
          no: row[this.transactionColumns[2].value] || '',
          account: row[this.transactionColumns[3].value] || '',
          matched: false
        }));
        console.log('Data loaded:', results.data);
        console.log('Transactions loaded:', this.transactions);

      },
      error: (error: any) => {
        console.error('Error parsing CSV:', error);
      },
    });
  }

  parseClientsFile() {
    if (!this.clientsFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(reader.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 2, blankrows: false });
      console.log('Sheet data:', sheetData);
      this.clients = sheetData.map((row: any) => ({
        name: row[this.clientsColumns[0].value],
        nip: row[this.clientsColumns[1].value],
        account: row[this.clientsColumns[2].value],
        no: row[this.clientsColumns[3].value],
        matched: false,
      }));
    };
    reader.readAsArrayBuffer(this.clientsFile as File);
  }

  onClientsFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.clientsFile = input.files[0];
      this.parseClientsFile();
    }
  }

  onSwap() {

  }

  onDownload() {
  }
}
