import { Schema, model } from 'mongoose';

interface IMarchStep {

}
interface IMarch {
    name: string;
    children: [IMarchStep]
}


const stepSchema = new Schema<IMarchStep>({
    title: { type: String },
});
const MarchStep = model<IMarchStep>('MarchStep', stepSchema);

const marchSchema = new Schema<IMarch>({
    name: { type: String, required: true },
    children: [stepSchema]
});
const March = model<IMarch>('March', marchSchema);



export default {
    createTemplate(value: any) {
        const march = new March({
            name: value.name,
            children: value.steps
        });
        march.save();
    }
}