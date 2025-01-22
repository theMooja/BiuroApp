export enum StepType {
    WORK = 'work',
    HIDDEN = 'hidden'
}

export enum Permission {
    FULL = "Pełny dostęp",
    PARTIAL = "Ograniczony dostęp"
}

export enum ListValueTargets {
    INVOICE_DESC = 'invoice_description',
    STEP_DESC = 'step_description',
    REPORT = 'report'
}

export interface IClientEntity {
    id: number;
    name: string;
    isActive: boolean;
    monthlies: IMonthlyEntity[];
}

export interface IMarchEntity {
    id: number;
    name: string;
    sequence: number;
    weight: number;
    value: number;
    monthly: IMonthlyEntity;
    stoppers: IStopperEntity[];
    type: StepType;
    finishedAt: Date;
}


export interface IMonthlyEntity {
    id: number;
    year: number;
    month: number;
    info: {
        email: string,
        podmiot: string,
        program: string,
        forma: string,
        [key: string]: string;
    };
    client: IClientEntity,
    marches: IMarchEntity[],
    invoices: IInvoiceEntity[],
    notes: INoteEntity[],
    currentStep?: string;
}

export interface INoteEntity {
    id?: number;
    text: string,
    user?: IUserEntity,
    monthly: IMonthlyEntity,
    persists: boolean,
    deleteing?: boolean
}

export interface IStopperEntity {
    id: number;
    march: IMarchEntity;
    user: IUserEntity;
    createdAt: Date;
    seconds: number;
    from: Date,
}

export interface IUserEntity {
    id: number,
    name: string,
    password: string,
    stoppers: IStopperEntity[],
    notes: INoteEntity[],
    permission: Permission
}

export interface IInvoiceEntity {
    id?: number,
    no: string,
    sendDate?: Date,
    paidDate?: Date,
    lines: IInvoiceLineEntity[],
    monthly: IMonthlyEntity,
}

export interface IInvoiceLineEntity {
    id: number,
    description: string,
    qtty: number,
    price: number,
}

export interface IListValue {
    text: string,
    target: string,
    sequence: number
}

export interface IReportHeader {
    id?: number,
    type: string,
    name: string,
    isLoading?: number
}

export interface IReport extends IReportHeader {
    input: string,
    output: string
}

export interface IEmployeesReportOutput {
    [user: string]: {
        sumValue: number,
        entries: {
            client: string,
            stepName: string,
            time: number,
            value: number
        }[]
    }
}

export interface IClientsReportOutput {
}