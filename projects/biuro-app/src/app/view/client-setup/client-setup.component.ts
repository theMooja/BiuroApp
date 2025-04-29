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
  currentClient: IClientEntity | null;

  constructor(private clientService: ClientDataService,
    private formBuilder: FormBuilder
  ) {
    this.form = this.formBuilder.group({
      id: this.formBuilder.control(null),
      name: this.formBuilder.control(''),
      nip: this.formBuilder.control(''),
      isActive: this.formBuilder.control(true),
      folderPath: this.formBuilder.control(''),
    })
  }

  ngOnInit() {
    this.clientService.getClients();
  }

  onEdit(client: IClientEntity) {
    this.currentClient = client;
    this.form.get('name')?.setValue(client.name);
    this.form.get('id')?.setValue(client.id);
    this.form.get('isActive')?.setValue(client.isActive);
    this.form.get('nip')?.setValue(client.nip);
    this.form.get('folderPath')?.setValue(client.details.folderPath);
  }

  onSave() {
    if (this.form.valid) {
      const formValue = this.form.value;

      const client: IClientEntity = {
        ...this.currentClient,
        ...formValue,
        details: {
          ...this.currentClient?.details,
          folderPath: formValue.folderPath
        }
      };

      this.clientService.saveClient(client).then((res) => {
        this.form.get('id')?.setValue(res.id);
      });
    }
  }

  onNew() {
    this.form.reset();
    this.form.get('isActive')?.setValue(true);
    this.currentClient = null;
  }

  onFakturownia() {
    this.clientService.syncFakturowniaIds();
  }

  get clients() {
    return this.clientService.data;
  }

  async pickFolder() {
    const folderPath = await window.electron.pickFolder();
    if (folderPath) {
      this.form.get('folderPath')?.setValue(folderPath);
    }
  }
}
