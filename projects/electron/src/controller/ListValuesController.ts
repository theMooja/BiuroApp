import { AppDataSource } from "../datasource";
import { ListValueEntity } from "../entity/ListValue";
import { IListValue } from "../interfaces";

export const ListValuesController = {
    async get(target: string): Promise<IListValue[]> {
        let repo = AppDataSource.getRepository(ListValueEntity);

        return await repo.find({
            where: {
                target: target
            }
        });
    }
}