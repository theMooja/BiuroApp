import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { IMarchEntity, IMonthlyEntity } from '../../../../../../electron/src/interfaces';
import { UserDataService } from '../../../service/user-data.service';
import { MarchDataService } from '../../../service/march-data.service';
import { MatButtonModule } from '@angular/material/button';

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
  tasks: IMarchEntity[] = [];
  @Output() trigger = new EventEmitter<IMarchEntity>();

  constructor(private userDataService: UserDataService, private cdr: ChangeDetectorRef, private marchDataService: MarchDataService) {
  }

  ngOnInit() {
    this.updateTasks();
    this.marchDataService.marchChange$.subscribe(() => this.updateTasks());
  }

  get user() {
    return this.userDataService.user;
  }

  private updateTasks() {
    if (!this.monthlies) {
      this.tasks = [];
    } else {
      this.tasks = [...this.monthlies
        .map(x => {
          x.marches.forEach(m => m.monthly = x);
          return x.marches
        })
        .flat()
        .filter(x => x.isReady && x.owner?.id === this.user?.id)]
    }
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  triggerTask(march: IMarchEntity) {
    this.trigger.emit(march);
  }
}
