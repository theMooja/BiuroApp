import { ChangeDetectorRef, Component, Input, ViewChild } from '@angular/core';
import { IMonthlyEntity, IMarchEntity } from '../../../../../electron/src/interfaces';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MarchDataService } from '../../service/march-data.service';
import { differenceInSeconds } from 'date-fns';
import { SecondsToMMSSPipe } from '../../utils/seconds-to-mmss.pipe';

@Component({
  selector: 'march-column',
  standalone: true,
  imports: [MatMenuModule, MatButtonModule, MatIconModule, SecondsToMMSSPipe],
  templateUrl: './march-column.component.html',
  styleUrl: './march-column.component.scss'
})
export class MarchColumnComponent {
  @Input() monthly!: IMonthlyEntity;
  currentStep!: IMarchEntity;
  @ViewChild('leftMenuTrigger') leftMenuTrigger!: MatMenuTrigger;
  @ViewChild('rightMenuTrigger') rightMenuTrigger!: MatMenuTrigger;
  isRunning!: boolean;
  startTime!: Date;
  intervalId?: any;

  get currentTime() {
    if (!this.isRunning) return 0;

    return differenceInSeconds(new Date(), this.startTime);
  }

  get totalTime() {
    return this.currentTime +
      this.currentStep.stoppers.reduce((prev, curr) => prev + curr.seconds, 0)
  }

  constructor(private marchDataService: MarchDataService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.onStepSelected(this.findLastStep());

    this.marchDataService.runningMarch$.subscribe(x => this.marchStarted(x))
  }

  marchStarted(march: IMarchEntity) {
    if (march === this.currentStep) {
      return;
    }

    if (this.isRunning)
      this.stopStopper();
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
    this.marchDataService.startMarch(this.currentStep);

    this.intervalId = setInterval(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  onRightClick(event: MouseEvent) {
    event.preventDefault();
    this.rightMenuTrigger.openMenu();
  }

  async stopStopper() {
    clearInterval(this.intervalId);
    let seconds = differenceInSeconds(new Date(), this.startTime);
    let stopper = await this.marchDataService.addStopper(this.currentStep, seconds, this.startTime);
    this.currentStep.stoppers.push(stopper);
    this.isRunning = false;
  }

  async onFifteen(e: MouseEvent) {
    if (e.button === 0) {
      let stopper = await this.marchDataService.addStopper(this.currentStep, 15 * 60, new Date())
      this.currentStep.stoppers.push(stopper);
    }
    if (e.button === 2) {
      let stopper = await this.marchDataService.addStopper(this.currentStep, -15 * 60, new Date())
      this.currentStep.stoppers.push(stopper);
    }
  }

  findLastStep(): IMarchEntity {
    let idx = this.monthly.marches.findIndex(x => !x.value || x.value === 0);
    if (idx === -1) idx = this.monthly.marches.length - 1;
    return this.monthly.marches[idx];
  }

  onStepValueSelected(val: number) {
    this.currentStep.value = val;
    this.marchDataService.updateMarchValue(this.currentStep);
    this.leftMenuTrigger.closeMenu();
    this.currentStep = this.findLastStep();
  }

  onStepSelected(val: IMarchEntity) {
    this.currentStep = val;
    this.monthly.currentStep = val.name;
  }

  tryCurrentStep(name?: string) {
    if (name) {
      let step = this.monthly.marches.find(x => x.name === name);
      step && this.onStepSelected(step);
    } else {
      this.currentStep = this.findLastStep();
    }
  }

  get stepValues() {
    // if (this.currentStep.type === StepType.Double) return [0, 1];
    // else 

    return [0, 1, 2];
  }

  get steps() {
    return this.monthly.marches;
  }
}
