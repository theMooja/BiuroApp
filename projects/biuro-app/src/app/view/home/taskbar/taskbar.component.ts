import { ChangeDetectorRef, Component, Input, SimpleChanges } from '@angular/core';
import { IMonthlyEntity } from '../../../../../../electron/src/interfaces';
import { UserDataService } from '../../../service/user-data.service';

@Component({
  selector: 'app-taskbar',
  standalone: true,
  imports: [],
  templateUrl: './taskbar.component.html',
  styleUrl: './taskbar.component.scss'
})
export class TaskbarComponent {
  @Input() monthlies: IMonthlyEntity[];

  constructor(private userDataService: UserDataService, private cdr: ChangeDetectorRef) { }

  get user() {
    return this.userDataService.user;
  }

  get tasks() {
    if(!this.monthlies) return [];
    return this.monthlies.map(x => x.marches).flat().filter(x => x.isReady && x.owner?.id === this.user?.id);
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('change');
    if (changes['monthlies']) {
      this.cdr.detectChanges();
    }
  }
}
