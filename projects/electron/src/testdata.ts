import { IMarchTemplate, StepType } from './interfaces';
import March from './api/Model/March';
import Client from './api/Model/Client';

const clearDB = async function () {
    await March.MarchTemplateModel.collection.drop();
    await Client.ClientModel.collection.drop();
}

const createMarchTemplates = function () {
    let step1 = new March.MarchStepTemplateModel({
        title: 't1',
        sequence: 1,
        type: StepType.Double
    });
    let step2 = new March.MarchStepTemplateModel({
        title: 't2',
        sequence: 2,
        type: StepType.Double
    })
    let model1 = new March.MarchTemplateModel({
        name: 'tpl1',
        steps: [step1, step2]
    });
    let model2 = new March.MarchTemplateModel({
        name: 'tpl2',
        steps: [step1, step2]
    });

    model1.save();
    model2.save();
}

const createClients = function () {
    let c1 = new Client.ClientModel({
        name: 'c1',
        marchName: 'tpl1'
    });
    c1.save();
    let cm1 = new Client.ClientMonthlyModel({
        clientName: 'c1',
        marchName: 'tpl1',
        month: 1,
        year: 2024
    });
    cm1.save();

    let c2 = new Client.ClientModel({
        name: 'c2',
        marchName: 'tpl2'
    });
    c2.save();
    let cm2 = new Client.ClientMonthlyModel({
        clientName: 'c2',
        marchName: 'tpl2',
        month: 1,
        year: 2024
    });
    cm2.save();

    let c3 = new Client.ClientModel({
        name: 'c3',
        marchName: 'tpl2'
    });
    c3.save();
    let cm3 = new Client.ClientMonthlyModel({
        clientName: 'c3',
        marchName: 'tpl2',
        month: 1,
        year: 2024
    });
    cm3.save();
}

export default {
    async populate() {
        await clearDB();
        createMarchTemplates();
        createClients();
    }
}