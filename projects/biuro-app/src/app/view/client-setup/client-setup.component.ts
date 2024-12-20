import { Component } from '@angular/core';
import { ClientDataService } from '../../service/client-data.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IClientEntity } from '../../../../../electron/src/interfaces';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-client-setup',
  standalone: true,
  imports: [MatMenuModule, MatButtonModule, FormsModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './client-setup.component.html',
  styleUrl: './client-setup.component.scss'
})
export class ClientSetupComponent {
  form: FormGroup;

  constructor(private clientService: ClientDataService,
    private formBuilder: FormBuilder
  ) {
    this.form = this.formBuilder.group({
      id: this.formBuilder.control(0),
      name: this.formBuilder.control(''),
    })
  }

  ngOnInit() {
    this.clientService.getClients();
  }

  onEdit(client: IClientEntity) {
    this.form.get('name')?.setValue(client.name);
    this.form.get('id')?.setValue(client.id);
  }

  get clients() {
    return this.clientService.data;
  }
}
