import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { ClientDataService } from '../../service/client-data.service';
import { IClientEntity, IMonthlyEntity } from '../../../../../electron/src/interfaces';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SelectionModel } from '@angular/cdk/collections';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCalendar, MatDatepicker, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { CdkContextMenuTrigger, CdkMenuItem, CdkMenuModule } from '@angular/cdk/menu';
import { MatButton } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MarchColumnComponent } from '../../components/march-column/march-column.component';
import { NotesComponent } from '../../components/notes/notes.component';
import { Router } from '@angular/router';
import { MonthlyDataService } from '../../service/monthly-data.service';
import { InvoiceColumnComponent } from '../../components/invoice-column/invoice-column.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NotesComponent, MarchColumnComponent, MatSort, MatSortModule, MatRippleModule,
    MatButton, CdkContextMenuTrigger, CdkMenuItem, CdkMenuModule, CommonModule, MatTableModule,
    MatIconModule, FormsModule, MatInputModule, MatSelectModule, MatFormFieldModule, MatToolbarModule,
    MatDatepicker, MatCalendar, MatMenuModule, MatDatepickerToggle, InvoiceColumnComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class HomeComponent {
  tableData: MatTableDataSource<IMonthlyEntity>;
  expandedElement: IMonthlyEntity | null = null;
  selection = new SelectionModel<IMonthlyEntity>(true);
  infoColumns = ['email', 'biuro', 'program'];
  allInfoColumns = ['email', 'biuro', 'program', 'forma']
  currentDate: Date = new Date('1-1-2024');
  @ViewChild(MatCalendar) calendar!: MatCalendar<Date>;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  lastColumn!: string;

  constructor(private monthlyDataService: MonthlyDataService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.tableData = new MatTableDataSource<IMonthlyEntity>();
  }

  async ngOnInit() {
    this.refreshData();

    this.tableData.sortingDataAccessor = (item: any, property) => {
      switch (property) {
        case 'name': return (item.client as IClientEntity)?.name;
        default: return item[property];
      }
    }
    this.sort.active = this.columns[0];
    this.sort.direction = 'asc';
    this.tableData.sort = this.sort;
  }

  get columns() {
    return ['name', ...this.infoColumns, 'notes', 'marchValues', 'invoices']
  }

  onSetMarch(element: IMonthlyEntity) {
    this.router.navigate(['/marchSetup'], { state: { monthly: element } });
  }

  onColumnChange(column: string) {
    let idx = this.infoColumns.indexOf(this.lastColumn);
    this.infoColumns[idx] = column;
  }

  onInfoColumnRightClick(column: string) {
    this.lastColumn = column;
  }

  async onRecreateMonthlies() {
    //await this.monthlyDataService.recreateMonthlies(this.currentMonthly.year, this.currentMonthly.month, this.selection.selected);
    console.log('tableData', this.tableData.data);
    //await this.refreshData();
  }

  async refreshData() {
    this.tableData.data = await this.monthlyDataService
      .getMonthlies(this.currentMonthly.month, this.currentMonthly.year);
  }

  get currentMonthly(): { year: number, month: number } {
    return {
      year: this.currentDate.getFullYear(),
      month: this.currentDate.getMonth() + 1
    }
  }

  onDateSelected(normalizedMonthAndYear: Date, trigger: MatMenuTrigger) {
    this.currentDate = normalizedMonthAndYear;
    this.cdr.detach();
    this.tableData.data = [];
    this.monthlyDataService.getMonthlies(this.currentMonthly.month, this.currentMonthly.year)
      .then((res) => {
        this.tableData.data = res;
      });

    trigger.closeMenu();
  }

  viewChangedHandler(event: any) {
    this.calendar.currentView = 'year';
    this.cdr.reattach();
  }
}
