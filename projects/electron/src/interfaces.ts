import { Types } from "mongoose"

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
    steps: [IMarchStepTemplate],
    id: string,
    _id: Types.ObjectId
}

export interface IStopper {
    user: string,
    from: Date,
    to: Date,
    time: number,
    monthly: Types.ObjectId,
    idString: string,
}