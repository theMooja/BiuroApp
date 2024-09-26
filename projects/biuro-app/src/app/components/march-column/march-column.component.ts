import { Component, Input } from '@angular/core';
import { ClientMonthly, IMarchValue } from '../../../../../electron/src/interfaces';

@Component({
  selector: 'march-column',
  standalone: true,
  imports: [],
  templateUrl: './march-column.component.html',
  styleUrl: './march-column.component.scss'
})
export class MarchColumnComponent {
  @Input() element!: ClientMonthly;
  currentStep!: IMarchValue;

  ngOnInit() {
    this.currentStep = this.findLastStep();

  }

  findLastStep(): IMarchValue {
    let idx = this.element.marchValues.findIndex(x => !x.value || x.value === 0);
     if (idx === -1) idx = this.element.marchValues.length - 1;
      console.log('found', idx);
     return this.element.marchValues[idx];
  }
}
