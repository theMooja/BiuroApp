export enum StepType {
    WORK = 'work',
    HIDDEN = 'hidden'
}

export interface IClientEntity {
    id: number;
    name: string;
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
}


export interface IMonthlyEntity  {
    id: number;
    year: number;
    month: number;
    note: string;
    info: {
        email: string,
        podmiot: string,
        program: string,
        forma: string
    };
    client: IClientEntity,
    marches: IMarchEntity[];
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
    id: number;
    name: string;
    password: string;
    stoppers: IStopperEntity[];
}
