import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ListValuesService } from '../../service/list-values.service';
import { ListValueTargets } from '../../../../../electron/src/interfaces';
import { ReportsService } from '../../service/reports.service';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatMenuModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent {
  reportNames: string[];

  constructor(private listValuesService: ListValuesService, private reportService: ReportsService) {

  }

  async ngOnInit() {
    this.reportNames = await this.listValuesService.get(ListValueTargets.REPORT);
  }

  onAdd(reportName: string) {
    this.onGenerate(reportName + 'ttt', { type: reportName });
  }

  onGenerate(reportName: string, data: any) {
    this.reportService.generateReport(reportName, data);
  }
}
