import { afterNextRender, Component, inject, Injector, Input, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { ClientDataService } from '../../service/client-data.service';
import { ClientMonthly } from '../../../../../electron/src/interfaces';
import { MatButtonModule } from '@angular/material/button';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { FormsModule } from '@angular/forms';
import { CdkTextareaAutosize, TextFieldModule } from '@angular/cdk/text-field';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [MatButtonModule, FormsModule, MatFormFieldModule, MatInputModule, TextFieldModule],
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.scss'
})
export class NotesComponent {
  @Input() monthly!: ClientMonthly;
  private overlayRef: OverlayRef | null = null;
  isEdit!: boolean;
  private _injector = inject(Injector);
  @ViewChild('autosize') autosize!: CdkTextareaAutosize;

  constructor(private dataService: ClientDataService, private overlay: Overlay, private vcr: ViewContainerRef) { }

  get notes() {
    return this.monthly.notes;
  }

  set notes(val: string) {
    this.monthly.notes = val;
  }

  async onSave() {
    this.dataService.updateMonthlyNotes(this.monthly.id, this.notes);
    this.isEdit = false;
    this.hideTooltip();
  }

  onEdit() {
    this.isEdit = true;
  }

  showTooltip(tooltipTemplate: TemplateRef<any>, event: MouseEvent) {
    if (this.isEdit) return;

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
    if (this.overlayRef && !this.isEdit) {
      this.overlayRef.detach();
      this.overlayRef = null;
    }
  }

  triggerResize() {
    afterNextRender(
      () => {
        this.autosize.resizeToFitContent(true);
      },
      {
        injector: this._injector,
      },
    );
  }
}