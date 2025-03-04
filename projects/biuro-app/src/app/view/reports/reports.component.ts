import { Component, ComponentFactoryResolver, ComponentRef, inject, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ListValuesService } from '../../service/list-values.service';
import { IReport, IReportHeader, ListValueTargets } from '../../../../../electron/src/interfaces';
import { ReportsService } from '../../service/reports.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmationDialogComponent } from '../../utils/confirmation-dialog/confirmation-dialog.component';
import { ClientProfitabilityComponent } from './client-profitability/client-profitability.component';
import { SummaryReportComponent } from './summary-report/summary-report.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';


@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [MatSidenavModule, MatIconModule, MatMenuModule, MatListModule, CommonModule, MatButtonModule,
    ClientProfitabilityComponent, SummaryReportComponent, MatToolbarModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent {
  reportNames: string[];
  activeReport: IReportHeader;
  reportHeaders: IReportHeader[];
  loadingIdx: number = 0;

  @ViewChild('reportContainer', { read: ViewContainerRef }) reportContainer: ViewContainerRef;

  private listValuesService = inject(ListValuesService);
  private reportService = inject(ReportsService);
  componentRef: ComponentRef<any>;

  constructor(private dialog: MatDialog) {
  }

  async ngOnInit() {
    this.reportNames = await this.listValuesService.get(ListValueTargets.REPORT);
    this.reportHeaders = await this.reportService.getHeaders();
  }

  onAdd(reportType: string) {
    let header: IReportHeader;

    switch (reportType) {
      case 'clientProfitability':
        header = {
          type: reportType,
          name: 'rentowność klientów ' + (new Date().getMonth() + 1) + ' ' + new Date().getFullYear(),
        }
        this.reportHeaders.push(header);
        this.onOpen(header);
        break;
      case 'summary':
        header = {
          type: reportType,
          name: 'sumy ' + (new Date().getMonth() + 1) + ' ' + new Date().getFullYear(),
        }
        this.reportHeaders.push(header);
        this.onOpen(header);
        break;
    }
  }

  async onOpen(header: IReportHeader) {
    this.activeReport = header;
    this.loadReportComponent();
  }

  loadReportComponent(): void {
    if (this.reportContainer) {
      this.reportContainer.clear();
    }

    const componentType = reportComponentMapping[this.activeReport.type];
    if (componentType) {
      this.componentRef = this.reportContainer.createComponent(componentType);
      this.componentRef.instance.header = this.activeReport;
    }
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

  onGenerate() {
    if (this.componentRef && this.componentRef.instance && this.componentRef.instance.onGenerate) {
      this.componentRef.instance.onGenerate();
    }
  }

  onSave() {

  }
}

export const reportComponentMapping: { [key: string]: Type<any> } = {
  clientProfitability: ClientProfitabilityComponent,
  summary: SummaryReportComponent,
};
