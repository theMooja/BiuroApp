import { Component, inject } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ListValuesService } from '../../../service/list-values.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ClientDataService } from '../../../service/client-data.service';
import { IListValue, IMonthlyEntity } from '../../../../../../electron/src/interfaces';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MonthlyDataService } from '../../../service/monthly-data.service';
import { NotificationsService } from 'angular2-notifications';
import { filter } from 'rxjs';

@Component({
  selector: 'app-mailing',
  standalone: true,
  imports: [FormsModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatIconModule, CommonModule,
    ReactiveFormsModule, MatSelectModule
  ],
  templateUrl: './mailing.component.html',
  styleUrl: './mailing.component.scss'
})
export class MailingComponent {
  filters: Filter[] = [];
  infoColumns = ['VAT', 'firma', 'place', 'forma'];
  infoValues: { [key: string]: IListValue[] } = {};
  clients: { name: string, email: string, matched: boolean }[] = [];

  listValueService = inject(ListValuesService);
  monthlyService = inject(MonthlyDataService);
  notificationsService = inject(NotificationsService);
  filterForm: FormGroup;

  constructor() {
    // filter form is an array of filters
    this.filterForm = new FormGroup({
      filters: new FormArray([])
    });

    this.infoColumns.forEach(async column => {
      this.infoValues[column] = await this.listValueService.get(`info-${column}`);
      console.log(`Loaded values for ${column}:`, this.infoValues[column]);
    });

    let monthlies = this.monthlyService.monthlies();
    if (monthlies.length > 0) {
      this.clients = monthlies.map(m => ({
        name: m.client.name,
        email: m.info.email,
        matched: true
      }));
    }
  }

  get filtersArray(): FormArray {
    return this.filterForm.get('filters') as FormArray;
  }

  addFilter() {
    const filterGroup = new FormGroup({
      field: new FormControl(''),
      value: new FormControl('')
    });
    this.filtersArray.push(filterGroup);
  }

  removeFilter(index: number) {
    this.filtersArray.removeAt(index);
    this.applyFilters();
  }

  applyFilters() {
    const filters = this.filtersArray.value;
    const names = new Set<string>();

    if (filters.length === 0) {
      this.clients.forEach(client => {
        client.matched = true;
      });

      return;
    }

    const isMatched = (monthly: IMonthlyEntity): boolean => {
      return filters.some((filter: Filter) => monthly.info[filter.field] === filter.value);
    };

    this.clients.forEach(client => {
      client.matched = false;
    });

    this.monthlyService.monthlies().forEach(monthly => {
      if (isMatched(monthly)) {
        names.add(monthly.client.name);
      }
    });

    this.clients.forEach(client => {
      client.matched = names.has(client.name);
    });
    console.log('Filtered clients:', this.clients);
  }

  onCopy() {
    let value = Array.from(
      new Set(
        this.clients
          .filter(client => client.matched)
          .map(client => client.email)
      )
    ).join(';');

    navigator.clipboard.writeText(value).then(() => {
      this.notificationsService.success('Skopiowano adresy do schowka');
    });
  }
}

interface Filter {
  field: string;
  value: any;
}
