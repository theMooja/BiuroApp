import mongoose, { ObjectId, PopulatedDoc } from "mongoose"

export interface IUser {
    name: string;
    password: string;
}

export enum StepType {
    Double = 'Double',
    Triple = 'Triple'
}

export interface IMarchStepTemplate {
    title: string,
    sequence: Number,
    type: StepType,
    weight: number
}

export interface IMarchTemplate {
    name: string,
    steps: IMarchStepTemplate[]
}

export type MarchValue = {
    sequence: Number,
    type: StepType,
    weight: number,
    value: number,
    title: string,
    stoppers: IStopper[],
    monthly: PopulatedDoc<ClientMonthly>
} & mongoose.Document;

export interface IMarchValue extends Omit<MarchValue, 'monthly'> {
    monthly: ClientMonthly
}

export interface IClient {
    name: string,
    marchName: string,
}

export type Client = IClient & mongoose.Document;

export interface IClientInfo {
    email: string,
    biuro: string,
    program: string,
    forma: string
}

export interface IClientMonthly extends Omit<ClientMonthly, 'client'> {
    client: IClient
}

export type ClientMonthly = {
    month: number,
    year: number,
    info: IClientInfo,
    notes: string,
    marchValues: PopulatedDoc<MarchValue>[],
    client: PopulatedDoc<IClient>,
} & mongoose.Document;

export type Stopper = {
    user: PopulatedDoc<IUser>,
    from: Date,
    time: number,
}

export interface IStopper extends Omit<Stopper, 'user'> {
    user: IUser
}