import { Component, inject, Input } from '@angular/core';
import { IReport, IReportHeader } from '../../../../../../electron/src/interfaces';
import { MonthlyPickerComponent } from '../../../utils/monthly-picker/monthly-picker.component';
import { ReportsService } from '../../../service/reports.service';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-summary-report',
  standalone: true,
  imports: [MatTabsModule, MonthlyPickerComponent, MatInputModule, FormsModule],
  templateUrl: './summary-report.component.html',
  styleUrl: './summary-report.component.scss'
})
export class SummaryReportComponent {
  @Input() header: IReportHeader;
  date: Date = new Date();
  report: IReport;

  reportService = inject(ReportsService);

  async onGenerate() {
    let input = {
      month: this.date.getMonth() + 1,
      year: this.date.getFullYear()
    }

    this.report = await this.reportService.generateReport(this.header, input);
    console.log(this.report);
  }

  onDateChange(date: Date) {
    this.date = date;
  }

  onNameChange(name: string) {
    this.header.name = name;
  }
}
