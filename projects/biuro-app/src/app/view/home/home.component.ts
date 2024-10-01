import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { ClientDataService } from '../../service/client-data.service';
import { IClient, ClientMonthly } from '../../../../../electron/src/interfaces';
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


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MarchColumnComponent, MatSort, MatSortModule, MatRippleModule, MatButton, CdkContextMenuTrigger, CdkMenuItem, CdkMenuModule, CommonModule, MatTableModule, MatIconModule, FormsModule, MatInputModule, MatSelectModule, MatFormFieldModule, MatToolbarModule, MatDatepicker, MatCalendar, MatMenuModule, MatDatepickerToggle],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  animations: [
    // trigger('detailExpand', [
    //   state('collapsed,void', style({ height: '0px', minHeight: '0' })),
    //   state('expanded', style({ height: '*' })),
    //   transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    // ]),
  ],
})
export class HomeComponent {
  tableData: MatTableDataSource<ClientMonthly>;
  expandedElement: ClientMonthly | null = null;
  selection = new SelectionModel<ClientMonthly>(true);
  infoColumns = ['email', 'biuro', 'program'];
  allInfoColumns = ['email', 'biuro', 'program', 'forma']
  currentDate: Date = new Date('1-1-2024');
  @ViewChild(MatCalendar) calendar!: MatCalendar<Date>;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  lastColumn!: string;

  constructor(private clientDataService: ClientDataService,
    private cdr: ChangeDetectorRef,
  ) {
    this.tableData = new MatTableDataSource<ClientMonthly>();

  }

  async ngOnInit() {
    this.refreshData();

    this.tableData.sortingDataAccessor = (item: any, property) => {
      switch (property) {
        case 'name': return (item.client as IClient)?.name;
        default: return item[property];
      }
    }
    this.tableData.sort = this.sort;
  }

  get columns() {
    return ['name', ...this.infoColumns, 'marchValues']
  }

  onColumnChange(column: string) {
    let idx = this.infoColumns.indexOf(this.lastColumn);
    this.infoColumns[idx] = column;
  }

  onInfoColumnRightClick(column: string) {
    this.lastColumn = column;
  }

  async onRecreateMonthlies() {
    //await this.clientDataService.recreateMonthlies(this.currentMonthly.year, this.currentMonthly.month, []);
    console.log('tableData', this.tableData.data);
    //await this.refreshData();
  }

  async refreshData() {
    this.tableData.data = await this.clientDataService
      .getMonthlies(this.currentMonthly.year, this.currentMonthly.month);
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
    this.clientDataService.getMonthlies(this.currentMonthly.year, this.currentMonthly.month)
      .then((res) => {
        this.tableData.data = res;
      });

    trigger.closeMenu();
  }

  viewChangedHandler(event: any) {
    this.calendar.currentView = 'year';
    this.cdr.reattach();
  }

  /*
  clients: MatTableDataSource<ClientMonthly>;
  templates: IMarchTemplate[] = [];
  expandedElement: IClient | null = null;
  runningElement: ClientMonthly | null = null;
  selection = new SelectionModel<IClient>(true);
  currentDate: Date = new Date();
  @ViewChild(MatCalendar) calendar!: MatCalendar<Date>;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  columns: string[] = ['name', 'expand', 'march'];
  startTime: Date = new Date();

  constructor(private clientDataService: ClientDataService,
    private marchDataService: MarchDataService,
    private stopperDataService: StopperDataService,
    private cdr: ChangeDetectorRef,
    private userService: UserDataService
  ) {
    this.clients = new MatTableDataSource();
  }

  async ngOnInit() {
    let monthlies = await this.clientDataService.getMonthlies(2024, 1);
    this.sort.active = this.columns[0];
    this.sort.direction = 'asc';
    this.clients.sort = this.sort;
  }

  onMarchTemplateSelected(value: any) {
    // if (this.expandedElement) {
    //   this.clientDataService.updateClient(this.expandedElement.name, {
    //     marchName: value
    //   });
    // }
  }

  onCurrentDateSelected(normalizedMonthAndYear: Date, trigger: MatMenuTrigger) {
    this.currentDate = normalizedMonthAndYear;
    this.cdr.detach();
    this.clients.data = [];
    // this.clientDataService.getClientsMonthly(this.currentDate.getFullYear(), this.currentDate.getMonth()).then((res) => {
    //   res.forEach(c => this.updateCurrentMarch(c as IClientHome));
    //   this.clients.data = res;
    // });

    trigger.closeMenu();
  }

  viewChangedHandler(event: any) {
    this.calendar.currentView = 'year';
    this.cdr.reattach();
  }

  // getSteps(templateName: string): [IMarchStepTemplate] {
  //   let steps = this.templates.find(x => x.name === templateName)?.steps;
  //   if (!steps) throw (`no steps for ${templateName}`);

  //   return steps;
  // }

  // onMarchClick(client: IClientHome, step: IMarchStepTemplate, event: Event) {
  //   let stepIdx = this.getSteps(client.marchName).indexOf(step);
  //   let value = client.monthly.steps[stepIdx].value || 0;
  //   value = (value + 1) % (step.type === StepType.Double ? 2 : 3);
  //   client.monthly.steps[stepIdx].value = value;
  //   this.clientDataService.updateMarchValue(client.monthly, stepIdx, value);
  //   this.updateCurrentMarch(client);
  // }

  // updateCurrentMarch(client: IClientHome) {
  //   let idx = client.monthly.steps.findIndex(x => !x.value || x.value === 0);
  //   if (idx === -1) idx = client.monthly.steps.length - 1;

  //   client.currentMarch = this.templates.find(x => x.name === client.marchName)?.steps[idx].title;
  // }

  // onStopper(element: IClientHome) {
  //   if (this.runningElement === null) {
  //     this.runningElement = element;
  //     this.startTime = new Date();

  //   } else if (element === this.runningElement) {
  //     this.stopStopper(element);

  //   } else {
  //     this.stopStopper(this.runningElement);
  //     this.runningElement = element;
  //     this.startTime = new Date();
  //   }
  // }

  // stopStopper(element: IClientHome) {
  //   this.runningElement = null;
  //   let endTime = new Date();
  //   let userName = this.userService.user?.name || '';
  //   let data: IStopper = {
  //     from: this.startTime,
  //     to: endTime,
  //     time: differenceInSeconds(endTime, this.startTime),
  //     monthly: element.monthly._id,
  //     user: userName,
  //     idString: element.monthly.id
  //   };
  //   this.stopperDataService.addTime(data);
  // }
  */
}
