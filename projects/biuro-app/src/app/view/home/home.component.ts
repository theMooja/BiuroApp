import { ChangeDetectorRef, Component, Injector, ViewChild } from '@angular/core';
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
import { DATA_INJECTION_TOKEN, InvoiceColumnComponent } from '../../components/invoice-column/invoice-column.component';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { EditInfoColumnsOverlayComponent } from '../../components/edit-info-columns-overlay/edit-info-columns-overlay.component';

export const allInfoColumns = ['email', 'ZUS', 'VAT', 'forma', 'skladki', 'firma'];

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
  infoColumns = ['email', 'firma', 'forma'];
  allInfoColumns = allInfoColumns;
  currentDate: Date = new Date('1-1-2024');
  @ViewChild(MatCalendar) calendar!: MatCalendar<Date>;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  lastColumn!: string;

  constructor(private monthlyDataService: MonthlyDataService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private overlay: Overlay
  ) {
    this.tableData = new MatTableDataSource<IMonthlyEntity>();
  }

  async ngOnInit() {
    this.refreshData();

    this.tableData.sortingDataAccessor = (item: any, property) => {
      switch (property) {
        case 'name': return (item.client as IClientEntity)?.name;
        case 'email': return item.info.email;
        case 'firma': return item.info.firma;
        case 'forma': return item.info.forma;
        case 'VAT': return item.info.VAT;
        case 'ZUS': return item.info.ZUS;
        case 'skladki': return item.info.skladki;
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
    // await this.monthlyDataService.recreateMonthlies(this.currentMonthly.year, this.currentMonthly.month, this.selection.selected);
    // await this.refreshData();
    console.log('tableData', this.tableData.data);
  }

  onEditInfoColumns(element: IMonthlyEntity) {
    const overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-dark-backdrop',
      disposeOnNavigation: true,
    });

    let data = Injector.create({
      providers: [{
        provide: DATA_INJECTION_TOKEN, useValue: {
          entity: element,
          overlayRef: overlayRef
        }
      }],
    });
    const overlayPortal = new ComponentPortal(EditInfoColumnsOverlayComponent, null, data);
    overlayRef.attach(overlayPortal);
    overlayRef.backdropClick().subscribe(() => overlayRef.dispose());
  }

  async refreshData() {
    this.tableData.data = await this.monthlyDataService
      .getMonthlies(this.currentMonthly.month, this.currentMonthly.year);
  }

  async refreshMonthly(id: number) {
    
    let newMonthly = await this.monthlyDataService.getMonthly(id);
    let idx = this.tableData.data.findIndex(x => x.id === id);
    let data = this.tableData.data;
    data[idx] = newMonthly;
    this.tableData.data = data;
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
