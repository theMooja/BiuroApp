import { computed, inject, Injectable, signal } from "@angular/core";
import { IMarchEntity } from "../../../../electron/src/interfaces";
import { interval, Subscription } from "rxjs";
import { MarchDataService } from "./march-data.service";
import { differenceInSeconds } from "date-fns";
import { MonthlyDataService } from "./monthly-data.service";

@Injectable({ providedIn: 'root' })
export class StopperService {
  private runningStep = signal<IMarchEntity | null>(null);
  private startTime = signal<Date | null>(null);
  private tickSub: Subscription | null = null;
  private currentSeconds = signal(0);

  private marchDataService = inject(MarchDataService);
  private monthlyDataService = inject(MonthlyDataService);


  readonly time = this.currentSeconds.asReadonly();
  readonly isRunning = computed(() => !!this.runningStep());

  async start(newStep: IMarchEntity, clientName: string) {
    const prevStep = this.runningStep();
    const startedAt = this.startTime();
    const elapsed = this.currentSeconds();

    // If there was a previous running step, save it
    if (prevStep && startedAt) {
      const stopper = await this.marchDataService.addStopper(prevStep, elapsed, startedAt);
      let step = this.getAliveStep(prevStep);
      step.stoppers.push(stopper);
    }

    this.stop(); // stop current interval

    this.runningStep.set(newStep);
    this.startTime.set(new Date());
    this.currentSeconds.set(0);

    window.electron.setTitle('▶ ' + clientName);

    this.tickSub = interval(1000).subscribe(() => {
      const start = this.startTime();
      if (start) {
        this.currentSeconds.set(differenceInSeconds(new Date(), start));
      }
    });
  }

  getAliveStep(step: IMarchEntity) {
    let monthlies = this.monthlyDataService.monthlies();
    let monthly = monthlies.find(m => m.id === step.monthly.id);
    if (!monthly) return step;
    let aliveStep = monthly.marches.find(m => m.id === step.id);
    if (!aliveStep) return step;
    return aliveStep;
  }

  stop() {
    this.tickSub?.unsubscribe();
    this.tickSub = null;

    this.runningStep.set(null);
    this.startTime.set(null);
    this.currentSeconds.set(0);
  }

  getRunningStep() {
    return this.runningStep();
  }

  getElapsedSeconds() {
    return this.currentSeconds();
  }

  getStartTime() {
    return this.startTime();
  }
}
