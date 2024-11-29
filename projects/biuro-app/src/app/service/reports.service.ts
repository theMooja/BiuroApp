import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  constructor() { }

  async generateReport(reportName: string, data: any): Promise<void> {
    return await window.electron.generateReport(reportName, data);
  }
}
