import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MarchDataService } from '../../service/march-data.service';
import { IMarchStepTemplate, IMarchTemplate, StepType } from './../../../../../electron/src/interfaces';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-march-setup',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule,
    MatInputModule, MatIconModule, MatButtonModule,
    ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatMenuModule],
  templateUrl: './march-setup.component.html',
  styleUrl: './march-setup.component.scss'
})
export class MarchSetupComponent {
  marchForm: FormGroup;
  stepTypes = Object.values(StepType);
  templates: IMarchTemplate[] = [];

  constructor(private formBuilder: FormBuilder,
    private dataService: MarchDataService
  ) {
    this.marchForm = this.formBuilder.group({
      name: this.formBuilder.control(''),
      steps: this.formBuilder.array([])
    });
  }

  async ngOnInit() {
    this.templates = await this.dataService.getTemplates();
  }

  onEdit(template: IMarchTemplate) {
    this.steps.clear();
    this.marchForm.get('name')?.setValue(template.name);
    template.steps.forEach(s => {
      this.addStep(s);
    });
  }

  onNew() {
    this.marchForm.get('name')?.setValue('');
    this.steps.clear();
  }

  createStepGroup(step?: IMarchStepTemplate): FormGroup {
    let group = this.formBuilder.group({
      title: this.formBuilder.control(''),
      type: StepType.Double,
      weight: this.formBuilder.control(1),

    });

    if(step){
      group.controls.title.setValue(step.title);
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

  addStep(step?: IMarchStepTemplate) {
    this.steps.push(this.createStepGroup(step));
  }

  updateSequenceNumbers() {
    this.steps.controls.forEach((step, index) => {
      step.get('sequence')?.setValue(index);
    });
  }

  onSubmit() {
    this.updateSequenceNumbers();
    this.dataService.saveTemplate(this.marchForm.value);
  }
}
