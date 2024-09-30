import mongoose, { PopulatedDoc, Types } from "mongoose"

export interface IUser {
    name: string,
    password: string
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

export interface IMarchValue extends mongoose.Document {
    sequence: Number,
    type: StepType,
    weight: number,
    value: number,
    title: string,
    stoppers: IStopper[]
}

//export type MarchValue = IMarchValue & mongoose.Document

export interface IClient {
    name: string,
    marchName: string,
}

export type Client = IClient & mongoose.Document;

export interface IClientInfo {
    email: string
}

export interface IClientMonthly extends Omit<ClientMonthly, 'client'> {
    client: IClient
}

export type ClientMonthly = {
    month: number,
    year: number,
    info: IClientInfo,
    marchValues: IMarchValue[],
    client: PopulatedDoc<IClient>,
} & mongoose.Document;

export interface IStopper {
    user: string,
    from: Date,
    to: Date,
    time: number,
    monthly: Types.ObjectId,
    idString: string,
}