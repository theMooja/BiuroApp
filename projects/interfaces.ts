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
    name: string;
    steps: [IMarchStepTemplate]
}