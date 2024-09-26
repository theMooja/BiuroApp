import { IMarchTemplate, StepType } from './interfaces';
import March from './api/Model/March';
import Client from './api/Model/Client';
import Stopper from './api/Model/Stopper';
import User from './api/Model/User';

const clearDB = async function () {
    await March.MarchTemplateModel.collection.drop();
    await Client.ClientModel.collection.drop();
    await Client.ClientMonthlyModel.collection.drop();
    await User.UserModel.collection.drop();
}

const createUsers = async function (data: any) {
    data.user1 = new User.UserModel(
        {
            name: 'U1',
            password: 'p1'
        }
    );
    await data.user1.save();
    data.user2 = new User.UserModel(
        {
            name: 'U2',
            password: 'p2'
        }
    );
    await data.user2.save();
}

const createMarchTemplates = async function (data: any) {
    data.march1 = new March.MarchTemplateModel({
        name: 'm1',
        steps: [
            {
                title: 's1',
                sequence: 1,
                type: StepType.Double,
                weight: 1
            },
            {
                title: 's2',
                sequence: 2,
                type: StepType.Double,
                weight: 1
            },
            {
                title: 's3',
                sequence: 3,
                type: StepType.Double,
                weight: 1
            }
        ]
    });
    await data.march1.save();

    data.march2 = new March.MarchTemplateModel({
        name: 'm2',
        steps: [
            {
                title: 's1',
                sequence: 1,
                type: StepType.Double,
                weight: 1
            },
            {
                title: 's2',
                sequence: 2,
                type: StepType.Double,
                weight: 1
            },
            {
                title: 's3',
                sequence: 3,
                type: StepType.Double,
                weight: 1
            }
        ]
    });
    await data.march2.save();


}

const createClients = async function (data: any) {
    data.client1 = new Client.ClientModel({
        name: 'c1',
        marchName: 'm1'
    });
    await data.client1.save();

    data.client2 = new Client.ClientModel({
        name: 'c2',
        marchName: 'm2'
    });
    await data.client2.save();

    data.client3 = new Client.ClientModel({
        name: 'c3',
        marchName: 'm2'
    });
    await data.client3.save();

    data.monthly1 = new Client.ClientMonthlyModel({
        client: data.client1._id,
        month: 1,
        year: 2024,
        info: {
            email: 'c1@email.com'
        },
        marchValues: [
            {
                ...data.march1.steps[0],
                value: 1
            },
            {
                ...data.march1.steps[1],
                value: 1
            },
            {
                ...data.march1.steps[2],
                value: 1
            }
        ]
    });
    await data.monthly1.save();

    data.monthly2 = new Client.ClientMonthlyModel({
        client: data.client1._id,
        month: 2,
        year: 2024,
        info: {
            email: 'c1@email.com'
        },
        marchValues: [
            {
                ...data.march1.steps[0],
                value: 1
            },
            {
                ...data.march1.steps[1],
                value: 0
            },
            {
                ...data.march1.steps[2],
                value: 0
            }
        ]
    });
    await data.monthly2.save();

    data.monthly3 = new Client.ClientMonthlyModel({
        client: data.client2._id,
        month: 1,
        year: 2024,
        info: {
            email: 'c2@email.com'
        },
        marchValues: [
            {
                ...data.march2.steps[0],
                value: 1
            },
            {
                ...data.march2.steps[1],
                value: 0
            },
            {
                ...data.march2.steps[2],
                value: 0
            }
        ]
    });
    await data.monthly3.save();
}

export default {
    async populate() {
        let data = {};
        await clearDB();
        await createUsers(data);
        await createMarchTemplates(data);
        await createClients(data);
    }
}