import { IMarchTemplate, StepType } from './interfaces';
import March from './api/Model/March';
import Client from './api/Model/Client';
import Stopper from './api/Model/Stopper';

const clearDB = async function () {
    await March.MarchTemplateModel.collection.drop();
    await Client.ClientModel.collection.drop();
    await Client.ClientMonthlyModel.collection.drop();
}

const createMarchTemplates = function (data: any) {
    data.step1 = {
        title: 't1',
        sequence: 1,
        type: StepType.Double
    };
    data.step2 = {
        title: 't2',
        sequence: 2,
        type: StepType.Double
    };
    data.step3 = {
        title: 't3',
        sequence: 3,
        type: StepType.Triple
    };
    data.step4 = {
        title: 't4',
        sequence: 4,
        type: StepType.Triple
    };

    data.march1 = new March.MarchTemplateModel({
        name: 'tpl1',
        steps: [data.step1, data.step2]
    });
    data.march2 = new March.MarchTemplateModel({
        name: 'tpl2',
        steps: [data.step1, data.step2, data.step3, data.step4]
    });

    data.march1.save();
    data.march2.save();
}

const createClients = function (data: any) {
    data.client1 = new Client.ClientModel({
        name: 'client1',
        marchName: 'tpl1'
    });
    data.client1.save();

    let cm1 = new Client.ClientMonthlyModel({
        clientName: 'client1',
        marchName: 'tpl1',
        month: 1,
        year: 2024,
        steps: [data.step1, data.step2]
    });
    cm1.save();
    let cm11 = new Client.ClientMonthlyModel({
        clientName: 'client1',
        marchName: 'tpl1',
        month: 2,
        year: 2024,
        steps: [data.step1, data.step2]
    });
    cm11.save();

    data.client2 = new Client.ClientModel({
        name: 'client2',
        marchName: 'tpl2'
    });
    data.client2.save();
    let cm2 = new Client.ClientMonthlyModel({
        clientName: 'client2',
        marchName: 'tpl2',
        month: 1,
        year: 2024,
        steps: [data.step1, data.step2, data.step3, data.step4]
    });
    cm2.save();

    data.client3 = new Client.ClientModel({
        name: 'client3',
        marchName: 'tpl2'
    });
    data.client3.save();
    let cm3 = new Client.ClientMonthlyModel({
        clientName: 'client3',
        marchName: 'tpl2',
        month: 1,
        year: 2024,
        steps: [data.step1, data.step2, data.step3, data.step4]
    });
    cm3.save();

    let s1 = new Stopper.StopperModel({
        user: 'qq',
        from: new Date(),
        to: new Date(),
        time: 5,
        monthly: cm1._id
    });
    s1.save();
}

export default {
    async populate() {
        let data = {};
        await clearDB();
        createMarchTemplates(data);
        createClients(data);
    }
}