//value 1 = done, 0 = not done
export enum StepType {
    GYR = '3 światla',  // 1 2 0
    GR = '2 światla',   // 1 0
    DATE = 'data',      // 1 0
    HIDDEN = 'hidden'
}

export enum Permission {
    SUPER = "super",
    FULL = "full",
    USER = "user"
}

export function hasAccess(user: IUserEntity | undefined, permission: Permission) {
    if(!user) return false;
    if (permission === Permission.SUPER) {
        return user.permission === Permission.SUPER;
    }
    else if (permission === Permission.FULL) {
        return user.permission === Permission.SUPER || user.permission === Permission.FULL;
    } else {
        return true;
    }
}

export enum ListValueTargets {
    INVOICE_DESC = 'invoice_description',
    STEP_DESC = 'step_description',
    REPORT = 'report',
    INVOICE_CATEGORY = 'invoice_category'
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
    ownerId?: number;
    owner?: IUserEntity;
    isReady?: boolean;
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
        wlasciciel: string,
        place: string,
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
    category?: string
}

export interface IListValue {
    text: string,
    target: string,
    sequence: number
}

export interface IReportHeader {
    id?: number,
    type: string,
    name?: string
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

export interface ISummaryReportOutput {
    sumInvoice: {
        [cat: string]: {
            [form: string]: {
                sum: number
            }
        }
    }
}

export interface ISummaryReportInput {
    month: number,
    year: number
}