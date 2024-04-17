import { Schema, model } from 'mongoose';

interface IMarch {
}
interface IMarchStep {

}

const marchSchema = new Schema<IMarch>({
    name: { type: String, required: true }
});
const March = model<IMarch>('March', marchSchema);

const stepSchema = new Schema<IMarchStep>({

});
const MarchStep = model<IMarchStep>('MarchStep', stepSchema);

export default {
    
}