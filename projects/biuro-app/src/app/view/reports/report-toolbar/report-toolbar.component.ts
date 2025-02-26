import { Component, EventEmitter, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-report-toolbar',
  standalone: true,
  imports: [MatButtonModule, MatToolbarModule],
  templateUrl: './report-toolbar.component.html',
  styleUrl: './report-toolbar.component.scss'
})
export class ReportToolbarComponent {
  @Output() generate = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();

  onGenerate() {
    this.generate.emit();
  }

  onSave() {
    this.save.emit();
  }

}
