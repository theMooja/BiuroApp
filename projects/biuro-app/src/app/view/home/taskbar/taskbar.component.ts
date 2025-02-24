import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { IMarchEntity, IMonthlyEntity } from '../../../../../../electron/src/interfaces';
import { UserDataService } from '../../../service/user-data.service';
import { MarchDataService } from '../../../service/march-data.service';

@Component({
  selector: 'app-taskbar',
  standalone: true,
  imports: [],
  templateUrl: './taskbar.component.html',
  styleUrl: './taskbar.component.scss',
  changeDetection: ChangeDetectionStrategy.Default
})
export class TaskbarComponent {
  @Input() monthlies: IMonthlyEntity[];
  tasks: IMarchEntity[] = [];

  constructor(private userDataService: UserDataService, private cdr: ChangeDetectorRef, private marchDataService: MarchDataService) {
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
        .map(x => x.marches)
        .flat()
        .filter(x => x.isReady && x.owner?.id === this.user?.id)]
      this.cdr.markForCheck();
    }
  }
}
