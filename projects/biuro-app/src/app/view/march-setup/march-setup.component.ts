import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { IClientEntity, IMarchEntity, IMonthlyEntity, ListValueTargets, StepType } from './../../../../../electron/src/interfaces';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { ClientDataService } from '../../service/client-data.service';
import { MonthlyDataService } from '../../service/monthly-data.service';
import { ListValuesService } from '../../service/list-values.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@Component({
  selector: 'app-march-setup',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule,
    MatInputModule, MatIconModule, MatButtonModule,
    ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatMenuModule, MatAutocompleteModule],
  templateUrl: './march-setup.component.html',
  styleUrl: './march-setup.component.scss'
})
export class MarchSetupComponent {
  marchForm: FormGroup;
  stepTypes = Object.values(StepType);
  monthly!: IMonthlyEntity;
  clients!: IClientEntity[];
  descriptionValues: string[] = [];


  constructor(private formBuilder: FormBuilder,
    private monthlyDataService: MonthlyDataService,
    private clientDataService: ClientDataService,
    private listValuesService: ListValuesService
  ) {
    this.marchForm = this.formBuilder.group({
      name: this.formBuilder.control(''),
      steps: this.formBuilder.array([])
    });
  }

  async ngOnInit() {
    this.monthly = history.state.monthly;
    this.clients = await this.clientDataService.getClients();
    this.marchForm.get('name')?.setValue(this.monthly.client.name);
    this.recreateSteps(this.monthly);

    this.descriptionValues = await this.listValuesService.get(ListValueTargets.STEP_DESC);
  }

  async onCopy(client: IClientEntity) {
    let template = await this.monthlyDataService.getLatestMonthly(client);
    this.recreateSteps(template);
  }

  recreateSteps(template: IMonthlyEntity) {
    this.steps.clear();
    template.marches.sort((a, b) => a.sequence - b.sequence).forEach(m => {
      this.addStep(m);
    });
  }

  createStepGroup(step?: IMarchEntity): FormGroup {
    let group = this.formBuilder.group({
      name: this.formBuilder.control(''),
      type: StepType.GYR,
      weight: this.formBuilder.control(1),
      sequence: this.formBuilder.control(0),
    });

    if (step) {
      group.controls.name.setValue(step.name);
      group.controls.type.setValue(step.type);
      group.controls.weight.setValue(step.weight);
    }

    return group;
  }

  moveStepUp(i: number) {
    const temp = this.steps.at(i).value;
    this.steps.at(i).setValue(this.steps.at(i - 1).value);
    this.steps.at(i - 1).setValue(temp);
  }

  moveStepDown(i: number) {
    const temp = this.steps.at(i).value;
    this.steps.at(i).setValue(this.steps.at(i + 1).value);
    this.steps.at(i + 1).setValue(temp);
  }

  removeStep(i: number) {
    this.steps.removeAt(i);
  }

  get steps() {
    return this.marchForm.get('steps') as FormArray;
  }

  addStep(step?: IMarchEntity) {
    this.steps.push(this.createStepGroup(step));
  }

  updateSequenceNumbers() {
    this.steps.controls.forEach((step, index) => {
      step.get('sequence')?.setValue(index);
    });
  }

  onSubmit() {
    this.updateSequenceNumbers();

    this.monthlyDataService.updateMarches(this.monthly.id, this.marchForm.value.steps);
  }
}
