import { UserEntity } from './entity/User';
import { AppDataSource } from './datasource';
import { ClientEntity } from './entity/Client';
import { MonthlyEntity } from './entity/Monthly';
import { MarchEntity } from './entity/March';
import { StopperEntity } from './entity/Stopper';
import { InvoiceEntity } from './entity/Invoice';
import { InvoiceLineEntity } from './entity/InvoiceLine';
import { ListValueEntity } from './entity/ListValue';
import { ListValueTargets, Permission, StepType } from './interfaces';
import { ReportEntity } from './entity/Report';


const clearDB = async function () {
    const entityManager = AppDataSource.manager;

    await entityManager.query('DELETE FROM notes');
    await entityManager.query('DELETE FROM stoppers');
    await entityManager.query('DELETE FROM marches');
    await entityManager.query('DELETE FROM monthlies');
    await entityManager.query('DELETE FROM clients');
    await entityManager.query('DELETE FROM users');
    await entityManager.query('DELETE FROM invoices');
    await entityManager.query('DELETE FROM invoicelines');
    await entityManager.query('DELETE FROM listvalues');
}

const createUsers = async function (data: any) {
    console.log('-----------creating users');
    let repo = AppDataSource.getRepository(UserEntity);

    data.user1 = await repo.save({
        name: 'U1',
        password: 'p1',
        permission: Permission.SUPER
    });
    data.user2 = await repo.save({
        name: 'U2',
        password: 'p2',
        permission: Permission.FULL
    });
    data.user3 = await repo.save({
        name: 'U3',
        password: 'p2',
        permission: Permission.USER
    });
}

const createClients = async function (data: any) {
    console.log('-----------creating clients');
    let repo = AppDataSource.getRepository(ClientEntity);
    data.client1 = await repo.save({
        name: 'c1',
    });
    data.client2 = await repo.save({
        name: 'c2',
    });
    data.client3 = await repo.save({
        name: 'c3',
    });
    data.client4 = await repo.save({
        name: 'c4',
    });
    data.client5 = await repo.save({
        name: 'c5',
    });
    data.client6 = await repo.save({
        name: 'c6',
    });
    data.client7 = await repo.save({
        name: 'c7',
    });
    data.client8 = await repo.save({
        name: 'c8',
    });
    data.client9 = await repo.save({
        name: 'c9',
    });
}

const createMonthlies = async function (data: any) {
    console.log('-----------creating monthlies');
    let repo = AppDataSource.getRepository(MonthlyEntity);

    data.c1monthly1 = await repo.save({
        client: data.client1,
        month: 1,
        year: 2025,
        info: {
            email: 'c1@email.com',
            firma: 'finka',
            forma: 'vat',
            ZUS: '666',
            VAT: '777',
            skladki: '3'
        }
    });

    data.c2monthly1 = await repo.save({
        client: data.client2,
        month: 1,
        year: 2025,
        info: {
            email: 'c2@email.com',
            firma: 'fintax',
            forma: 'vat',
            ZUS: '666',
            VAT: '777',
            skladki: '3'
        }
    });

    data.c3monthly1 = await repo.save({
        client: data.client3,
        month: 1,
        year: 2025,
        info: {
            email: 'c3@email.com',
            firma: 'finka',
            forma: 'cit',
            ZUS: '666',
            VAT: '777',
            skladki: '3'
        }
    });

    data.c4monthly1 = await repo.save({
        client: data.client4,
        month: 1,
        year: 2025,
        info: {
            email: 'c3@email.com',
            firma: 'finka',
            forma: 'cit',
            ZUS: '666',
            VAT: '777',
            skladki: '3'
        }
    });

    data.c5monthly1 = await repo.save({
        client: data.client5,
        month: 1,
        year: 2025,
        info: {
            email: 'c3@email.com',
            firma: 'finka',
            forma: 'cit',
            ZUS: '666',
            VAT: '777',
            skladki: '3'
        }
    });

    data.c6monthly1 = await repo.save({
        client: data.client6,
        month: 1,
        year: 2025,
        info: {
            email: 'c3@email.com',
            firma: 'finka',
            forma: 'cit',
            ZUS: '666',
            VAT: '777',
            skladki: '3'
        }
    });

    data.c7monthly1 = await repo.save({
        client: data.client7,
        month: 1,
        year: 2025,
        info: {
            email: 'c3@email.com',
            firma: 'finka',
            forma: 'cit',
            ZUS: '666',
            VAT: '777',
            skladki: '3'
        }
    });

    data.c8monthly1 = await repo.save({
        client: data.client8,
        month: 1,
        year: 2025,
        info: {
            email: 'c3@email.com',
            firma: 'finka',
            forma: 'cit',
            ZUS: '666',
            VAT: '777',
            skladki: '3'
        }
    });

    data.c9monthly1 = await repo.save({
        client: data.client9,
        month: 1,
        year: 2025,
        info: {
            email: 'c3@email.com',
            firma: 'finka',
            forma: 'cit',
            ZUS: '666',
            VAT: '777',
            skladki: '3'
        }
    });
}

