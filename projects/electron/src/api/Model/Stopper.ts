import { Schema, model } from 'mongoose';
import { IStopperTemplate } from '../../interfaces'

const schema = new Schema<IStopperTemplate>({
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

const StopperModel = model<IStopperTemplate>('Stopper', schema);

export default {
    StopperModel: StopperModel
}