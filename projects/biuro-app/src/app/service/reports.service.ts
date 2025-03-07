import { Injectable } from '@angular/core';
import { IReport, IReportHeader } from '../../../../electron/src/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  constructor() { }

  async getReport(report: IReportHeader): Promise<IReport> {
    let result = await window.electron.getReport(report);
    return result;
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

  async saveReport(report: IReport): Promise<IReport> {
    return await window.electron.saveReport(report);
  }
}
