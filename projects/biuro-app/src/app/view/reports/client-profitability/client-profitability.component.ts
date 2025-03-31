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
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { SecondsToHHMMSSPipe } from '../../../utils/seconds-to-mmss.pipe';


@Component({
  selector: 'app-client-profitability',
  standalone: true,
  imports: [MatSidenavModule, MonthlyPickerComponent, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatAutocompleteModule, MatTabsModule, FormsModule, ReactiveFormsModule, MatIconModule, CommonModule, MatExpansionModule, 
    MatListModule, SecondsToHHMMSSPipe],
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

  clientsOutput: IProfitabilityReportOutput["clients"];

  get employeeInputLines() {
    return this.inputForm.get('employees') as FormArray;
  }

  get employeeOutputLines() {
    return this.outputForm.get('employees') as FormArray;
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
        costSharePercent: 0,
        employees: []
      } as IProfitabilityReportInput;
    }

    this.inputForm = this.formBuilder.group({
      costSharePercent: this.formBuilder.control(this.input.costSharePercent),
      employees: this.formBuilder.array(this.input.employees.map(x => this.formBuilder.group({
        user: this.formBuilder.group({
          name: this.formBuilder.control(x.user?.name || ''),
          id: this.formBuilder.control(x.user?.id || 0),
        }),
        cost: this.formBuilder.control(x.cost)
      }))),
    });

    if (this.hasOutput) {
      this.outputForm = this.formBuilder.group({
        employees: this.formBuilder.array(this.output.employees.map(x => this.formBuilder.group({
          userName: this.formBuilder.control(x.userName),
          cost: this.formBuilder.control(x.cost),
          seconds: this.formBuilder.control(x.seconds),
          rate: this.formBuilder.control(x.rate * 3600),
        })))        
      });

      this.clientsOutput = this.output.clients;
    }
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
      costSharePercent: this.inputForm?.get('costSharePercent')?.value,
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
    this.employeeInputLines.push(this.formBuilder.group({
      user: this.formBuilder.group({
        name: this.formBuilder.control(''),
        id: this.formBuilder.control(0),
      }),
      cost: this.formBuilder.control(0),
      part: this.formBuilder.control(100)
    }));
  }

  override async onGenerate() {
    await super.onGenerate();
    this.tabIndex = 1;
  }

  secondsToTime(index: number) {
    return 'asd';
  }

  getBarWidth(share: number) {
    if(!share) return '0%';
    return `${share}%`;
  }

  getBarColorClass(share: number) {
    if (share < 30)
      return 'bar-green';
    else if (share > 30 && share < 70)
      return 'bar-yellow';
    else
      return 'bar-red';
  }
}
