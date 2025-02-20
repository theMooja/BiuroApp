import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { IInvoiceEntity, IMonthlyEntity, ListValueTargets } from '../../../../../electron/src/interfaces';
import { DATA_INJECTION_TOKEN } from '../home/invoice-column/invoice-column.component';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { OverlayRef } from '@angular/cdk/overlay';
import { InvoiceDataService } from '../../service/invoice-data.service';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ListValuesService } from '../../service/list-values.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';

@Component({
  selector: 'app-invoice-overlay',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,
    MatInputModule, MatFormFieldModule, MatIcon, MatButtonModule, MatAutocompleteModule, MatDatepickerModule],
  templateUrl: './invoice-overlay.component.html',
  styleUrl: './invoice-overlay.component.scss'
})
export class InvoiceOverlayComponent {
  invoiceForm: FormGroup;
  invoice: IInvoiceEntity;
  monthly: IMonthlyEntity;
  descriptionValues: string[] = [];

  constructor(@Inject(DATA_INJECTION_TOKEN) private data: { invoice: IInvoiceEntity, overlayRef: OverlayRef, monthly: IMonthlyEntity },
    private formBuilder: FormBuilder, private invoiceDataService: InvoiceDataService, private listValuesService: ListValuesService) {

    this.invoice = this.data.invoice;
    this.monthly = this.data.monthly;

    this.invoiceForm = this.formBuilder.group({
      no: this.formBuilder.control(this.invoice.no),
      id: this.formBuilder.control(this.invoice.id),
      sendDate: this.formBuilder.control(this.invoice.sendDate),
      paidDate: this.formBuilder.control(this.invoice.paidDate),
      lines: this.formBuilder.array(this.invoice.lines.map(x => this.formBuilder.group({
        id: this.formBuilder.control(x.id),
        description: this.formBuilder.control(x.description),
        price: this.formBuilder.control(x.price),
        qtty: this.formBuilder.control(x.qtty)
      })))
    });
  }

  async ngOnInit() {
    this.descriptionValues = await this.listValuesService.get(ListValueTargets.INVOICE_DESC);
  }

  get lines() {
    return this.invoiceForm.get('lines') as FormArray;
  }

  addInvoiceLine() {
    this.lines.push(this.formBuilder.group({
      id: this.formBuilder.control(undefined),
      description: this.formBuilder.control(''),
      price: this.formBuilder.control(0),
      qtty: this.formBuilder.control(1)
    }));
  }

  removeInvoiceLine(idx: number) {
    this.lines.removeAt(idx);
  }

  async onSave() {
    console.log(this.invoiceForm.value);
    await this.invoiceDataService.saveInvoice({
      ...this.invoiceForm.value,
      monthly: this.monthly
    });
    this.monthly.invoices[0] = this.invoiceForm.value;
    this.close();
  }

  close() {
    this.data.overlayRef.dispose();
  }
}
