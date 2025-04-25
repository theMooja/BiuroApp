import { Injectable } from '@angular/core';
import { IInvoiceEntity } from '../../../../electron/src/interfaces';
import { NotificationsService } from 'angular2-notifications';
import { error } from 'console';

@Injectable({
  providedIn: 'root'
})
export class InvoiceDataService {

  constructor(private notificationsService: NotificationsService) { }

  async saveInvoice(invoice: IInvoiceEntity): Promise<IInvoiceEntity> {
    return await window.electron.saveInvoice(invoice).then((inv) => {
      this.notificationsService.success('Faktura została zapisana', inv.no);
      return inv;
    }, (err) => {
      this.notificationsService.error('Nie można zapisać faktury', err.message);
    });
  }

  async saveInvoiceDates(invoices: IInvoiceEntity[]) {
    await window.electron.saveInvoiceDates(invoices).then(() => {
      this.notificationsService.success('Zmieniono daty na fakturach', invoices.map(x => x.monthly.client.name).join(', '));
    }, (err) => {
      this.notificationsService.error('Nie można zapisać faktury', err.message);
    });;
  }

  async getInvoices(clientId: number, year: number, month: number): Promise<IInvoiceEntity[]> {
    return await window.electron.getInvoices(clientId, year, month);
  }

  async integrateInvoice(invoice: IInvoiceEntity): Promise<IInvoiceEntity> {
    return await window.electron.integrateInvoice(invoice).then((res) => {
      this.notificationsService.success('Faktura wysłana do fakturowni', res.no);
      return res;
    }, (err) => {
      this.notificationsService.error('Nie można wysłać faktury', err.message);
    });
  }
}
