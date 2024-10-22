import { Component, InjectionToken, Injector, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { IMonthlyEntity } from '../../../../../electron/src/interfaces';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { InvoiceOverlayComponent } from '../invoice-overlay/invoice-overlay.component';
import { MatListModule } from '@angular/material/list';

export const DATA_INJECTION_TOKEN = new InjectionToken<{ entity: IMonthlyEntity, overlayRef: OverlayRef }>('DATA_INJECTION_TOKEN');

@Component({
  selector: 'invoice-column',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatListModule],
  templateUrl: './invoice-column.component.html',
  styleUrl: './invoice-column.component.scss'
})
export class InvoiceColumnComponent {
  @Input() monthly!: IMonthlyEntity;
  private overlayRef: OverlayRef | null = null;

  constructor(
    private overlay: Overlay, private vcr: ViewContainerRef
  ) { }

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

    let data = Injector.create({
      providers: [{
        provide: DATA_INJECTION_TOKEN, useValue: {
          entity: this.monthly,
          overlayRef: overlayRef
        }
      }],
    });
    const overlayPortal = new ComponentPortal(InvoiceOverlayComponent, null, data);
    overlayRef.attach(overlayPortal);
    overlayRef.backdropClick().subscribe(() => overlayRef.dispose());
  }

  showTooltip(tooltipTemplate: TemplateRef<any>, event: MouseEvent) {

    if (!this.overlayRef) {
      const positionStrategy = this.overlay
        .position()
        .flexibleConnectedTo(event.target as HTMLElement)
        .withPositions([
          {
            originX: 'center',
            originY: 'bottom',
            overlayX: 'center',
            overlayY: 'top',
          },
        ]);

      this.overlayRef = this.overlay.create({ positionStrategy });
    }

    const portal = new TemplatePortal(tooltipTemplate, this.vcr);
    this.overlayRef.attach(portal);
  }

  hideTooltip() {
    if (this.overlayRef) {
      this.overlayRef.detach();
      this.overlayRef = null;
    }
  }
}
