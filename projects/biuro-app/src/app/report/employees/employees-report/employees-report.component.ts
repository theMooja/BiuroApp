import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IEmployeesReportOutput, IReport } from '../../../../../../electron/src/interfaces';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employees-report',
  standalone: true,
  imports: [MatExpansionModule, CommonModule],
  templateUrl: './employees-report.component.html',
  styleUrl: './employees-report.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class EmployeesReportComponent {
  @Input() report: IReport;

  constructor() { }

  get data() {
    return JSON.parse(this.report.output) as IEmployeesReportOutput;
  }

  test() {
    console.log(this.data);
  }
}
