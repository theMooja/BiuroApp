import { Schema, model } from 'mongoose';
import { IClient, IClientMonthly, IClientInfo, IMarchValue, ClientMonthly } from '../../interfaces';

const marchValueSchema = new Schema<IMarchValue>({
    title: { type: String },
    sequence: { type: Number },
    type: { type: String },
    weight: { type: Number },
    value: { type: Number },
    stoppers: [{ type: Schema.Types.ObjectId, ref: 'Stopper' }]
});

const clientInfoSchema = new Schema<IClientInfo>({
    email: { type: String }
});

const clientSchema = new Schema<IClient>({
    name: { type: String, required: true },
    marchName: { type: String, required: true },
});

const clientMonthlySchema = new Schema<ClientMonthly>({
    month: { type: Number },
    year: { type: Number },
    info: clientInfoSchema,
    marchValues: [marchValueSchema],
    client: { type: Schema.Types.ObjectId, ref: 'Client' }
});

const ClientModel = model<IClient>('Client', clientSchema);
const ClientMonthlyModel = model<ClientMonthly>('ClientMonthly', clientMonthlySchema);

export default {
    ClientModel: ClientModel,
    ClientMonthlyModel: ClientMonthlyModel,

    async getMonthlies(year: number, month: number): Promise<ClientMonthly[]> {
        let monthlies = await ClientMonthlyModel.find({
            year: year,
            month: month
        })
            .populate('client').lean().exec();

        return monthlies;
    }
}