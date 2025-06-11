import { Component, inject, Input } from '@angular/core';
import { IMonthlyEntity, IStopperEntity } from '../../../../../../electron/src/interfaces';
import { UserDataService } from '../../../service/user-data.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SecondsToMMSSPipe } from '../../../utils/seconds-to-mmss.pipe';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MarchDataService } from '../../../service/march-data.service';
import { create } from 'domain';

@Component({
  selector: 'app-stopper-overlay',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, SecondsToMMSSPipe, DatePipe, FormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './stopper-overlay.component.html',
  styleUrl: './stopper-overlay.component.scss'
})
export class StopperOverlayComponent {
  @Input() monthly!: IMonthlyEntity;
  private userService = inject(UserDataService);
  private marchDataService = inject(MarchDataService);
  currentStopper!: IStopper;

  get user() {
    return this.userService.user;
  }

  onStopperSelect(stopper: IStopper) {
    this.currentStopper = stopper;
  }

  ngOnInit() {
    this.currentStopper = this.getStoppers()[0];
  }

  getStoppers(): IStopper[] {
    let monthly = this.monthly;
    return monthly.marches
      .map(march =>
        (march.stoppers || [])
          .filter(stopper => stopper && stopper.user.id === this.user?.id)
          .map(stopper => ({
            name: march.name,
            seconds: stopper.seconds,
            id: stopper.id,
            createdAt: stopper.from
          }))
      )
      .flat()
      .sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0;
      });
  }

  getStopperEntity(): IStopperEntity {
    let s = this.monthly.marches
      .map(march => march.stoppers)
      .flat()
      .find(stopper => stopper.id === this.currentStopper?.id);

    if (s) return s;
    else throw new Error("Stopper not found");
  }

  async onFifteen(e: MouseEvent) {
    let seconds = 15 * 60;

    if (e.button === 2) {
      seconds = -seconds;
    }

    this.currentStopper.seconds += seconds;
  }

  async onStopperSave() {
    if (!this.currentStopper) {
      return;
    }

    let stopperToSave = this.getStopperEntity();
    stopperToSave.seconds = this.currentStopper.seconds;

    await this.marchDataService.updateStopper(stopperToSave);
  }
}

interface IStopper {
  name: string;
  seconds: number;
  createdAt?: Date;
  id?: number;
}
