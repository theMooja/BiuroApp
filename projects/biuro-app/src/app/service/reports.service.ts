import { Injectable } from '@angular/core';
import { IReport, IReportHeader } from '../../../../electron/src/interfaces';
import { NotificationsService } from 'angular2-notifications';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  constructor(private notificationsService: NotificationsService) { }

  async getReport(report: IReportHeader): Promise<IReport> {
    let result = await window.electron.getReport(report);
    return result;
  }

  getHeaders(): Promise<IReportHeader[]> {
    return window.electron.getHeaders();
  }

  async generateReport(header: IReportHeader, input: any): Promise<IReport> {
    return await window.electron.generateReport(header, input).then((res) => {
      this.notificationsService.success('Wygenerowano raport', header.name);
      return res;
    }, (err) => {
      this.notificationsService.error('Generowanie raportu nie powiodło się', err.message);
    });
  }

  async removeReport(report: IReportHeader) {
    return await window.electron.removeReport(report).then((res) => {
      this.notificationsService.success('Usunięto raport', report.name);
    }, (err) => {
      this.notificationsService.error('Błąd podczas usuwania raportu', err.message);
    });
  }

  async saveReport(report: IReport): Promise<IReport> {
    return await window.electron.saveReport(report).then((res) => {
      this.notificationsService.success('Zapisano raport', report.name);
      return res;
    }, (err) => {
      this.notificationsService.error('Zapisywanie raportu nie powiodło się', err.message);
    });
  }
}
