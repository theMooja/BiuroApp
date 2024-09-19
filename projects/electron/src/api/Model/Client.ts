import { Schema, model } from 'mongoose';
import { IClient, IClientMonthly, IClientInfo, IMarchValue } from '../../interfaces';

const marchValueSchema = new Schema<IMarchValue>({
    title: { type: String },
    sequence: { type: Number },
    type: { type: String },
    weight: { type: Number },
    value: {type: Number},
    stoppers: [{type: Schema.Types.ObjectId, ref: 'Stopper'}]
});

const clientInfoSchema = new Schema<IClientInfo>({
    email: { type: String }
});

const clientSchema = new Schema<IClient>({
    name: { type: String },
    marchName: { type: String },
});

const clientMonthlySchema = new Schema<IClientMonthly>({
    month: { type: Number },
    year: { type: Number },
    info: clientInfoSchema,
    marchValues: [marchValueSchema],
});

const ClientModel = model<IClient>('Client', clientSchema);
const ClientMonthlyModel = model<IClientMonthly>('ClientMonthly', clientMonthlySchema);

export default {
    ClientModel: ClientModel,
    ClientMonthlyModel: ClientMonthlyModel,
}