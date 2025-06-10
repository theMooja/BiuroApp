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
  currentStopper?: IStopperEntity;

  get user() {
    return this.userService.user;
  }

  get stoppers(): IStopperEntity[] {
    let stoppers = this.getStoppers();
    return stoppers;
  }

  seconds: number = 0;

  onStopperSelect(stopper: IStopperEntity) {
    this.currentStopper = stopper;
    this.seconds = stopper.seconds;
  }

  getStoppers(): IStopperEntity[] {
    let monthly = this.monthly;
    return monthly.marches
      .map(march => march.stoppers)
      .flat()
      .filter(stopper => stopper && stopper.user.id === this.user?.id);
  }

  async onStopperSave() {
    if (!this.currentStopper) {
      return;
    }

    // Update the current stopper with the new seconds
    this.currentStopper.seconds = this.seconds;

    // Save the updated stopper
    await this.marchDataService.updateStopper(this.currentStopper);

  }

  async onStopperDelete() {
  }
}