const createMarches = async function (data: any) {
    console.log('-----------creating marches');
    let repo = AppDataSource.getRepository(MarchEntity);

    data.c1m1march1 = await repo.save({
        monthly: data.c1monthly1,
        name: 's1',
        sequence: 1,
        weight: 5,
        value: 0
    });

    data.c1m1march2 = await repo.save({
        monthly: data.c1monthly1,
        name: 's2',
        sequence: 2,
        weight: 2,
        value: 0
    });

    data.c1m1march3 = await repo.save({
        monthly: data.c1monthly1,
        name: 's3',
        sequence: 3,
        weight: 2,
        value: 0
    });

    data.c1m1march4 = await repo.save({
        monthly: data.c1monthly1,
        name: 's4h',
        sequence: 3,
        weight: 1,
        value: 0,
        type: StepType.HIDDEN
    });

    data.c2m1march1 = await repo.save({
        monthly: data.c2monthly1,
        name: 's1',
        sequence: 1,
        weight: 1,
        value: 0
    });

    data.c2m1march2 = await repo.save({
        monthly: data.c2monthly1,
        name: 's2',
        sequence: 2,
        weight: 1,
        value: 0
    });

    data.c2m1march3 = await repo.save({
        monthly: data.c2monthly1,
        name: 's3',
        sequence: 3,
        weight: 1,
        value: 0
    });

    data.c3m1march1 = await repo.save({
        monthly: data.c3monthly1,
        name: 's1',
        sequence: 1,
        weight: 1,
        value: 0
    });

    data.c3m1march2 = await repo.save({
        monthly: data.c3monthly1,
        name: 's2',
        sequence: 2,
        weight: 1,
        value: 0
    });

    data.c3m1march3 = await repo.save({
        monthly: data.c3monthly1,
        name: 's3',
        sequence: 3,
        weight: 1,
        value: 0
    });

    data.c4m1march1 = await repo.save({
        monthly: data.c4monthly1,
        name: 's1',
        sequence: 1,
        weight: 1,
        value: 0
    });

    data.c4m1march2 = await repo.save({
        monthly: data.c4monthly1,
        name: 's2',
        sequence: 2,
        weight: 1,
        value: 0
    });

    data.c4m1march3 = await repo.save({
        monthly: data.c4monthly1,
        name: 's3',
        sequence: 3,
        weight: 1,
        value: 0
    });

    data.c5m1march1 = await repo.save({
        monthly: data.c5monthly1,
        name: 's1',
        sequence: 1,
        weight: 1,
        value: 0
    });

    data.c5m1march2 = await repo.save({
        monthly: data.c5monthly1,
        name: 's2',
        sequence: 2,
        weight: 1,
        value: 0
    });

    data.c5m1march3 = await repo.save({
        monthly: data.c5monthly1,
        name: 's3',
        sequence: 3,
        weight: 1,
        value: 0
    });

    data.c6m1march1 = await repo.save({
        monthly: data.c6monthly1,
        name: 's1',
        sequence: 1,
        weight: 1,
        value: 0
    });

    data.c6m1march2 = await repo.save({
        monthly: data.c6monthly1,
        name: 's2',
        sequence: 2,
        weight: 1,
        value: 0
    });

    data.c6m1march3 = await repo.save({
        monthly: data.c6monthly1,
        name: 's3',
        sequence: 3,
        weight: 1,
        value: 0
    });

    data.c7m1march1 = await repo.save({
        monthly: data.c7monthly1,
        name: 's1',
        sequence: 1,
        weight: 1,
        value: 0
    });

    data.c7m1march2 = await repo.save({
        monthly: data.c7monthly1,
        name: 's2',
        sequence: 2,
        weight: 1,
        value: 0
    });

    data.c7m1march3 = await repo.save({
        monthly: data.c7monthly1,
        name: 's3',
        sequence: 3,
        weight: 1,
        value: 0
    });

    data.c8m1march1 = await repo.save({
        monthly: data.c8monthly1,
        name: 's1',
        sequence: 1,
        weight: 1,
        value: 0
    });

    data.c8m1march2 = await repo.save({
        monthly: data.c8monthly1,
        name: 's2',
        sequence: 2,
        weight: 1,
        value: 0
    });

    data.c8m1march3 = await repo.save({
        monthly: data.c8monthly1,
        name: 's3',
        sequence: 3,
        weight: 1,
        value: 0
    });

    data.c9m1march1 = await repo.save({
        monthly: data.c9monthly1,
        name: 's1',
        sequence: 1,
        weight: 1,
        value: 0
    });

    data.c9m1march2 = await repo.save({
        monthly: data.c9monthly1,
        name: 's2',
        sequence: 2,
        weight: 1,
        value: 0
    });

    data.c9m1march3 = await repo.save({
        monthly: data.c9monthly1,
        name: 's3',
        sequence: 3,
        weight: 1,
        value: 0
    });
}

