import { Schema, model } from 'mongoose';
import { IMarchStepTemplate, IMarchTemplate } from '../../interfaces'

const stepTemplateSchema = new Schema<IMarchStepTemplate>({
    title: { type: String },
});
const marchTemplateSchema = new Schema<IMarchTemplate>({
    name: { type: String },
    steps: [stepTemplateSchema]
});
const March = model<IMarchTemplate>('March', marchTemplateSchema);

export default {
    createTemplate(value: IMarchTemplate) {

        const march = new March({
            name: value.name,
            steps: value.steps
        });

        try {
            march.save()
        } catch {
            console.log("EEE March::BDtemplate");
        }
    },

    async findTemplates(value?: string): Promise<IMarchTemplate[]> {
        try {
            const templates: IMarchTemplate[] = await March.find({}, '-_id -__v').lean().exec();
            return templates;
        } catch (error) {
            throw new Error(`Error finding March templates: ${error}`);
        }
    },
}