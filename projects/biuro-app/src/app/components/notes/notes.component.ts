import { afterNextRender, Component, EventEmitter, inject, Injector, Input, Output, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { IMonthlyEntity, INoteEntity } from '../../../../../electron/src/interfaces';
import { MatButtonModule } from '@angular/material/button';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { FormsModule } from '@angular/forms';
import { CdkTextareaAutosize, TextFieldModule } from '@angular/cdk/text-field';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MonthlyDataService } from '../../service/monthly-data.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { UserDataService } from '../../service/user-data.service';
import { MatCardModule } from '@angular/material/card';


@Component({
  selector: 'notes-column',
  standalone: true,
  imports: [MatButtonModule, FormsModule, MatFormFieldModule, MatInputModule, TextFieldModule, CommonModule, MatIconModule, MatCardModule],
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.scss'
})
export class NotesComponent {
  @Input() monthly!: IMonthlyEntity;
  private overlayRef: OverlayRef | null = null;
  isEdit!: boolean;
  private _injector = inject(Injector);
  @ViewChild('autosize') autosize!: CdkTextareaAutosize;
  currentNote: INoteEntity;
  @Output() refresh = new EventEmitter();

  constructor(private monthlyDataService: MonthlyDataService, private userDataService: UserDataService,
    private overlay: Overlay, private vcr: ViewContainerRef) { }

  get notes() {
    this.monthly.notes ??= [];
    return this.monthly.notes;
  }

  get currentText() {
    return this.currentNote.text;
  }

  set currentText(val) {
    this.currentNote.text = val
  }

  async onSave() {
    await this.monthlyDataService.updateNote(this.currentNote);
    this.isEdit = false;
    this.hideTooltip();
    this.refresh.emit();
  }

  onEdit() {
    this.isEdit = true;
  }

  onAdd() {
    let note = {
      text: 'nowa',
      user: undefined,
      monthly: this.monthly,
      persists: false
    };
    this.notes.push(note);
  }

  onPinUser() {
    if (this.currentNote.user) {
      this.currentNote.user = undefined;
      return;
    }
    this.currentNote.user = this.userDataService.user;
  }

  onPersists() {
    this.currentNote.persists = !this.currentNote.persists;
  }

  showTooltip(tooltipTemplate: TemplateRef<any>, note: INoteEntity, event: MouseEvent) {
    if (this.isEdit) return;
    this.currentNote = note;

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
