import { Component, inject } from '@angular/core';
import { IReportHeader, ISummaryReportInput, ISummaryReportOutput } from '../../../../../../electron/src/interfaces';
import { MonthlyPickerComponent } from '../../../utils/monthly-picker/monthly-picker.component';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ReportComponent } from '../IReportComponent';
import { ReportsService } from '../../../service/reports.service';

@Component({
  selector: 'app-summary-report',
  standalone: true,
  imports: [MatTabsModule, MonthlyPickerComponent, MatInputModule, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './summary-report.component.html',
  styleUrl: './summary-report.component.scss'
})
export class SummaryReportComponent extends ReportComponent<ISummaryReportInput, ISummaryReportOutput> {
  date: Date = new Date();
  tabIndex: number = 0;
  reportCategories: string[];
  reportFormas: string[];

  override init() {
    super.init();
    this.reportCategories = [];
    this.reportFormas = [];

    let sumInvoice = this.output.sumInvoice;

    for (let cat in sumInvoice) {
      if (!this.reportCategories.includes(cat))
        this.reportCategories.push(cat);

      for (let form in sumInvoice[cat]) {
        if (!this.reportFormas.includes(form))
          this.reportFormas.push(form);
      }
    }

    console.log('init', this.report);
    if (this.input?.year)
      this.date = new Date(this.input.year, this.input.month - 1);
  }

  override async onGenerate() {
    await super.onGenerate();
    this.tabIndex = 1;
  }

  getInput(): ISummaryReportInput {
    return {
      month: this.date.getMonth() + 1,
      year: this.date.getFullYear()
    };
  }

  async onSave() {
    this.report.name = this.header.name;
    this.report.input = JSON.stringify(this.input);
    await this.reportService.saveReport(this.report);
  }

  onDateChange(date: Date) {
    this.date = date;
    this.input.year = date.getFullYear();
    this.input.month = date.getMonth() + 1;
  }

  onNameChange(name: string) {
    this.header.name = name;
  }

  sum(o: any): number {
    if (o.hasOwnProperty('sum')) {
      return o.sum;
    }
    return Object.keys(o).reduce((acc, key) => acc + this.sum(o[key]), 0);;
  }

  get hasOutput(): boolean {
    return !this.isEmptyObject(this.output);
  }
}
