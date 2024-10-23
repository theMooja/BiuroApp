import { Component, Inject } from '@angular/core';
import { IMonthlyEntity } from '../../../../../electron/src/interfaces';
import { OverlayRef } from '@angular/cdk/overlay';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { allInfoColumns } from '../../view/home/home.component';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DATA_INJECTION_TOKEN } from '../invoice-column/invoice-column.component';
import { MonthlyDataService } from '../../service/monthly-data.service';

@Component({
  selector: 'app-edit-info-columns-overlay',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule],
  templateUrl: './edit-info-columns-overlay.component.html',
  styleUrl: './edit-info-columns-overlay.component.scss'
})
export class EditInfoColumnsOverlayComponent {
  monthly: IMonthlyEntity;
  form: FormGroup;
  allInfoColumns: string[] = allInfoColumns;

  constructor(@Inject(DATA_INJECTION_TOKEN) private data: { entity: IMonthlyEntity, overlayRef: OverlayRef },
    private formBuilder: FormBuilder, private monthlyDataService: MonthlyDataService) {

    this.monthly = this.data.entity;

    const fields: { [key: string]: any } = {};
    allInfoColumns.forEach(x => {
      fields[x] = this.formBuilder.control(this.monthly.info[x]);
    });

    this.form = this.formBuilder.group(fields);
  }

  onSubmit() {
    this.monthly.info = this.form.value;
    this.monthlyDataService.updateInfo(this.monthly);
    this.data.overlayRef.dispose();
  }
}
