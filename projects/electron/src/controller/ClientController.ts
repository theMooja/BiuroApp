import axios from "axios";
import { AppDataSource } from "./../datasource"
import { ClientEntity } from "./../entity/Client";
import { ListValueEntity } from "./../entity/ListValue";
import { IClientEntity } from "./../interfaces";

export const ClientController = {
    async getClients(): Promise<IClientEntity[]> {
        return await AppDataSource
            .getRepository(ClientEntity)
            .find({
                where: {
                    isActive: true
                },
                order: {
                    name: "ASC"
                }
            });
    },

    async saveClient(client: IClientEntity): Promise<IClientEntity> {
        let repo = AppDataSource.getRepository(ClientEntity);
        return await repo.save(client);
    },

    async syncFakturowniaIds() {
        // /curl "https://YOUR_DOMAIN.fakturownia.pl/clients.json?page=1&per_page=25&api_token=API_TOKEN"

        let apiKey = await AppDataSource.getRepository(ListValueEntity).findOneBy({
            target: 'finka-fakturownia'
        });

        const fakturowniaDomain = 'finka';
        const apiToken = apiKey.value;

        const url = `https://${fakturowniaDomain}.fakturownia.pl/clients.json`;
        const params = {
            api_token: apiToken,
            page: 1,
            per_page: 1000
        };
        const response = await axios.get(url, { params });
        const data = response.data;

        const clients = await AppDataSource.getRepository(ClientEntity)
            .createQueryBuilder('i')
            .getMany();

        const fakturowniaMap = new Map<string, number>(); // tax_no -> id

        for (const fc of data) {
            if (fc.tax_no) {
                fakturowniaMap.set(fc.tax_no, fc.id);
            }
        }

        clients.forEach(async client => {
            if (client.nip && fakturowniaMap.has(client.nip)) {
                client.details.fakturowniaId = fakturowniaMap.get(client.nip).toString();
                await client.save();
            }
        });
    }
}