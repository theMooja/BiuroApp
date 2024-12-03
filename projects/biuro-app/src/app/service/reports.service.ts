import { Injectable } from '@angular/core';
import { IReport, IReportHeader } from '../../../../electron/src/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  constructor() { }

  async getReport(report: IReportHeader): Promise<IReport> {
    return await window.electron.getReport(report);
  }

  getHeaders(): Promise<IReportHeader[]> {
    return window.electron.getHeaders();
  }

  async generateReport(reportType: string, reportName: string, data: any): Promise<IReportHeader> {
    return await window.electron.generateReport(reportType, reportName, data);
  }

  async removeReport(report: IReportHeader) {
    return await window.electron.removeReport(report);
  }
}
