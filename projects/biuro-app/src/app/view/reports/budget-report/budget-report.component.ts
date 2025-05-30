import { Component, inject } from '@angular/core';
import { ReportComponent } from '../IReportComponent';
import { IBudgetReportInput, IBudgetReportOutput, IListValue, IReport, IReportHeader, ListValueTargets } from '../../../../../../electron/src/interfaces';
import { MatTabsModule } from '@angular/material/tabs';
import { MonthlyPickerComponent } from '../../../utils/monthly-picker/monthly-picker.component';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { ListValuesService } from '../../../service/list-values.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CommaToDotDirective } from './../../../utils/comma-to-dot.directive';

@Component({
  selector: 'app-budget-report',
  standalone: true,
  imports: [MatTabsModule, MonthlyPickerComponent, MatInputModule, FormsModule,
    ReactiveFormsModule, CommonModule, MatButtonModule, MatIconModule, MatAutocompleteModule, CommaToDotDirective],
  templateUrl: './budget-report.component.html',
  styleUrl: './budget-report.component.scss'
})
export class BudgetReportComponent extends ReportComponent<IBudgetReportInput, IBudgetReportOutput> {

  date: Date = new Date();
  tabIndex: number = 0;

  costInputForm: FormGroup;
  costOutputForm: FormGroup;
  formBuilder = inject(FormBuilder);
  listValuesService = inject(ListValuesService);


  categoryIncome: { category: string, sum: number, share: number }[] = [];
  categoriesList: IListValue[];

  get costInputLines() {
    return this.costInputForm.get('cost') as FormArray;
  }

  get categoryCostLines() {
    return this.costOutputForm.get('categoryCost') as FormArray;
  }

  get divisionIncomeLines() {
    return this.costOutputForm.get('divisionIncome') as FormArray;
  }

  async ngOnInit() {
    this.categoriesList = await this.listValuesService.get(ListValueTargets.INVOICE_CATEGORY);
  }

  override init() {
    super.init();

    if (this.isEmptyObject(this.input)) {
      this.input = {
        month: this.date.getMonth() + 1,
        year: this.date.getFullYear(),
        cost: [
          {
            description: 'księgowe',
            category: 'księgowość',
            value: 500
          },
          {
            description: 'kadrowe',
            category: 'kadry',
            value: 500
          },
          {
            description: 'koszty',
            category: '',
            value: 500
          }
        ]
      }
    }

    this.costInputForm = this.formBuilder.group({
      cost: this.formBuilder.array(this.input.cost.map(x => this.formBuilder.group({
        description: this.formBuilder.control(x.description),
        category: this.formBuilder.control(x.category),
        value: this.formBuilder.control(x.value)
      })))
    });

    if (this.input?.year)
      this.date = new Date(this.input.year, this.input.month - 1);

    if (this.hasOutput) {
      this.costOutputForm = this.formBuilder.group({
        sumIncome: this.formBuilder.control(this.output.sumIncome),
        profit: this.formBuilder.control(this.output.profit),
        profitShare: this.formBuilder.control(this.output.profitShare),
        categoryCost: this.formBuilder.array(this.output.categoryCost.map(x => this.formBuilder.group({
          category: this.formBuilder.control(x.category),
          sum: this.formBuilder.control(x.sum),
          share: this.formBuilder.control(x.share)
        }))),
        divisionIncome: this.formBuilder.array(this.output.divisionIncome.map(x => this.formBuilder.group({
          division: this.formBuilder.control(x.division),
          value: this.formBuilder.control(x.value)
        }))),
      });
    }
  }

  getInput(): IBudgetReportInput {
    let input = {
      month: this.date.getMonth() + 1,
      year: this.date.getFullYear(),
      cost: this.costInputForm.value.cost
    }

    return input;
  }

  override async onGenerate() {
    super.onGenerate();
    this.tabIndex = 1;
  }

  async onSave() {
    this.report.name = this.header.name;
    this.report.input = JSON.stringify(this.getInput());
    console.log('save', this.report);
    await this.reportService.saveReport(this.report);
  }

  onDateChange(date: Date) {
    this.date = date;
    this.input.year = date.getFullYear();
    this.input.month = date.getMonth() + 1;
  }

  get hasOutput(): boolean {
    return !this.isEmptyObject(this.output);
  }

  addCostLine() {
    this.costInputLines.push(this.formBuilder.group({
      description: this.formBuilder.control(''),
      category: this.formBuilder.control(''),
      value: this.formBuilder.control(0)
    }));
  }

  removeCostLine(index: number) {
    this.costInputLines.removeAt(index);
  }
}
