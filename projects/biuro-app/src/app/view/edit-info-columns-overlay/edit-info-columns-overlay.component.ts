import { Component, Inject, ChangeDetectorRef } from '@angular/core';
import { IListValue, IMonthlyEntity } from '../../../../../electron/src/interfaces';
import { OverlayRef } from '@angular/cdk/overlay';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { allInfoColumns } from '../home/home.component';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DATA_INJECTION_TOKEN } from '../home/invoice-column/invoice-column.component';
import { MonthlyDataService } from '../../service/monthly-data.service';
import { MatButtonModule } from '@angular/material/button';
import { ListValuesService } from '../../service/list-values.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@Component({
  selector: 'app-edit-info-columns-overlay',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatAutocompleteModule],
  templateUrl: './edit-info-columns-overlay.component.html',
  styleUrl: './edit-info-columns-overlay.component.scss'
})
export class EditInfoColumnsOverlayComponent {
  monthly: IMonthlyEntity;
  form: FormGroup;
  allInfoColumns: string[] = allInfoColumns;
  descriptionValues: { [key: string]: IListValue[] } = {};

  constructor(@Inject(DATA_INJECTION_TOKEN) private data: { entity: IMonthlyEntity, overlayRef: OverlayRef },
    private formBuilder: FormBuilder, private monthlyDataService: MonthlyDataService, private listValuesService: ListValuesService,
    private cdr: ChangeDetectorRef) {

    this.monthly = this.data.entity;

    const fields: { [key: string]: any } = {};
    allInfoColumns.forEach(x => {
      this.descriptionValues[x] = [];
      fields[x] = this.formBuilder.control(this.monthly.info[x]);
    });

    this.form = this.formBuilder.group(fields);
  }

  async ngOnInit() {
    for (const val of allInfoColumns) {
      this.descriptionValues[val] = await this.listValuesService.get(`info-${val}`);
    }
    this.cdr.detectChanges(); // Trigger change detection
  }

  onSubmit() {
    this.monthly.info = this.form.value;
    this.monthlyDataService.updateInfo(this.monthly);
    this.data.overlayRef.dispose();
  }
}
