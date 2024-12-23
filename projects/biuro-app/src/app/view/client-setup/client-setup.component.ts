import { Component } from '@angular/core';
import { ClientDataService } from '../../service/client-data.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IClientEntity } from '../../../../../electron/src/interfaces';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';


@Component({
  selector: 'app-client-setup',
  standalone: true,
  imports: [MatMenuModule, MatButtonModule, FormsModule, MatInputModule, ReactiveFormsModule, MatCheckboxModule],
  templateUrl: './client-setup.component.html',
  styleUrl: './client-setup.component.scss'
})
export class ClientSetupComponent {
  form: FormGroup;

  constructor(private clientService: ClientDataService,
    private formBuilder: FormBuilder
  ) {
    this.form = this.formBuilder.group({
      id: this.formBuilder.control(null),
      name: this.formBuilder.control(''),
      isActive: this.formBuilder.control(true)
    })
  }

  ngOnInit() {
    this.clientService.getClients();
  }

  onEdit(client: IClientEntity) {
    this.form.get('name')?.setValue(client.name);
    this.form.get('id')?.setValue(client.id);
    this.form.get('isActive')?.setValue(client.isActive);
  }

  onSave() {
    if (this.form.valid) {
      let client = this.form.value;
      this.clientService.saveClient(client);
    }
  }

  onNew() {
    this.form.reset();
  }

  get clients() {
    return this.clientService.data;
  }
}
