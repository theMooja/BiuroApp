import { Component, inject, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { IInvoiceEntity, IListValue, IMonthlyEntity, ListValueTargets } from '../../../../../../electron/src/interfaces';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { InvoiceDataService } from '../../../service/invoice-data.service';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ListValuesService } from '../../../service/list-values.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MONTHLY_INJECTION_TOKEN } from '../invoice-column/invoice-column.component';
import { OverlayRef } from '@angular/cdk/overlay';

@Component({
  selector: 'app-invoice-overlay',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,
    MatInputModule, MatFormFieldModule, MatIcon, MatButtonModule, MatAutocompleteModule, MatDatepickerModule, MatSelectModule],
  templateUrl: './invoice-overlay.component.html',
  styleUrl: './invoice-overlay.component.scss'
})
export class InvoiceOverlayComponent {
  monthly: IMonthlyEntity;
  invoice: IInvoiceEntity;

  invoiceForm: FormGroup;
  previousForm: FormGroup;
  previousInvoice: IInvoiceEntity;
  descriptionValues: IListValue[] = [];
  categoryValues: IListValue[] = [];

  private invoiceDataService: InvoiceDataService = inject(InvoiceDataService);
  private listValuesService: ListValuesService = inject(ListValuesService);

  constructor(private formBuilder: FormBuilder,
    @Inject(MONTHLY_INJECTION_TOKEN) public data: { monthly: IMonthlyEntity, overlayRef: OverlayRef }
  ) {

    this.monthly = this.data.monthly;
    this.invoice = this.monthly.invoices[0];

    if(!this.invoice) {
      this.invoice = {
        id: undefined,
        no: '',
        sendDate: undefined,
        paidDate: undefined,
        lines: [],
        monthly: this.monthly
      };
    }

    this.invoiceForm = this.formBuilder.group({
      no: this.formBuilder.control(this.invoice?.no),
      id: this.formBuilder.control(this.invoice?.id),
      sendDate: this.formBuilder.control(this.invoice?.sendDate),
      paidDate: this.formBuilder.control(this.invoice?.paidDate),
      lines: this.formBuilder.array(this.invoice.lines.map(x => this.formBuilder.group({
        id: this.formBuilder.control(x.id),
        description: this.formBuilder.control(x.description),
        price: this.formBuilder.control(x.price),
        qtty: this.formBuilder.control(x.qtty),
        category: this.formBuilder.control(x.category),
        vat: this.formBuilder.control(x.vat)
      })))
    });
  }

  async ngOnInit() {
    this.descriptionValues = await this.listValuesService.get(ListValueTargets.INVOICE_DESC);
    this.categoryValues = await this.listValuesService.get(ListValueTargets.INVOICE_CATEGORY);
  }

  get lines() {
    return this.invoiceForm.get('lines') as FormArray;
  }

  get previousLines() {
    return this.previousForm.get('lines') as FormArray;
  }

  addInvoiceLine() {
    this.lines.push(this.formBuilder.group({
      id: this.formBuilder.control(undefined),
      description: this.formBuilder.control(''),
      price: this.formBuilder.control(0),
      qtty: this.formBuilder.control(1),
      category: this.formBuilder.control(''),
      vat: this.formBuilder.control(this.getDefaultVat())
    }));
  }

  removeInvoiceLine(idx: number) {
    this.lines.removeAt(idx);
  }

  async onSave() {
    let invoice = await this.invoiceDataService.saveInvoice({
      ...this.invoiceForm.value,
      monthly: this.monthly
    });
    this.monthly.invoices[0] = invoice;
    console.log(invoice);
    this.close();
  }

  close() {
    this.data.overlayRef.dispose();
  }

  createPreviousForm(invoice: IInvoiceEntity) {
    this.previousForm = this.formBuilder.group({
      no: this.formBuilder.control(invoice.no),
      id: this.formBuilder.control(invoice.id),
      sendDate: this.formBuilder.control(invoice.sendDate),
      paidDate: this.formBuilder.control(invoice.paidDate),
      lines: this.formBuilder.array(invoice.lines.map(x => this.formBuilder.group({
        id: this.formBuilder.control(x.id),
        description: this.formBuilder.control(x.description),
        price: this.formBuilder.control(x.price),
        qtty: this.formBuilder.control(x.qtty),
        category: this.formBuilder.control(x.category),
        vat: this.formBuilder.control(x.vat)
      })))
    });
  }

  onPrevious() {
    this.invoiceDataService.getInvoices(this.monthly.client.id, this.monthly.year, this.monthly.month - 1).then(invoices => {
      this.previousInvoice = invoices[0];
      this.createPreviousForm(this.previousInvoice);
    });
  }

  getDefaultVat() {
    if (this.monthly.info.firma == 'FinKa') {
      return 'zw';
    } else {
      return '23%';
    }
  }
}
