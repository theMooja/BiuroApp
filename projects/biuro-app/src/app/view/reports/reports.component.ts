import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ListValuesService } from '../../service/list-values.service';
import { IReport, IReportHeader, ListValueTargets } from '../../../../../electron/src/interfaces';
import { ReportsService } from '../../service/reports.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';

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

  constructor(private listValuesService: ListValuesService, private reportService: ReportsService) {

  }

  async ngOnInit() {
    this.reportNames = await this.listValuesService.get(ListValueTargets.REPORT);
    this.reportHeaders = await this.reportService.getHeaders();
  }

  onAdd(reportType: string) {
    this.onGenerate(reportType, {});
  }

  onGenerate(reportName: string, data: any) {
    let loadingIdx = this.loadingIdx++;

    this.reportService.generateReport(reportName, { type: reportName }).then((res) => {

      let idx = this.reportHeaders.findIndex(x => x.isLoading === loadingIdx);
      if (idx !== -1) this.reportHeaders[idx] = res;
    });

    let header: IReportHeader = {
      name: reportName,
      type: reportName,
      isLoading: loadingIdx
    };

    this.reportHeaders.push(header);
  }

  async onOpen(report: IReportHeader) {
    this.activeReport = await this.reportService.getReport(report);
  }
}
