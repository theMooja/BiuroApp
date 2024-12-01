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
import { EmployeesDialogComponent } from '../../report/employees/employees-dialog/employees-dialog.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [MatSidenavModule, MatIconModule, MatMenuModule, MatListModule, CommonModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent {
  reportNames: string[];
  activeReport: IReport;
  reportHeaders: IReportHeader[];
  loadingIdx: number = 0;

  constructor(private listValuesService: ListValuesService, private reportService: ReportsService, private matDialog: MatDialog) {

  }

  async ngOnInit() {
    this.reportNames = await this.listValuesService.get(ListValueTargets.REPORT);
    this.reportHeaders = await this.reportService.getHeaders();
  }

  onAdd(reportType: string) {

    switch (reportType) {
      case 'pracownicy':
        const dialogRef = this.matDialog.open(EmployeesDialogComponent, {

        });
        dialogRef.afterClosed().subscribe(result => {
          this.onGenerate(reportType, result);
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
}
