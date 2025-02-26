import { Component, Input } from '@angular/core';
import { IReport, IReportHeader } from '../../../../../../electron/src/interfaces';
import { ReportToolbarComponent } from '../report-toolbar/report-toolbar.component';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-client-profitability',
  standalone: true,
  imports: [ReportToolbarComponent, MatSidenavModule],
  templateUrl: './client-profitability.component.html',
  styleUrl: './client-profitability.component.scss'
})
export class ClientProfitabilityComponent {
  @Input() report: IReportHeader;

  onGenerate() {

  }


}
