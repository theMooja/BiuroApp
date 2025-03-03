import { ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatCalendar, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { NominativeDatePipe } from '../nominative-date.pipe';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-monthly-picker',
  standalone: true,
  imports: [MatCalendar, MatMenuTrigger, MatDatepickerToggle, MatMenuModule, NominativeDatePipe, MatIconModule, MatButtonModule],
  templateUrl: './monthly-picker.component.html',
  styleUrl: './monthly-picker.component.scss'
})
export class MonthlyPickerComponent {
  @Input() date: Date;
  @Output() dateChange = new EventEmitter<Date>();
  @Input() onlyIcon = false;
  @ViewChild(MatCalendar) calendar!: MatCalendar<Date>;

  constructor(private cdr: ChangeDetectorRef) { }

  async onDateSelected(normalizedMonthAndYear: Date, trigger: MatMenuTrigger) {
    this.date = normalizedMonthAndYear;
    sessionStorage.setItem('currentDate', JSON.stringify(this.date));
    this.cdr.detach();
    this.dateChange.emit(this.date);
    trigger.closeMenu();
  }

  viewChangedHandler(event: any) {
    this.calendar.currentView = 'year';
    this.cdr.reattach();
  }
}
