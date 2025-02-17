import { Injectable } from '@angular/core';
import { IInvoiceEntity } from '../../../../electron/src/interfaces';

@Injectable({
  providedIn: 'root'
})
export class InvoiceDataService {

  constructor() { }

  async saveInvoice(invoice: IInvoiceEntity) {
    await window.electron.saveInvoice(invoice);
  }

  async saveInvoiceDates(invoices: IInvoiceEntity[]) {
    await window.electron.saveInvoiceDates(invoices);
  }
}
