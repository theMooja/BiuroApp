import { ChangeDetectorRef, Component, Injector, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { hasAccess, IClientEntity, IMarchEntity, IMonthlyEntity, Permission, StepType } from '../../../../../electron/src/interfaces';
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
import { CommonModule, JsonPipe } from '@angular/common';
import { CdkContextMenuTrigger, CdkMenuItem, CdkMenuModule } from '@angular/cdk/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MarchColumnComponent } from './march-column/march-column.component';
import { NotesComponent } from './notes-column/notes.component';
import { Router } from '@angular/router';
import { MonthlyDataService } from '../../service/monthly-data.service';
import { DATA_INJECTION_TOKEN, InvoiceColumnComponent } from './invoice-column/invoice-column.component';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { EditInfoColumnsOverlayComponent } from '../edit-info-columns-overlay/edit-info-columns-overlay.component';
import { SettingsDataService } from '../../service/settings-data.service';
import { UserDataService } from '../../service/user-data.service';
import { InvoiceDataService } from '../../service/invoice-data.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { InvoiceDateDialogComponent } from '../../utils/invoice-date-dialog/invoice-date-dialog.component';
import { TaskbarComponent } from './taskbar/taskbar.component';
import { MonthlyPickerComponent } from '../../utils/monthly-picker/monthly-picker.component';

export const allInfoColumns = ['email', 'ZUS', 'VAT', 'forma', 'skladki', 'firma', 'wlasciciel', 'place'];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NotesComponent, MarchColumnComponent, MatSort, MatSortModule, MatRippleModule,
    MatButtonModule, CdkContextMenuTrigger, CdkMenuItem, CdkMenuModule, CommonModule, MatTableModule,
    MatIconModule, FormsModule, MatInputModule, MatSelectModule, MatFormFieldModule, MatToolbarModule,
    MatDatepicker, MatMenuModule, InvoiceColumnComponent, MatDialogModule, TaskbarComponent, MonthlyPickerComponent],
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
  @ViewChildren(MarchColumnComponent) marchColumns: MarchColumnComponent[];
  tableData: MatTableDataSource<IMonthlyEntity>;
  expandedElement: IMonthlyEntity | null = null;
  selection = new SelectionModel<IMonthlyEntity>(true);
  selectionMode: boolean = false;
  infoColumns = ['email', 'firma', 'forma'];
  allInfoColumns = allInfoColumns;
  currentDate: Date = new Date(new Date().setMonth(new Date().getMonth() - 1));

  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChildren(NotesComponent) notesColumns!: QueryList<NotesComponent>;
  monthlies: IMonthlyEntity[] = [];

  lastColumn!: string;
  isRecreating: boolean = false;
  hasAccess = hasAccess;
  Permission = Permission;
  searchValue: string;

  constructor(private monthlyDataService: MonthlyDataService,
    private settingsDataService: SettingsDataService,
    private userService: UserDataService,
    private invoiceDataService: InvoiceDataService,
    private router: Router,
    private overlay: Overlay,
    private dialog: MatDialog
  ) {
    this.tableData = new MatTableDataSource<IMonthlyEntity>();
  }

  async ngOnInit() {
    let d = sessionStorage.getItem('currentDate');
    if (d)
      this.currentDate = new Date(JSON.parse(d));

    this.refreshData();

    await this.restoreInfoColumns();

    this.tableData.sortingDataAccessor = (item: any, property) => {
      switch (property) {
        case 'name': return (item.client as IClientEntity)?.name;
        case 'email': return item.info.email;
        case 'firma': return item.info.firma;
        case 'forma': return item.info.forma;
        case 'VAT': return item.info.VAT;
        case 'ZUS': return item.info.ZUS;
        case 'wlasciciel': return item.info.wlasciciel;
        case 'skladki': return item.info.skladki;
        case 'place': return item.info.place;
        case 'marchValues': return item.currentStep;
        case 'invoices': return item.invoices[0]?.sendDate;
        default: return item[property];
      }
    }
    this.sort.active = this.columns[0];
    this.sort.direction = 'asc';
    this.tableData.sort = this.sort;
  }

  get user() {
    return this.userService.user;
  }

  get columns() {
    return ['name', ...this.infoColumns, 'notes', 'marchValues', 'invoices']
  }

  get allStepNames() {
    const uniqueStepNames = new Set<string>();
    for (let monthly of this.tableData.data) {
      if (monthly.marches) {
        for (let march of monthly.marches) {
          if (march.type === StepType.HIDDEN) continue;
          uniqueStepNames.add(march.name);
        }
      }
    }

    return Array.from(uniqueStepNames);
  }

  searchResults: Element[] = []; // Store matched rows
  currentIndex: number = -1; // Track current highlighted row index

  onSearch(search: string) {
    // Remove previous highlights
    document.querySelectorAll('.highlighted-row').forEach(row => {
      row.classList.remove('highlighted-row');
    });

    this.searchResults = []; // Reset search results
    this.currentIndex = -1; // Reset index

    if (!search.trim()) return; // Ignore empty search

    const tableRows = document.querySelectorAll('mat-row');

    for (let row of Array.from(tableRows)) {
      if (row.textContent?.toLowerCase().includes(search.toLowerCase())) {
        this.searchResults.push(row); // Store matched rows
      }
    }

    this.highlightNextResult(); // Highlight first result
  }

  highlightNextResult() {
    if (this.searchResults.length === 0) return;

    // Remove highlight from previous result
    if (this.currentIndex >= 0 && this.currentIndex < this.searchResults.length) {
      this.searchResults[this.currentIndex].classList.remove('highlighted-row');
    }

    // Move to next result
    this.currentIndex = (this.currentIndex + 1) % this.searchResults.length;
    const nextRow = this.searchResults[this.currentIndex];

    // Add highlight and scroll into view
    nextRow.classList.add('highlighted-row');
    nextRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  onMarchFilterChange(name?: string) {
    for (let column of this.marchColumns) {
      column.tryCurrentStep(name);
    }
  }

  onSetMarch(element: IMonthlyEntity) {
    this.router.navigate(['/marchSetup'], { state: { monthly: element } });
  }

  onColumnChange(column: string) {
    let idx = this.infoColumns.indexOf(this.lastColumn);
    this.infoColumns[idx] = column;
    this.saveInfoColumns();
  }

  onInfoColumnRightClick(column: string) {
    this.lastColumn = column;
  }

  async onRecreateMonthlies(event: MouseEvent) {
    if (this.isRecreating) {
      this.isRecreating = false;
      await this.monthlyDataService.recreateMonthlies(this.currentMonthly.year, this.currentMonthly.month, this.selection.selected);
      await this.refreshData();
    }
    else {
      this.isRecreating = true;
      event.stopPropagation();
    }
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
    this.selection.clear();
    this.monthlies = await this.monthlyDataService
      .getMonthlies(this.currentMonthly.month, this.currentMonthly.year);
    this.tableData.data = this.monthlies;

    console.log('tableData', this.tableData.data);
  }

  get currentMonthly(): { year: number, month: number } {
    return {
      year: this.currentDate.getFullYear(),
      month: this.currentDate.getMonth() + 1
    }
  }

  async onDateChange(date: Date) {
    this.currentDate = date;
    this.tableData.data = [];
    await this.refreshData();
  }

  toggleSelectionMode() {
    this.selectionMode = !this.selectionMode
  }

  saveInfoColumns() {
    this.settingsDataService.setSettings('infoColumns', JSON.stringify(this.infoColumns));
  }

  async restoreInfoColumns() {
    let data = await this.settingsDataService.getSettings('infoColumns');
    if (data) {

      this.infoColumns = JSON.parse(data);
    }
  }

  async onSetInvoiceSendDates() {
    const dialogRef = this.dialog.open(InvoiceDateDialogComponent, {
    });

    dialogRef.afterClosed().subscribe(async (result: Date | null) => {
      console.log(this.selection.selected);
      if (result) {
        for (let selected of this.selection.selected) {
          selected.invoices[0].sendDate = result;
        }
        await this.invoiceDataService.saveInvoiceDates(this.selection.selected.map(x => x.invoices[0]));
      }
    });
  }

  async onSetInvoicePaidDates() {
    const dialogRef = this.dialog.open(InvoiceDateDialogComponent, {
    });

    dialogRef.afterClosed().subscribe(async (result: Date | null) => {
      console.log(this.selection.selected);
      if (result) {
        for (let selected of this.selection.selected) {
          selected.invoices[0].paidDate = result;
        }
        await this.invoiceDataService.saveInvoiceDates(this.selection.selected.map(x => x.invoices[0]));
      }
    });
  }

  onTaskTrigger(march: IMarchEntity) {
    this.searchValue = '';
    this.onSearch('');

    let row = document.querySelector(`mat-row[data-id="${march.monthly.id}"]`);
    if (row) {
      this.searchResults = [row as Element];
    }
    this.highlightNextResult();
  }

  onAddNote(element: IMonthlyEntity) {
    const targetNotesColumn = this.notesColumns.find(nc => nc.monthly === element);

    if (targetNotesColumn) {
      targetNotesColumn.onAdd();
    } else {
      console.error("Matching notes-column not found for", element);
    }
  }
}
