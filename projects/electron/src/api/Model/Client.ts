import { Schema, model } from 'mongoose';
import { IClient, IClientInfo, ClientMonthly, Client } from '../../interfaces';
import March from './March';

const clientInfoSchema = new Schema<IClientInfo>({
    email: { type: String, default: '' }
});

const clientSchema = new Schema<IClient>({
    name: { type: String, required: true },
    marchName: { type: String, required: true },
});

const clientMonthlySchema = new Schema<ClientMonthly>({
    month: { type: Number },
    year: { type: Number },
    info: clientInfoSchema,
    marchValues: [March.MarchValueModel.schema],
    client: { type: Schema.Types.ObjectId, ref: 'Client' }
});

const ClientModel = model<Client>('Client', clientSchema);
const ClientMonthlyModel = model<ClientMonthly>('ClientMonthly', clientMonthlySchema);

async function getLatestMonthly(client: Client): Promise<ClientMonthly> {
    let result = await ClientMonthlyModel.aggregate([
        {
            $match: { client: { $eq: client._id } }
        }, {
            $sort: { year: -1, month: -1 }
        }, {
            $group: {
                _id: "$idref",
                latestEntry: { $first: "$$ROOT" }
            }
        }, {
            $replaceRoot: { newRoot: "$latestEntry" }  // Replace root with the latest entry document
        }
    ]).exec();


    return result[0];
}

export default {
    ClientModel: ClientModel,
    ClientMonthlyModel: ClientMonthlyModel,

    async updateMonthly(monthly: ClientMonthly) {
        console.log(monthly);
        await ClientMonthlyModel.findByIdAndUpdate(monthly.id, monthly, {});
    },

    async getMonthlies(year: number, month: number): Promise<ClientMonthly[]> {
        let monthlies = await ClientMonthlyModel.find({
            year: year,
            month: month
        })
            .populate('client').lean().exec();

        return monthlies;
    },

    async recreateMonthlies(year: number, month: number, monthlies: ClientMonthly[]) {
        let clients: Array<Client> = [];
        if (monthlies.length === 0) {
            clients = await ClientModel.find({}).exec();
        } else {
            clients = []
        }

        for (const client of clients) {
            let latest = await getLatestMonthly(client);


            if (latest === undefined) {
                latest = new ClientMonthlyModel({
                    year: year,
                    month: month,
                    client: client.id,
                    info: {},
                    marchValues: []
                });
            }///needs work
            else if (latest.month === month && latest.year === year) {
                latest.marchValues = [];
            }
            else {
                let previous = latest;
                latest = new ClientMonthlyModel({
                    year: year,
                    month: month,
                    client: client.id,
                    info: { ...previous.info },
                    marchValues: []
                })
            }
            await latest.save();
        }
    }
}