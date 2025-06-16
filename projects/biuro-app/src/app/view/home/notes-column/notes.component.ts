import { afterNextRender, Component, EventEmitter, inject, Injector, Input, Output, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { IMonthlyEntity, INoteEntity, IUserEntity } from '../../../../../../electron/src/interfaces';
import { MatButtonModule } from '@angular/material/button';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { FormsModule } from '@angular/forms';
import { CdkTextareaAutosize, TextFieldModule } from '@angular/cdk/text-field';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MonthlyDataService } from '../../../service/monthly-data.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { UserDataService } from '../../../service/user-data.service';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { addMonths } from 'date-fns';
import { MatSelectModule } from '@angular/material/select';


@Component({
  selector: 'notes-column',
  standalone: true,
  imports: [MatButtonModule, FormsModule, MatFormFieldModule, MatInputModule, TextFieldModule, CommonModule, MatIconModule, MatCardModule,
    MatDatepickerModule, MatSelectModule
  ],
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
  private userDataService: UserDataService = inject(UserDataService);
  userId: number = 0;

  constructor(private monthlyDataService: MonthlyDataService,
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

  get users(): IUser[] {
    return this.userDataService.data.map(user => ({
      id: user.id,
      name: user.name
    }));
  }

  async onDelete() {
    if (this.currentNote.deleteing) {

      if (this.currentNote.id)
        await this.monthlyDataService.deleteNote(this.currentNote);

      this.notes.splice(this.notes.indexOf(this.currentNote), 1);
      this.isEdit = false;
      this.hideTooltip();

    } else {
      this.currentNote.deleteing = true;
    }
  }

  async onSave() {
    this.currentNote.user = this.getUserEntity();
    let note = await this.monthlyDataService.updateNote(this.currentNote);
    this.currentNote.id = note.id;
    this.isEdit = false;
    this.hideTooltip();
  }

  getUserEntity(): IUserEntity | undefined {
    if (this.userId === 0) return undefined;
    return this.userDataService.data.find(user => user.id === this.userId);
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

  onPersists() {
    this.currentNote.persists = !this.currentNote.persists;
  }

  showTooltip(tooltipTemplate: TemplateRef<any>, note: INoteEntity, event: MouseEvent) {
    if (this.isEdit) return;

    this.currentNote = note;
    if (this.currentNote?.user) {
      this.userId = this.currentNote.user.id;
    } else {
      this.userId = 0;
    }

    if (!this.overlayRef) {
      const positionStrategy = this.overlay
        .position()
        .flexibleConnectedTo(event.target as HTMLElement)
        .withPositions([
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
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

  isForMe(note: INoteEntity) {
    return !note.user || note.user.id === this.userDataService?.user?.id;
  }

  onAddMonth() {
    if (this.currentNote.dueDate) {
      this.currentNote.dueDate = addMonths(this.currentNote.dueDate, 1);
    }
  }

  onClearDueDate() {
    this.currentNote.dueDate = undefined;
  }
}

interface IUser {
  id: number;
  name: string;
}
