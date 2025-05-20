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
import * as mt940 from 'mt940-js';


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
    no: string;
    matched: boolean;
  }[] = [];

  transactions: {
    title: string;
    account: string;
    amount: string;
    ref: string;
    date: string;
    matched: boolean;
    name?: string;
    no: string;
  }[] = [];

  clientsFile: File | null = null;
  transactionsFile: File | null = null;

  clientsColumns: { label: string, value: string }[] = [
    { label: 'Nazwa', value: 'Nazwa klienta' },
    { label: 'Nr faktury', value: 'Dowód' }
  ];

  transactionColumns: { label: string, value: number }[] = [
    { label: 'Tytuł', value: 3 },
    { label: 'Nr konta', value: 5 },
    { label: 'Kwota', value: 6 },
    { label: 'Data', value: 1 }
  ];
  ommit: number = 34;

  mt940File: {
    description: string,
    bank: string,
    ref: string,
    name: string,
    matched?: boolean
  }[] = [];


  onMtFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    Array.from(input.files).forEach((file) => {
      const reader = new FileReader();

      reader.onload = async () => {
        try {
          const arrayBuffer = reader.result as ArrayBuffer;
          const statements = await mt940.read(arrayBuffer);

          console.log(`Parsed ${statements.length} MT940 statements from ${file.name}`);

          statements.forEach((statement: any, index: number) => {
            console.log(`Statement ${index + 1}:`, statement);

            if (statement.transactions && Array.isArray(statement.transactions)) {
              statement.transactions.forEach((transaction: any) => {
                const description = transaction.description;
                const nameMatch = description.match(/~32([^\r\n~]+)/);
                const bankMatch = description.match(/~38([^\r\n~]+)/);
                const refMatch = description.match(/\b\d{5}-\d{3}-\d{4}\b/);

                if (bankMatch && refMatch) {
                  this.mt940File.push({
                    description: transaction.description,
                    bank: bankMatch[1],
                    ref: refMatch[0],
                    name: nameMatch ? nameMatch[1] : '',
                  });
                }
              });
            }
          });

        } catch (error) {
          console.error(`Error parsing MT940 file "${file.name}":`, error);
        }
      };

      reader.onerror = () => {
        console.error(`Error reading file "${file.name}":`, reader.error);
      };

      reader.readAsArrayBuffer(file);
    });
  }


  onTransactionsFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.transactionsFile = input.files[0];
    this.parseTransactionsFile();
    console.log('Selected transactions file:', this.transactionsFile);
  }

  parseTransactionsFile() {
    if (!this.transactionsFile) return;
    this.transactions = [];
    Papa.parse(this.transactionsFile as File, {
      header: false,
      skipEmptyLines: true,
      comments: '#',
      delimiter: ';',
      beforeFirstChunk: chunk => {
        const lines = chunk.split(/\r\n|\n|\r/);
        return lines.slice(this.ommit).join('\n'); // skip first X lines
      },
      complete: (results: any) => {
        console.log(results);
        results.data.forEach((row: any) => {
          const description = row[this.transactionColumns[0].value] || '';
          const refMatch = description.match(/\b\d{5}-\d{3}-\d{4}\b/);
          const noMatch = description.match(/(FV\/[A-Z0-9]+\/[A-Z0-9]+\/[A-Z0-9]+\/[A-Z0-9]+)\s/);

          this.transactions.push({
            title: description,
            account: row[this.transactionColumns[1].value] || '',
            ref: refMatch ? refMatch[0] : '',
            amount: row[this.transactionColumns[2].value] || '',
            date: row[this.transactionColumns[3].value] || '',
            no: noMatch ? noMatch[1] : '',
            matched: false
          })
        });
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
        no: row[this.clientsColumns[1].value],
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
    this.transactions.forEach(t => {
      const mt = this.mt940File.find(mt => {
        return mt.ref == t.ref;
      });
      const no = this.clients.find(c => {
        return c.no === t.no;
      });

      if (mt) {
        console.log('matched account', t, mt);
        t.account = mt.bank;
        mt.matched = true;
        t.matched = true;
      }
      if (no) {
        console.log('matched invoice', t, no);
        t.name = no.name;
        no.matched = true;
        t.matched = true;
      }
    });
  }

  exportToCSV(data: typeof this.transactions): string {
    // Create CSV header
    const header = ["title", "account", "amount", "ref", "date", "name"];
    const csvRows = [header.join(",")];

    // Create CSV rows
    for (const row of data) {
      csvRows.push([
        row.title,
        row.account,
        row.amount,
        row.ref,
        row.date,
        row.name || ''
      ].map(value => `"${value.replace(/"/g, '""')}"`).join(","));
    }

    return csvRows.join('\n');
  }

  onDownload() {
    //save this.transactions in csv
    let csvContent = this.exportToCSV(this.transactions);

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", 'manez-najem-parsed.csv');
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
