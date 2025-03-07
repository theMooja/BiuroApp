import { Component, inject, Input } from '@angular/core';
import { IReport, IReportHeader, ISummaryReportInput, ISummaryReportOutput } from '../../../../../../electron/src/interfaces';
import { MonthlyPickerComponent } from '../../../utils/monthly-picker/monthly-picker.component';
import { ReportsService } from '../../../service/reports.service';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-summary-report',
  standalone: true,
  imports: [MatTabsModule, MonthlyPickerComponent, MatInputModule, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './summary-report.component.html',
  styleUrl: './summary-report.component.scss'
})
export class SummaryReportComponent {
  header: IReportHeader;
  date: Date = new Date();
  report: IReport;
  tabIndex: number = 0;
  reportCategories: string[];
  reportFormas: string[];
  output: ISummaryReportOutput;
  input: ISummaryReportInput;

  reportService = inject(ReportsService);

  init() {
    this.reportCategories = [];
    this.reportFormas = [];

    this.input = this.isEmptyObject(this.report.input) ? {} : JSON.parse(this.report.input);
    this.output = this.isEmptyObject(this.report.output) ? {} : JSON.parse(this.report.output);

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

  async onGenerate() {
    let input = {
      month: this.date.getMonth() + 1,
      year: this.date.getFullYear()
    }

    this.report = await this.reportService.generateReport(this.header, input);
    this.init();
    this.tabIndex = 1;
  }

  async onSave() {
    this.report.name = this.header.name;
    this.report.input = JSON.stringify(this.input);
    await this.reportService.saveReport(this.report);
  }

  async onOpen(header: IReportHeader) {
    this.header = header;
    this.report = await this.reportService.getReport(header);
    this.init();
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

  isEmptyObject(obj: unknown): boolean {
    return !!obj && Object.keys(obj).length === 0;
  }
}
