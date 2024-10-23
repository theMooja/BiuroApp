import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { IMonthlyEntity } from '../../../../../electron/src/interfaces';
import { DATA_INJECTION_TOKEN } from '../invoice-column/invoice-column.component';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { OverlayRef } from '@angular/cdk/overlay';
import { InvoiceDataService } from '../../service/invoice-data.service';

@Component({
  selector: 'app-invoice-overlay',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,
    MatInputModule, MatFormFieldModule],
  templateUrl: './invoice-overlay.component.html',
  styleUrl: './invoice-overlay.component.scss'
})
export class InvoiceOverlayComponent {
  invoiceForm: FormGroup;
  monthly: IMonthlyEntity;

  constructor(@Inject(DATA_INJECTION_TOKEN) private data: { entity: IMonthlyEntity, overlayRef: OverlayRef },
    private formBuilder: FormBuilder, private invoiceDataService: InvoiceDataService) {
    this.monthly = this.data.entity;

    this.invoiceForm = this.formBuilder.group({
      no: this.formBuilder.control(this.monthly.invoices[0].no),
      lines: this.formBuilder.array(this.monthly.invoices[0].lines.map(x => this.formBuilder.group({
        id: this.formBuilder.control(x.id),
        description: this.formBuilder.control(x.description),
        price: this.formBuilder.control(x.price),
        qtty: this.formBuilder.control(x.qtty)
      })))
    });
  }

  get lines() {
    return this.invoiceForm.get('lines') as FormArray;
  }

  addInvoiceLine() {
    this.lines.push(this.formBuilder.group({
      id: this.formBuilder.control(undefined),
      description: this.formBuilder.control(''),
      price: this.formBuilder.control(0),
      qtty: this.formBuilder.control(0)
    }));
  }

  removeInvoiceLine(idx: number) {
    this.lines.removeAt(idx);
  }

  async onSave() {
    await this.invoiceDataService.saveInvoice(this.invoiceForm.value);
    this.close();
  }

  close() {
    this.data.overlayRef.dispose();
  }
}
