import { Component, inject } from '@angular/core';
import { IReportComponent } from '../reports.component';
import { IBudgetReportInput, IBudgetReportOutput, IReport, IReportHeader } from '../../../../../../electron/src/interfaces';
import { ReportsService } from '../../../service/reports.service';

@Component({
  selector: 'app-budget-report',
  standalone: true,
  imports: [],
  templateUrl: './budget-report.component.html',
  styleUrl: './budget-report.component.scss'
})
export class BudgetReportComponent extends IReportComponent<IBudgetReportInput, IBudgetReportOutput> {

  init() {
    super.init();


  }

  onGenerate(): void {
    throw new Error('Method not implemented.');
  }

  onSave(): void {
    throw new Error('Method not implemented.');
  }
}
