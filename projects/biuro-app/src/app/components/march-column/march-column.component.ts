import { Component, Input, ViewChild } from '@angular/core';
import { ClientMonthly, IMarchValue, StepType } from '../../../../../electron/src/interfaces';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MarchDataService } from '../../service/march-data.service';
import { differenceInSeconds } from 'date-fns';

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
  startTime!: Date;

  constructor(private marchDataService: MarchDataService) { }

  ngOnInit() {
    this.currentStep = this.findLastStep();
  }

  onStopper() {
    if (this.isRunning) {
      this.stopStopper();
    } else {
      this.startStopper();
    }
  }

  startStopper() {
    this.startTime = new Date();
    this.isRunning = true;
  }

  stopStopper() {
    this.isRunning = false;
    let seconds = differenceInSeconds(new Date(), this.startTime);
    this.marchDataService.addStopper(this.currentStep, seconds, this.startTime);
  }

  onFifteen(e: MouseEvent) {
    if (e.button === 0) {
      this.marchDataService.addStopper(this.currentStep, 15 * 60, new Date())
    }
    if (e.button === 2) {
      this.marchDataService.addStopper(this.currentStep, -15 * 60, new Date())
    }
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
