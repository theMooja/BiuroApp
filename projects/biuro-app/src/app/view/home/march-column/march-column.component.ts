import { ChangeDetectorRef, Component, Input, ViewChild } from '@angular/core';
import { IMonthlyEntity, IMarchEntity, StepType } from '../../../../../../electron/src/interfaces';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatMenuModule, MatMenu } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MarchDataService } from '../../../service/march-data.service';
import { differenceInSeconds } from 'date-fns';
import { SecondsToMMSSPipe } from '../../../utils/seconds-to-mmss.pipe';
import { CommonModule } from '@angular/common';
import { MatCalendar, MatDatepicker, MatDatepickerModule, MatDatepickerToggle } from '@angular/material/datepicker';
import { UserDataService } from '../../../service/user-data.service';

@Component({
  selector: 'march-column',
  standalone: true,
  imports: [MatCalendar, MatMenuModule, MatButtonModule, MatIconModule, SecondsToMMSSPipe, CommonModule, MatDatepickerModule, MatMenuModule],
  templateUrl: './march-column.component.html',
  styleUrl: './march-column.component.scss'
})
export class MarchColumnComponent {
  @Input() monthly!: IMonthlyEntity;
  currentStep!: IMarchEntity;
  @ViewChild('leftMenuTrigger') leftMenuTrigger!: MatMenuTrigger;
  isRunning!: boolean;
  startTime!: Date;
  intervalId?: any;

  get currentDate() {
    return this.currentStep.finishedAt;
  }

  get currentTime() {
    if (!this.isRunning) return 0;

    return differenceInSeconds(new Date(), this.startTime);
  }

  get totalTime() {
    return this.currentTime +
      this.currentStep.stoppers.reduce((prev, curr) => prev + curr.seconds, 0)
  }

  get isDateStep() {
    return this.currentStep.type === StepType.DATE;
  }

  get user() {
    return this.userService.user;
  }

  constructor(private marchDataService: MarchDataService, private cdr: ChangeDetectorRef,
    private userService: UserDataService
  ) { }

  ngOnInit() {
    this.onStepSelected(this.findLastStep());

    this.marchDataService.runningMarch$.subscribe(x => this.marchStarted(x));
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
    this.marchDataService.startMarch(this.currentStep, this.monthly.client.name);

    this.intervalId = setInterval(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  async stopStopper() {
    if (!this.isRunning) return;
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
    let visible = this.monthly.marches
      .filter(x => x.type !== StepType.HIDDEN)
      .sort((a, b) => a.sequence - b.sequence);

    let last = visible
      .find(x => x.value !== 1); //1 = done

    //unset isReady
    visible.forEach(x => x.isReady = false);
    if (last) {
      last.isReady = true;
      this.marchDataService.marchChanged();
      return last;
    }
    
    this.marchDataService.marchChanged();
    return visible.slice()
      .sort((a, b) => b.sequence - a.sequence)[0];
  }

  async onStepValueSelected(val: number) {
    this.currentStep.value = val;
    this.marchDataService.updateMarchValue(this.currentStep);
    await this.stopStopper();

    this.leftMenuTrigger.closeMenu();
    this.currentStep = this.findLastStep();
  }

  onDateSelected(event: any, calendar: MatMenuTrigger) {
    let date = new Date(event);
    console.log(date);
    this.currentStep.value = 1;
    this.currentStep.finishedAt = date;
    this.marchDataService.updateMarchValue(this.currentStep);
    this.currentStep = this.findLastStep();
    calendar.closeMenu();
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
    switch (this.currentStep.type) {
      case StepType.GR:
        return [1, 0];
      case StepType.GYR:
        return [1, 2, 0];
      default:
        return [0];
    }
  }

  get steps() {
    return this.monthly.marches.filter(m => m.type !== StepType.HIDDEN);
  }

  getStepDescriptionClass(val: number) {
    return 'step-desc-' + val;
  }

  getStepValueClass(val: number) {
    return 'step-value-' + val;
  }

  getStepDescription(val: number) {
    switch (val) {
      case 0:
        return 'Do zrobienia'
      case 1:
        return 'Nie ukończone'
      case 2:
        return 'Zrobione'
      default:
        return ''
    }

  }
}
