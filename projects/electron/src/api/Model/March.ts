import { Schema, model } from 'mongoose';
import { IMarchStepTemplate, IMarchTemplate, StepType } from '../../interfaces'

const stepTemplateSchema = new Schema<IMarchStepTemplate>({
    title: { type: String },
    sequence: { type: Number },
    type: { type: String }
});
const marchTemplateSchema = new Schema<IMarchTemplate>({
    name: { type: String },
    steps: [stepTemplateSchema]
});
const MarchTemplateModel = model<IMarchTemplate>('MarchTemplate', marchTemplateSchema);
const MarchStepTemplateModel = model<IMarchStepTemplate>('MarchStepTemplate', stepTemplateSchema);

export default {
    marchTemplateModel: MarchTemplateModel,
    marchStepTemplateModel: MarchStepTemplateModel,
    createTemplate(value: IMarchTemplate) {

        const march = new MarchTemplateModel({
            name: value.name,
            steps: value.steps
        });

        try {
            march.save()
        } catch {
            console.log("EEE March::createTemplate");
        }
    },

    async findTemplates(value?: string): Promise<IMarchTemplate[]> {
        try {
            const templates: IMarchTemplate[] = await MarchTemplateModel.find({}, '-_id -__v').lean().exec();
            return templates;
        } catch (error) {
            throw new Error(`Error finding March templates: ${error}`);
        }
    },
}