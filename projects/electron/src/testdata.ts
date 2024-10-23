import { UserEntity } from './entity/User';
import { AppDataSource } from './datasource';
import { ClientEntity } from './entity/Client';
import { MonthlyEntity } from './entity/Monthly';
import { MarchEntity } from './entity/March';
import { StopperEntity } from './entity/Stopper';
import { InvoiceEntity } from './entity/Invoice';
import { InvoiceLineEntity } from './entity/InvoiceLine';


const clearDB = async function () {
    const entityManager = AppDataSource.manager;

    await entityManager.query('DELETE FROM stoppers');
    await entityManager.query('DELETE FROM marches');
    await entityManager.query('DELETE FROM monthlies');
    await entityManager.query('DELETE FROM clients');
    await entityManager.query('DELETE FROM users');
    await entityManager.query('DELETE FROM invoices');
    await entityManager.query('DELETE FROM invoicelines');
}

const createUsers = async function (data: any) {
    console.log('-----------creating users');
    let repo = AppDataSource.getRepository(UserEntity);

    data.user1 = await repo.save({
        name: 'U1',
        password: 'p1'
    });
    data.user2 = await repo.save({
        name: 'U2',
        password: 'p2'
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
}

const createMonthlies = async function (data: any) {
    console.log('-----------creating monthlies');
    let repo = AppDataSource.getRepository(MonthlyEntity);

    data.c1monthly1 = await repo.save({
        client: data.client1,
        month: 1,
        year: 2024,
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
        year: 2024,
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
        year: 2024,
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
        weight: 1,
        value: 0
    });

    data.c1m1march2 = await repo.save({
        monthly: data.c1monthly1,
        name: 's2',
        sequence: 2,
        weight: 1,
        value: 0
    });

    data.c1m1march3 = await repo.save({
        monthly: data.c1monthly1,
        name: 's3',
        sequence: 3,
        weight: 1,
        value: 0
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

    data.c2m1march3 = await repo.save({
        monthly: data.c3monthly1,
        name: 's3',
        sequence: 3,
        weight: 1,
        value: 0
    })
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

    data.stopper2 = await repo.save({
        user: data.user2,
        march: data.c1m1march2,
        seconds: 15 * 60,
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
    }
}