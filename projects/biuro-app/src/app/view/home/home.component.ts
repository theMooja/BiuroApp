import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { ClientDataService } from '../../service/client-data.service';
import { MarchDataService } from './../../service/march-data.service';
import { IClient, IClientMonthly, IMarchStepTemplate, IMarchTemplate, StepType, IStopper } from '../../../../../electron/src/interfaces';
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
import { CdkContextMenuTrigger, CdkMenuItem, CdkMenu } from '@angular/cdk/menu';
import { MatButton } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { differenceInSeconds } from 'date-fns';
import { StopperDataService } from '../../service/stopper-data.service';
import { UserDataService } from '../../service/user-data.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatSort, MatSortModule, MatRippleModule, MatButton, CdkContextMenuTrigger, CdkMenuItem, CdkMenu, CommonModule, MatTableModule, MatIconModule, FormsModule, MatInputModule, MatSelectModule, MatFormFieldModule, MatToolbarModule, MatDatepicker, MatCalendar, MatMenuModule, MatDatepickerToggle],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),],
})
export class HomeComponent {
  clients: MatTableDataSource<IClient>;
  templates: IMarchTemplate[] = [];
  expandedElement: IClient | null = null;
  runningElement: IClientHome | null = null;
  selection = new SelectionModel<IClient>(true);
  currentDate: Date = new Date();
  @ViewChild(MatCalendar) calendar!: MatCalendar<Date>;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  columns: string[] = ['name', 'expand', 'stopper', 'march'];
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
    this.templates = await this.marchDataService.findTemplates();
    let clients = await this.clientDataService.getClientsMonthly(2024, 1);
    clients.forEach(c => this.updateCurrentMarch(c as IClientHome));
    this.clients.data = clients;
    this.sort.active = this.columns[0];
    this.sort.direction = 'asc';
    this.clients.sort = this.sort;
  }

  onMarchTemplateSelected(value: any) {
    if (this.expandedElement) {
      this.clientDataService.updateClient(this.expandedElement.name, {
        marchName: value
      });
    }
  }

  onCurrentDateSelected(normalizedMonthAndYear: Date, trigger: MatMenuTrigger) {
    this.currentDate = normalizedMonthAndYear;
    this.cdr.detach();
    this.clients.data = [];
    this.clientDataService.getClientsMonthly(this.currentDate.getFullYear(), this.currentDate.getMonth()).then((res) => {
      res.forEach(c => this.updateCurrentMarch(c as IClientHome));
      this.clients.data = res;
    });

    trigger.closeMenu();
  }

  viewChangedHandler(event: any) {
    this.calendar.currentView = 'year';
    this.cdr.reattach();
  }

  getSteps(templateName: string): [IMarchStepTemplate] {
    let steps = this.templates.find(x => x.name === templateName)?.steps;
    if (!steps) throw (`no steps for ${templateName}`);

    return steps;
  }

  onMarchClick(client: IClientHome, step: IMarchStepTemplate, event: Event) {
    let stepIdx = this.getSteps(client.marchName).indexOf(step);
    let value = client.monthly.steps[stepIdx].value || 0;
    value = (value + 1) % (step.type === StepType.Double ? 2 : 3);
    client.monthly.steps[stepIdx].value = value;
    this.clientDataService.updateMarchValue(client.monthly, stepIdx, value);
    this.updateCurrentMarch(client);
  }

  updateCurrentMarch(client: IClientHome) {
    let idx = client.monthly.steps.findIndex(x => !x.value || x.value === 0);
    if (idx === -1) idx = client.monthly.steps.length - 1;

    client.currentMarch = this.templates.find(x => x.name === client.marchName)?.steps[idx].title;
  }

  onStopper(element: IClientHome) {
    if (this.runningElement === null) {
      this.runningElement = element;
      this.startTime = new Date();

    } else if (element === this.runningElement) {
      this.stopStopper(element);

    } else {
      this.stopStopper(this.runningElement);
      this.runningElement = element;
      this.startTime = new Date();
    }
  }

  stopStopper(element: IClientHome) {
    this.runningElement = null;
    let endTime = new Date();
    let userName = this.userService.user?.name || '';
    let data: IStopper = {
      from: this.startTime,
      to: endTime,
      time: differenceInSeconds(endTime, this.startTime),
      monthly: element.monthly._id,
      user: userName,
      idString: element.monthly.id
    };
    this.stopperDataService.addTime(data);
  }
}

interface IClientHome extends IClient {
  monthly: IClientMonthly,
  currentMarch?: string
}