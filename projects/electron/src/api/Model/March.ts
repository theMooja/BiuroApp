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

const marchValueSchema = new Schema<IMarchValue>({
    title: { type: String },
    sequence: { type: Number },
    type: { type: String },
    weight: { type: Number },
    value: { type: Number },
    stoppers: [{ type: Schema.Types.ObjectId, ref: 'Stopper' }]
});

const MarchTemplateModel = model<IMarchTemplate>('MarchTemplate', marchTemplateSchema);
const MarchValuesModel = model<IMarchValue>('MarchValue', marchValueSchema);

export default {
    MarchTemplateModel: MarchTemplateModel,
    MarchValueModel: MarchValuesModel,

    async getTemplates(): Promise<IMarchTemplate[]> {
        let templates = await MarchTemplateModel.find().orFail().lean().exec();

        return templates;
    },

    async saveTemplate(template: IMarchTemplate) {
        console.log(template, template.steps);
        let update = await MarchTemplateModel.findOneAndUpdate(
            { name: template.name },
            { template },
            { upsert: true, new: true }
        ).orFail();

        update.steps = [...template.steps];
        update.save();
    }

    
}