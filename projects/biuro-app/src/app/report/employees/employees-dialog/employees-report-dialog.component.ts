import { Component, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';



@Component({
  selector: 'app-employees-report-dialog',
  standalone: true,
  imports: [MatDialogModule, MatDatepickerModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatButtonModule],
  templateUrl: './employees-report-dialog.component.html',
  styleUrl: './employees-report-dialog.component.scss',
  providers: []
})
export class EmployeesReportDialogComponent {
  readonly dialogRef = inject(MatDialogRef<EmployeesReportDialogComponent>);
  readonly date = new FormControl();
  readonly name = new FormControl();
  dateFormat = 'MM/YYYY';


  constructor() {

  }

  setMonthAndYear(date: Date, datepicker: MatDatepicker<Date>) {
    this.date.setValue(date);	
    datepicker.close();
  }

  onSubmit() {
    let date = this.date.value;

    this.dialogRef.close({
      type: 'pracownicy',
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      name: this.name.value
    });
  }
}
