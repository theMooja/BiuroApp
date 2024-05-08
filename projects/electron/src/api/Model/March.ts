import { Schema, model } from 'mongoose';
import { IMarchStepTemplate, IMarchTemplate } from '../../interfaces'

const stepSchema = new Schema<IMarchStepTemplate>({
    title: { type: String },
});
const marchSchema = new Schema<IMarchTemplate>({
    name: { type: String, required: true },
    steps: [stepSchema]
});
const March = model<IMarchTemplate>('March', marchSchema);

export default {
    createTemplate(value: any) {
        const march = new March({
            name: value.name,
            steps: value.steps
        });
        march.save();
    }
}