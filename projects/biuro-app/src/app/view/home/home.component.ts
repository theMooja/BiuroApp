import { Component } from '@angular/core';
import { ClientDataService } from '../../service/client-data.service';
import { IClient } from '../../../../../electron/src/interfaces';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatTableModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  clients: IClient[];

  constructor(private dataService: ClientDataService) {
    this.clients = [];
  }

  async ngOnInit() {
    this.clients = await this.dataService.getClientsMonthly(1, 1);
    console.log('got', this.clients);
  }
}
