export enum StepType {
    Double = 'Double',
    Triple = 'Triple'
}

export interface IMarchStepTemplate {
    title: string,
    sequence: Number,
    type: StepType
}

export interface IMarchTemplate {
    name: string,
    steps: [IMarchStepTemplate]
}

export interface IMarchFilters {
    name: string,
    steps: [IMarchStepTemplate]
}

export interface IClient {
    name: string,
    marchName: string
}

export interface IClientMonthly {
    clientName: string,
    month: number,
    year: number,
    marchName: string,
    marchValues: [number]
}