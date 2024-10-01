import { Schema, model } from 'mongoose';
import { IMarchStepTemplate, IMarchTemplate, IMarchValue, IStopper, MarchValue, StepType } from '../../interfaces'
import Client from './Client';

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

const stopperSchema = new Schema<IStopper>({
    user: { type: String },
    from: { type: Date },
    to: { type: Date },
    time: { type: Number }
});

const marchValueSchema = new Schema<MarchValue>({
    title: { type: String },
    sequence: { type: Number },
    type: { type: String },
    weight: { type: Number },
    value: { type: Number },
    stoppers: [stopperSchema],
    monthly: { type: Schema.Types.ObjectId, ref: 'ClientMonthly' }
});

const MarchTemplateModel = model<IMarchTemplate>('MarchTemplate', marchTemplateSchema);
const MarchValueModel = model<MarchValue>('MarchValue', marchValueSchema);

export default {
    MarchTemplateModel: MarchTemplateModel,
    MarchValueModel: MarchValueModel,

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
    },

    async updateMarchValue(marchValue: MarchValue) {
        await MarchValueModel.findByIdAndUpdate(marchValue.id, {
            value: marchValue.value
        }).orFail();
    }
}