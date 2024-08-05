import { Schema, model } from 'mongoose';
import { IClient, IClientMonthly, IMarchStepTemplate } from '../../interfaces';
import March from './March';

const clientSchema = new Schema<IClient>({
    name: { type: String },
    marchName: { type: String }
});

const monthlyStepSchema = new Schema<IMarchStepTemplate>({
    title: { type: String },
    sequence: { type: Number },
    type: { type: String }
})

const clientMonthlySchema = new Schema<IClientMonthly>({
    clientName: { type: String },
    month: { type: Number },
    year: { type: Number },
    marchName: { type: String },
    steps: [March.MarchStepTemplateModel.schema],
})

const ClientModel = model<IClient>('Client', clientSchema);
const ClientMonthlyModel = model<IClientMonthly>('ClientMonthly', clientMonthlySchema);

export default {
    ClientModel: ClientModel,
    ClientMonthlyModel: ClientMonthlyModel,

    async getClientsMonthly(year: number, month: number) {
        let clients: any[] = [];

        await ClientModel.aggregate([
            {
                $lookup:
                {
                    from: "clientmonthlies",
                    localField: "name",
                    foreignField: "clientName",
                    as: "monthly",
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$year", year] },
                                        { $eq: ["$month", month] }
                                    ]
                                }
                            }
                        }
                    ]

                }
            },
            {
                $unwind: {
                    path: "$monthly",
                    preserveNullAndEmptyArrays: true
                }
            }
        ]).exec().then(res => {
            clients = res.map(doc => doc.toObject ? doc.toObject() : doc);
        });

        let templates = await March.findTemplates();
        clients.forEach(c => {
            let template = templates.find(t => t.name === c.marchName);
            if (!c.monthly) {
                let m = new ClientMonthlyModel({
                    clientName: c.name,
                    marchName: c.marchName,
                    month: month,
                    year: year,
                    steps: template.steps
                });
                m.save();
                c.monthly = m.toObject();
            }
        });
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
        
        monthly.steps[idx].value = value;
        await monthly.save();
    }
}