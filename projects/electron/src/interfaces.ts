export enum StepType {
    Double = 'Double',
    Triple = 'Triple'
}

export interface IMarchStepTemplate {
    title: string,
    sequence: Number,
    type: StepType,
    value?: number
}

export interface IMarchTemplate {
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
    steps: [IMarchStepTemplate]
}