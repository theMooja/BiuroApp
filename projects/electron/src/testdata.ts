import { IMarchTemplate, StepType } from './interfaces';
import March from './api/Model/March';

const clearDB = async function () {
    await March.marchTemplateModel.collection.drop();
}

const createMarchTemplates = function () {
    let step1 = new March.marchStepTemplateModel({
        title: 't1',
        sequence: 1,
        type: StepType.Double
    });
    let step2 = new March.marchStepTemplateModel({
        title: 't2',
        sequence: 2,
        type: StepType.Double
    })
    let model1 = new March.marchTemplateModel({
        name: 'tpl1',
        steps: [step1, step2]
    });
    let model2 = new March.marchTemplateModel({
        name: 'tpl2',
        steps: [step1, step2]
    });

    model1.save();
    model2.save();
}

export default {
    async populate(): Promise<void> {
        await clearDB();
        createMarchTemplates();
    }
}