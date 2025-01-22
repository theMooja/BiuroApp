import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ListValuesService } from '../../service/list-values.service';
import { IReport, IReportHeader, ListValueTargets } from '../../../../../electron/src/interfaces';
import { ReportsService } from '../../service/reports.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { EmployeesReportDialogComponent } from '../../report/employees/employees-dialog/employees-report-dialog.component';
import { EmployeesReportComponent } from '../../report/employees/employees-report/employees-report.component';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmationDialogComponent } from '../../utils/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [MatSidenavModule, MatIconModule, MatMenuModule, MatListModule, CommonModule, EmployeesReportComponent, MatButtonModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent {
  reportNames: string[];
  activeReport: IReport;
  reportHeaders: IReportHeader[];
  loadingIdx: number = 0;

  constructor(private dialog: MatDialog, private listValuesService: ListValuesService, private reportService: ReportsService, private matDialog: MatDialog) {

  }

  async ngOnInit() {
    this.reportNames = await this.listValuesService.get(ListValueTargets.REPORT);
    this.reportHeaders = await this.reportService.getHeaders();
  }

  onAdd(reportType: string) {

    switch (reportType) {
      case 'pracownicy':
        const dialogRef = this.matDialog.open(EmployeesReportDialogComponent, {

        });
        dialogRef.afterClosed().subscribe(result => {
          result && this.onGenerate(reportType, result);
        });
    }

  }

  onGenerate(reportType: string, data: any) {
    let loadingIdx = this.loadingIdx++;

    this.reportService.generateReport(reportType, data.name, data).then((res) => {

      let idx = this.reportHeaders.findIndex(x => x.isLoading === loadingIdx);
      if (idx !== -1) this.reportHeaders[idx] = res;
    });

    let header: IReportHeader = {
      name: data.name,
      type: reportType,
      isLoading: loadingIdx
    };

    this.reportHeaders.push(header);
  }

  async onOpen(report: IReportHeader) {
    this.activeReport = await this.reportService.getReport(report);
  }

  async onRemove(report: IReportHeader) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '250px',
      data: { title: 'Wiesz co robisz?', message: 'Usunąć ten raport?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.reportService.removeReport(report);
        this.reportHeaders.splice(this.reportHeaders.indexOf(report), 1);
      }
    });
  }
}
