import { Component, Input } from '@angular/core';
import { IReport, IReportHeader } from '../../../../../../electron/src/interfaces';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MonthlyPickerComponent } from './../../../utils/monthly-picker/monthly-picker.component';

@Component({
  selector: 'app-client-profitability',
  standalone: true,
  imports: [MatSidenavModule, MonthlyPickerComponent],
  templateUrl: './client-profitability.component.html',
  styleUrl: './client-profitability.component.scss'
})
export class ClientProfitabilityComponent {
  @Input() report: IReportHeader;
  date: Date = new Date();

  onGenerate() {

  }

  onDateChange(date: Date) {
    this.date = date;
  }

}
