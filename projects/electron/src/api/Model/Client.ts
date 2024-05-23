import { Schema, model } from 'mongoose';
import { IClient, IClientMonthly } from '../../interfaces';

const clientSchema = new Schema<IClient>({
    name: { type: String },
    marchName: { type: String }
});

const clientMonthlySchema = new Schema<IClientMonthly>({
    clientName: { type: String },
    month: { type: Number },
    year: { type: Number },
    marchName: { type: String },
    marchValues: { type: [Number] },
})

const ClientModel = model<IClient>('Client', clientSchema);
const ClientMonthlyModel = model<IClientMonthly>('ClientMonthly', clientMonthlySchema);

export default {
    ClientModel: ClientModel,
    ClientMonthlyModel: ClientMonthlyModel,

    async getClientsMonthly(year: number, month: number) {
        const clients = await ClientModel.aggregate([
            {
                $lookup:
                {
                    from: "clientmonthlies",
                    as: "clientmonthlies",
                    localField: "name",
                    foreignField: "clientName",

                }
            },
            {
                $unwind: "$clientmonthlies"
            },
            {
                $match: {
                    "clientmonthlies.month": month,
                    "clientmonthlies.year": year
                }
            }
        ]);
        return clients;
    }
}