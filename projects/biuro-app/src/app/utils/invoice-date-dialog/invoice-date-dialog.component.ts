import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-invoice-date-dialog',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatButtonModule, MatDatepickerModule, FormsModule],
  templateUrl: './invoice-date-dialog.component.html',
  styleUrls: ['./invoice-date-dialog.component.scss']
})
export class InvoiceDateDialogComponent {
  selectedDate: Date | null = null;

  constructor(public dialogRef: MatDialogRef<InvoiceDateDialogComponent>) {}

  ngOnInit() {
    this.selectedDate = new Date();
  }

  onSave(): void {
    this.dialogRef.close(this.selectedDate);
  }
}
