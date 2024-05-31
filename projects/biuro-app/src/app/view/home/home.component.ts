import { Component } from '@angular/core';
import { ClientDataService } from '../../service/client-data.service';
import { MarchDataService } from './../../service/march-data.service';
import { IClient, IMarchTemplate } from '../../../../../electron/src/interfaces';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SelectionModel } from '@angular/cdk/collections';
import { MatToolbarModule } from '@angular/material/toolbar';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatTableModule, MatIconModule, FormsModule, MatInputModule, MatSelectModule, MatFormFieldModule, MatToolbarModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),],
})
export class HomeComponent {
  clients: IClient[] = [];
  templates: IMarchTemplate[] = [];
  expandedElement: IClient | null = null;
  selection = new SelectionModel<IClient>(true);

  constructor(private clientDataService: ClientDataService,
    private marchDataService: MarchDataService
  ) { }

  async ngOnInit() {
    this.clients = await this.clientDataService.getClientsMonthly(2024, 1);
    this.templates = await this.marchDataService.findTemplates();
  }

  onMarchTemplateSelected(value: any) {
    if (this.expandedElement) {
      this.clientDataService.updateClient(this.expandedElement.name, {
        marchName: value
      });
    }
  }
}