const createStoppers = async function (data: any) {
    console.log('-----------creating stoppers');
    let repo = AppDataSource.getRepository(StopperEntity);

    data.stopper1 = await repo.save({
        user: data.user1,
        march: data.c1m1march1,
        seconds: 15 * 60,
        from: new Date()
    });

    data.stopper12 = await repo.save({
        user: data.user1,
        march: data.c1m1march1,
        seconds: 45 * 60,
        from: new Date()
    });

    data.stopper13 = await repo.save({
        user: data.user1,
        march: data.c1m1march1,
        seconds: -10 * 60,
        from: new Date()
    });

    data.stopper14 = await repo.save({
        user: data.user1,
        march: data.c1m1march3,
        seconds: -10 * 60,
        from: new Date()
    });

    data.stopper21 = await repo.save({
        user: data.user2,
        march: data.c1m1march2,
        seconds: 15 * 60,
        from: new Date()
    });

    data.stopper22 = await repo.save({
        user: data.user2,
        march: data.c1m1march1,
        seconds: 50 * 60,
        from: new Date()
    });
}

const createInvoices = async function (data: any) {
    console.log('-----------creating invoices');
    let irepo = AppDataSource.getRepository(InvoiceEntity);
    let lrepo = AppDataSource.getRepository(InvoiceLineEntity);

    data.inv1 = await irepo.save({
        no: 'inv1',
        monthly: data.c1monthly1,
    });

    data.inv1l1 = await lrepo.save({
        invoice: data.inv1,
        description: 's1',
        price: 100,
        qtty: 1
    });


}

const createReports = async function (data: any) {
    console.log('-----------creating reports');
    let repo = AppDataSource.getRepository(ReportEntity);

    await repo.save({
        type: 'clientProfitability',
        name: 'rentowność klientów 01 2025',
    });
}

const createListValues = async function (data: any) {
    console.log('-----------creating list values');
    let repo = AppDataSource.getRepository(ListValueEntity);

    await repo.save({
        text: 'dokumenty',
        target: ListValueTargets.INVOICE_DESC,
    });
    await repo.save({
        text: 'deklaracje',
        target: ListValueTargets.INVOICE_DESC,
    });
    await repo.save({
        text: 'księgowość',
        target: ListValueTargets.INVOICE_CATEGORY,
    });
    await repo.save({
        text: 'kadry',
        target: ListValueTargets.INVOICE_CATEGORY,
    });
    await repo.save({
        text: 'wprowadzanie',
        target: ListValueTargets.STEP_DESC,
    });
    await repo.save({
        text: 'skanowanie',
        target: ListValueTargets.STEP_DESC,
    });
    await repo.save({
        text: 'clientProfitability',
        target: ListValueTargets.REPORT,
    });
    await repo.save({
        text: 'klienci',
        target: ListValueTargets.REPORT,
    });
    await repo.save({
        text: 'VM',
        target: 'info-ZUS',
    });
    await repo.save({
        text: 'VK',
        target: 'info-ZUS',
    });
    await repo.save({
        text: 'cit',
        target: 'info-forma',
    });
}

export default {
    async populate() {
        let data = {};
        console.log('creating test data');

        await clearDB();
        await createUsers(data);
        await createClients(data);
        await createMonthlies(data);
        await createMarches(data);
        await createStoppers(data);
        await createInvoices(data);
        await createListValues(data);
        await createReports(data);
    }
}