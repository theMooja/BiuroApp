import { Component, InjectionToken, Injector, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { IInvoiceEntity, IMonthlyEntity } from '../../../../../../electron/src/interfaces';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { InvoiceOverlayComponent } from '../../invoice-overlay/invoice-overlay.component';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

export const DATA_INJECTION_TOKEN = new InjectionToken<{ monthly: IMonthlyEntity, invoice: IInvoiceEntity, overlayRef: OverlayRef }>('DATA_INJECTION_TOKEN');

@Component({
  selector: 'invoice-column',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatListModule, MatIconModule],
  templateUrl: './invoice-column.component.html',
  styleUrl: './invoice-column.component.scss'
})
export class InvoiceColumnComponent {
  @Input() monthly!: IMonthlyEntity;

  constructor(
    private overlay: Overlay
  ) {
  }

  get lines() {
    return this.monthly.invoices[0]?.lines;
  }

  onEdit() {
    const overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-dark-backdrop',
      disposeOnNavigation: true,
    });

    let invoice = this.monthly.invoices[0] || {
      no: '',
      lines: []
    };

    let data = Injector.create({
      providers: [{
        provide: DATA_INJECTION_TOKEN, useValue: {
          invoice: invoice,
          overlayRef: overlayRef,
          monthly: this.monthly
        }
      }],
    });

    const overlayPortal = new ComponentPortal(InvoiceOverlayComponent, null, data);
    overlayRef.attach(overlayPortal);
    overlayRef.backdropClick().subscribe(() => overlayRef.dispose());
  }
}
