import { Component, Input, ViewChild } from '@angular/core';
import { ClientMonthly, IMarchValue, StepType } from '../../../../../electron/src/interfaces';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { ClientDataService } from '../../service/client-data.service';
import { MatIconModule } from '@angular/material/icon';
import { MarchDataService } from '../../service/march-data.service';

@Component({
  selector: 'march-column',
  standalone: true,
  imports: [MatMenuModule, MatButtonModule, MatIconModule],
  templateUrl: './march-column.component.html',
  styleUrl: './march-column.component.scss'
})
export class MarchColumnComponent {
  @Input() element!: ClientMonthly;
  currentStep!: IMarchValue;
  @ViewChild('leftMenuTrigger') leftMenuTrigger!: MatMenuTrigger;
  @ViewChild('rightMenuTrigger') rightMenuTrigger!: MatMenuTrigger;
  isRunning!: boolean;

  constructor(private marchDataService: MarchDataService) { }

  ngOnInit() {
    this.currentStep = this.findLastStep();
  }

  onStopper() {

  }

  onStopperAdd(minutes: number) {

  }

  findLastStep(): IMarchValue {
    let idx = this.element.marchValues.findIndex(x => !x.value || x.value === 0);
    if (idx === -1) idx = this.element.marchValues.length - 1;
    return this.element.marchValues[idx];
  }

  onStepValueSelected(val: any) {
    this.currentStep.value = val;
    this.marchDataService.updateMarchValue(this.currentStep);
    this.leftMenuTrigger.closeMenu();
    this.currentStep = this.findLastStep();
  }

  get stepValues() {
    if (this.currentStep.type === StepType.Double) return [0, 1];
    else return [0, 1, 2];
  }
}
