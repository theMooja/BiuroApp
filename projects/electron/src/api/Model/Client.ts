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
                    as: "monthly",
                    localField: "name",
                    foreignField: "clientName",

                }
            },
            {
                $unwind: "$monthly"
            },
            {
                $match: {
                    "monthly.month": month,
                    "monthly.year": year
                }
            }
        ]);
        return clients;
    },

    async updateClient(client: string, update: Object) {
        let operation = await ClientModel.findOneAndUpdate(
            { name: client },
            update
        );
        operation ?? operation.save();
    },

    async updateMarchValue(current: IClientMonthly, idx: number, value: number) {
        let monthly = await ClientMonthlyModel.findOne(
            {
                clientName: current.clientName,
                year: current.year,
                month: current.month
            }
        ).exec();

        monthly.marchValues[idx] = value;
        await monthly.save();
    }
}