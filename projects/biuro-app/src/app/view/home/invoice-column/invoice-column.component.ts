import { Component, InjectionToken, Injector, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { IInvoiceEntity, IMonthlyEntity } from '../../../../../../electron/src/interfaces';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { InvoiceOverlayComponent } from '../invoice-overlay/invoice-overlay.component';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

export const MONTHLY_INJECTION_TOKEN = new InjectionToken<{ monthly: IMonthlyEntity, overlayRef: OverlayRef }>('MONTHLY_INJECTION_TOKEN');

@Component({
  selector: 'invoice-column',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatListModule, MatIconModule, MatInputModule, MatFormFieldModule, FormsModule],
  templateUrl: './invoice-column.component.html',
  styleUrl: './invoice-column.component.scss'
})
export class InvoiceColumnComponent {
  @Input() monthly!: IMonthlyEntity;

  sumCat1 = this.getSumInvoice('księgowość');
  sumCat2 = this.getSumInvoice('kadry');

  ngOnInit() {
    this.calculateSums();
  }

  get lines() {
    return this.monthly.invoices[0]?.lines;
  }

  getSumInvoice(category: string) {
    if (!this.monthly || !this.monthly.invoices[0] || !this.lines) return 0;
    return this.lines
      .filter(line => line.category === category)
      .reduce((acc, line) => acc + (line.price * line.qtty), 0);
  }

  calculateSums() {
    this.sumCat1 = this.getSumInvoice('księgowość');
    this.sumCat2 = this.getSumInvoice('kadry');
  }
}
