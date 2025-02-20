import { Component, Input } from '@angular/core';
import { IMonthlyEntity } from '../../../../../../electron/src/interfaces';

@Component({
  selector: 'app-taskbar',
  standalone: true,
  imports: [],
  templateUrl: './taskbar.component.html',
  styleUrl: './taskbar.component.scss'
})
export class TaskbarComponent {
  @Input() monthlies: IMonthlyEntity[];
}
