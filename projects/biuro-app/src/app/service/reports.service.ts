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

  async generateReport(header: IReportHeader, input: any): Promise<IReport> {
    return await window.electron.generateReport(header, input);
  }

  async removeReport(report: IReportHeader) {
    return await window.electron.removeReport(report);
  }
}
