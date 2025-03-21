import { Component, inject, Input } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MonthlyPickerComponent } from './../../../utils/monthly-picker/monthly-picker.component';
import { IProfitabilityReportInput, IProfitabilityReportOutput, IUserEntity } from '../../../../../../electron/src/interfaces';
import { ReportComponent } from '../IReportComponent';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserDataService } from '../../../service/user-data.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-client-profitability',
  standalone: true,
  imports: [MatSidenavModule, MonthlyPickerComponent, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatAutocompleteModule, MatTabsModule, FormsModule, ReactiveFormsModule, MatIconModule, CommonModule],
  templateUrl: './client-profitability.component.html',
  styleUrl: './client-profitability.component.scss'
})
export class ClientProfitabilityComponent extends ReportComponent<IProfitabilityReportInput, IProfitabilityReportOutput> {

  date: Date = new Date();
  tabIndex: number = 0;

  inputForm: FormGroup;
  outputForm: FormGroup;

  formBuilder = inject(FormBuilder);
  userService = inject(UserDataService);

  users: IUserEntity[] = [];

  get employeeLines() {
    return this.inputForm.get('employees') as FormArray;
  }

  async ngOnInit() {
    this.users = await this.userService.getUsers();
  }

  override async init() {
    super.init();

    if (this.input?.year)
      this.date = new Date(this.input.year, this.input.month - 1);

    if (this.isEmptyObject(this.input)) {
      this.input = {
        month: this.date.getMonth() + 1,
        year: this.date.getFullYear(),
        costShare: 0,
        employees: []
      } as IProfitabilityReportInput;
    }

    this.inputForm = this.formBuilder.group({
      costShare: this.formBuilder.control(this.input.costShare),
      employees: this.formBuilder.array(this.input.employees.map(x => this.formBuilder.group({
        user: this.formBuilder.group({
          name: this.formBuilder.control(x.user?.name || ''),
          id: this.formBuilder.control(x.user?.id || 0),
        }),
        cost: this.formBuilder.control(x.cost),
        part: this.formBuilder.control(x.part || 0)
      }))),
    });
  }

  async onSave() {
    this.report.name = this.header.name;
    this.report.input = JSON.stringify(this.getInput());
    console.log('save', this.report);
    await this.reportService.saveReport(this.report);
  }

  getInput(): IProfitabilityReportInput {
    return {
      month: this.date.getMonth() + 1,
      year: this.date.getFullYear(),
      costShare: this.inputForm?.get('costShare')?.value,
      employees: this.inputForm?.get('employees')?.value
    }
  }

  onDateChange(date: Date) {
    this.date = date;
    this.input.year = date.getFullYear();
    this.input.month = date.getMonth() + 1;
  }

  get hasOutput(): boolean {
    return !this.isEmptyObject(this.output);
  }

  addEmployeeLine() {
    this.employeeLines.push(this.formBuilder.group({
      user: this.formBuilder.group({
        name: this.formBuilder.control(''),
        id: this.formBuilder.control(0),
      }),
      cost: this.formBuilder.control(0),
      part: this.formBuilder.control(100)
    }));
  }
}
