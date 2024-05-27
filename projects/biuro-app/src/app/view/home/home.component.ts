import { Component } from '@angular/core';
import { ClientDataService } from '../../service/client-data.service';
import { IClient } from '../../../../../electron/src/interfaces';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { animate, state, style, transition, trigger } from '@angular/animations';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatTableModule, MatIconModule],
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
  clients: IClient[];
  expandedElement: IClient | null = null;

  constructor(private dataService: ClientDataService) {
    this.clients = [];
  }

  async ngOnInit() {
    this.clients = await this.dataService.getClientsMonthly(2024, 1);
  }
}
