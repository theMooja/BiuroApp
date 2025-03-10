import { Injectable } from '@angular/core';
import { IInvoiceEntity } from '../../../../electron/src/interfaces';

@Injectable({
  providedIn: 'root'
})
export class InvoiceDataService {

  constructor() { }

  async saveInvoice(invoice: IInvoiceEntity) : Promise<IInvoiceEntity> {
    return await window.electron.saveInvoice(invoice);
  }

  async saveInvoiceDates(invoices: IInvoiceEntity[]) {
    await window.electron.saveInvoiceDates(invoices);
  }
  
  async getInvoices(clientId: number, year: number, month: number): Promise<IInvoiceEntity[]> {
    return await window.electron.getInvoices(clientId, year, month);
  }
}
