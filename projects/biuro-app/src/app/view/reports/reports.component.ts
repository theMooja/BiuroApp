import { Component, ComponentRef, inject, Type, ViewChild, ViewContainerRef, ChangeDetectorRef, output, Injectable, Directive } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ListValuesService } from '../../service/list-values.service';
import { IListValue, IReport, IReportHeader, ListValueTargets } from '../../../../../electron/src/interfaces';
import { ReportsService } from '../../service/reports.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ClientProfitabilityComponent } from './client-profitability/client-profitability.component';
import { SummaryReportComponent } from './summary-report/summary-report.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { BudgetReportComponent } from './budget-report/budget-report.component';


@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [MatSidenavModule, MatIconModule, MatMenuModule, MatListModule, CommonModule, MatButtonModule,
    ClientProfitabilityComponent, SummaryReportComponent, MatToolbarModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent {
  reportNames: IListValue[];
  activeReport: IReportHeader | null;
  reportHeaders: IReportHeader[];
  loadingIdx: number = 0;
  isDeleting = false;

  @ViewChild('reportContainer', { read: ViewContainerRef }) reportContainer: ViewContainerRef;

  private listValuesService = inject(ListValuesService);
  private reportService = inject(ReportsService);
  componentRef: ComponentRef<any>;

  constructor() { }

  async ngOnInit() {
    this.reportNames = await this.listValuesService.get(ListValueTargets.REPORT);
    this.reportHeaders = await this.reportService.getHeaders();
  }

  async onAdd(reportType: string) {
    let header: IReportHeader;

    switch (reportType) {
      case 'clientProfitability':
        header = {
          type: reportType,
          name: 'rentowność klientów ' + (new Date().getMonth() + 1) + ' ' + new Date().getFullYear(),
        }
        break;
      case 'summary':
        header = {
          type: reportType,
          name: 'sumy ' + (new Date().getMonth() + 1) + ' ' + new Date().getFullYear(),
        }
        break;
      case 'budget':
        header = {
          type: reportType,
          name: 'budżet ' + (new Date().getMonth() + 1) + ' ' + new Date().getFullYear(),
        }
        break;
      default:
        throw 'bad report type';
    }


    header = await this.reportService.saveReport({ ...header, input: "{}", output: "{}" });
    this.reportHeaders = [...this.reportHeaders, header];
    this.onOpen(header);
  }

  async onDelete() {
    if (!this.isDeleting) {
      this.isDeleting = true;
      return;
    }

    this.isDeleting = false;

    this.activeReport && await this.reportService.removeReport(this.activeReport);
    this.reportHeaders = this.reportHeaders.filter(report => report !== this.activeReport);
    this.activeReport = null;
    if (this.reportContainer) {
      this.reportContainer.clear();
    }
  }

  async onOpen(header: IReportHeader) {
    this.activeReport = header;

    this.loadReportComponent();

    if (this.componentRef && this.componentRef.instance && this.componentRef.instance.onSave) {
      this.componentRef.instance.onOpen(header);
    }
  }

  loadReportComponent(): void {
    if (this.reportContainer) {
      this.reportContainer.clear();
    }

    const componentType = this.activeReport && reportComponentMapping[this.activeReport.type];
    if (componentType) {
      this.componentRef = this.reportContainer.createComponent(componentType);
    }
  }

  onGenerate() {
    if (this.componentRef && this.componentRef.instance && this.componentRef.instance.onGenerate) {
      this.componentRef.instance.onGenerate();
    }
  }

  onSave() {
    if (this.componentRef && this.componentRef.instance && this.componentRef.instance.onSave) {
      this.componentRef.instance.onSave();
    }
  }
}

export const reportComponentMapping: { [key: string]: Type<any> } = {
  clientProfitability: ClientProfitabilityComponent,
  summary: SummaryReportComponent,
  budget: BudgetReportComponent
};


