import { Schema, model } from 'mongoose';

interface IMarchStep {

}
interface IMarch {
    name: string;
    children: [IMarchStep]
}


const stepSchema = new Schema<IMarchStep>({
    value: { type: Number },
});
const MarchStep = model<IMarchStep>('MarchStep', stepSchema);

const marchSchema = new Schema<IMarch>({
    name: { type: String, required: true },
    children: [stepSchema]
});
const March = model<IMarch>('March', marchSchema);



export default {
    create(name: string, steps: IMarchStep[]) {
        const march = new March({
            name: name,
            children: steps
        });
        march.save();
    }
}