import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { IMarchEntity, IMonthlyEntity } from '../../../../../../electron/src/interfaces';
import { UserDataService } from '../../../service/user-data.service';
import { MarchDataService } from '../../../service/march-data.service';
import { MatButtonModule } from '@angular/material/button';
import { MonthlyDataService } from '../../../service/monthly-data.service';

@Component({
  selector: 'app-taskbar',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './taskbar.component.html',
  styleUrl: './taskbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskbarComponent {
  @Input() monthlies: IMonthlyEntity[];
  tasks: {
    monthly: IMonthlyEntity;
    title: string;
  }[] = [];
  @Output() trigger = new EventEmitter<IMonthlyEntity>();

  constructor(private userDataService: UserDataService,
    private cdr: ChangeDetectorRef,
    private marchDataService: MarchDataService,
    private monthlyDataService: MonthlyDataService) {
  }

  ngOnInit() {
    this.updateTasks();
    this.marchDataService.marchChange$.subscribe(() => this.updateTasks());
    this.monthlyDataService.noteChange$.subscribe(() => this.updateTasks());
  }

  get user() {
    return this.userDataService.user;
  }

  private updateTasks(): void {
    if (!this.monthlies) {
      this.tasks = [];
    } else {
      const userId = this.user?.id;
      const now = new Date();

      const marchTasks = this.monthlies
        .flatMap(monthly => {
          monthly.marches.forEach(m => (m.monthly = monthly));
          return monthly.marches;
        })
        .filter(march => march.isReady && march.owner?.id === userId)
        .map(march => ({
          monthly: march.monthly,
          title: march.name
        }));

      const noteTasks = this.monthlies
        .flatMap(monthly =>
          monthly.notes
            .filter(note =>
              note.dueDate &&
              note.dueDate < now &&
              (!note.user || note.user.id === userId)
            )
            .map(note => ({
              monthly: monthly,
              title: note.text
            }))
        );

      this.tasks = [...noteTasks, ...marchTasks];
    }

    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  triggerTask(march: typeof this.tasks[0]) {
    this.trigger.emit(march.monthly);
  }
}
