import { Component, Input } from '@angular/core';
import { IClientsReportOutput, IReport } from '../../../../../../electron/src/interfaces';

@Component({
  selector: 'app-client-report',
  standalone: true,
  imports: [],
  templateUrl: './client-report.component.html',
  styleUrl: './client-report.component.scss'
})
export class ClientReportComponent {
  @Input() report: IReport;

  constructor() { }

  get data() {
    return JSON.parse(this.report.output) as IClientsReportOutput;
  }
}
