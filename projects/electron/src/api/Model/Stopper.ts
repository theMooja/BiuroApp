import { Schema, model, Types } from 'mongoose';
import { IStopper } from '../../interfaces';


const schema = new Schema<IStopper>({
    user: { type: String },
    from: { type: Date },
    to: { type: Date },
    time: { type: Number },
    monthly: {
        type: Schema.Types.ObjectId,
        ref: 'ClientMonthly',
        required: true
    }
});

const StopperModel = model<IStopper>('Stopper', schema);

export default {
    StopperModel: StopperModel,

    async addTime(data: IStopper) {
        data.monthly = new Types.ObjectId(data.idString);
        let model = new StopperModel(data);
        await model.save();
    }
}