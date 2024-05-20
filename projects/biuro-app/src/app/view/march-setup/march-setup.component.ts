import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MarchDataService } from '../../service/march-data.service';
import { StepType } from './../../../../../electron/src/interfaces';
import { MatSelectModule } from '@angular/material/select';



@Component({
  selector: 'app-march-setup',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule,
    MatInputModule, MatIconModule, MatButtonModule,
    ReactiveFormsModule, MatInputModule, MatFormFieldModule],
  templateUrl: './march-setup.component.html',
  styleUrl: './march-setup.component.scss'
})
export class MarchSetupComponent {
  marchForm: FormGroup;
  stepTypes = Object.values(StepType);

  selectedOption?: string;
  templateOptions = [
    { value: 'option1', viewValue: 'Option 1' },
    { value: 'option2', viewValue: 'Option 2' },
    { value: 'option3', viewValue: 'Option 3' }
  ];

  constructor(private formBuilder: FormBuilder,
    private dataService: MarchDataService
  ) {
    this.marchForm = this.formBuilder.group({
      name: this.formBuilder.control(''),
      steps: this.formBuilder.array([])
    });
  }

  async ngOnInit() {
    let templates = await this.dataService.findTemplates("");
    this.templateOptions = templates.map(x => {
      return {
        value: x.name,
        viewValue: x.name
      }
    });
  }

  onSelectionChange(event?: any) {
    this.selectedOption = event?.value;
    let t = this.dataService.findTemplates(event.value ?? "");
    console.log(t);
  }

  createStepGroup(): FormGroup {
    return this.formBuilder.group({
      title: this.formBuilder.control(''),
      type: StepType.Double
    });
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

  addStep() {
    this.steps.push(this.createStepGroup());
  }

  updateSequenceNumbers() {
    this.steps.controls.forEach((step, index) => {
      step.get('sequence')?.setValue(index);
    });
  }

  onSubmit() {
    this.updateSequenceNumbers();
    console.log(this.marchForm.value);
    this.dataService.createTemplate(this.marchForm.value);
  }
}
