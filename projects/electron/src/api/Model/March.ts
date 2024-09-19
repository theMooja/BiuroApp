import { Schema, model } from 'mongoose';
import { IMarchStepTemplate, IMarchTemplate, IMarchValue, StepType } from '../../interfaces'

const stepTemplateSchema = new Schema<IMarchStepTemplate>({
    title: { type: String },
    sequence: { type: Number },
    type: { type: String },
    weight: { type: Number }
});

const marchTemplateSchema = new Schema<IMarchTemplate>({
    name: { type: String },
    steps: [stepTemplateSchema]
});



const MarchTemplateModel = model<IMarchTemplate>('MarchTemplate', marchTemplateSchema);

export default {
    MarchTemplateModel: MarchTemplateModel,


}