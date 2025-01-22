import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-client-report-dialog',
  standalone: true,
  imports: [],
  templateUrl: './client-report-dialog.component.html',
  styleUrl: './client-report-dialog.component.scss'
})
export class ClientReportDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ClientReportDialogComponent>);

  onSubmit() {

    this.dialogRef.close({
      type: 'klienci',
    });
  }
}
