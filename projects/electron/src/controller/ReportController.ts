import { AppDataSource } from "../datasource";
import { InvoiceEntity } from "../entity/Invoice";
import { MarchEntity } from "../entity/March";
import { MonthlyEntity } from "../entity/Monthly";
import { ReportEntity } from "../entity/Report";
import { StopperEntity } from "../entity/Stopper";
import { IReportHeader, IReport, IProfitabilityReportInput, IProfitabilityReportOutput, ISummaryReportOutput, IEmployeesReportOutput, IBudgetReportInput, IBudgetReportOutput } from "../interfaces";

export const ReportController = {
    async generateReport(header: IReportHeader, data: any): Promise<IReport> {
        let report: IReport = {
            id: header.id,
            name: header.name,
            type: header.type,
            input: JSON.stringify(data),
            output: JSON.stringify(await this.generateReportOutput(header.type, data))
        };

        return await this.saveReport(report);
    },

    async getReport(report: IReportHeader): Promise<IReport> {
        let repo = AppDataSource.getRepository(ReportEntity);
        let reportEntity = await repo.findOneBy({ id: report.id });
        return reportEntity;
    },

    async getHeaders(): Promise<IReportHeader[]> {
        let repo = AppDataSource.getRepository(ReportEntity);
        return await repo.find();
    },

    async saveReport(report: IReport): Promise<IReport> {
        let repo = AppDataSource.getRepository(ReportEntity);
        let entity: IReport;

        if (!report.id) {
            entity = new ReportEntity();
        } else {
            entity = await repo.findOneBy({ id: report.id });
        }
        entity.name = report.name;
        entity.type = report.type;
        entity.input = report.input;
        entity.output = report.output;

        return await repo.save(entity);
    },

    async removeReport(report: IReportHeader) {
        let repo = AppDataSource.getRepository(ReportEntity);
        let entity = await repo.findOneBy({ id: report.id });
        if (entity && report.id) {
            await repo.remove(entity);
        }
    },

    async generateReportOutput(reportType: string, input: any): Promise<string> {
        switch (reportType) {
            case 'summary':
                return await this.generateSummaryReportOutput(input);
            case 'budget':
                return await this.generateBudgetReportOutput(input);
            case 'clientProfitability':
                return await this.generateClientProfitabilityReportOutput(input);
            default:
                return '';
        }

    },

    async generateClientProfitabilityReportOutput(input: IProfitabilityReportInput): Promise<IProfitabilityReportOutput> {
        let output: IProfitabilityReportOutput = {
            employees: [],
            clients: []
        };

        let invoices = await AppDataSource.getRepository(InvoiceEntity).createQueryBuilder('i')
            .leftJoinAndSelect('i.lines', 'l')
            .leftJoinAndSelect('i.monthly', 'm')
            .leftJoinAndSelect('m.client', 'c')
            .where('m.month = :month', { month: input.month })
            .andWhere('m.year = :year', { year: input.year })
            .getMany();

        let costShare = input.costSharePercent === 0 ? 1 : input.costSharePercent / 100;

        output.employees = input.employees.map(x => {
            return {
                userName: x.user.name,
                userId: x.user.id,
                cost: x.cost,
                seconds: 0,
                rate: 0,
            };
        });

        let stoppers = await AppDataSource.getRepository(StopperEntity).createQueryBuilder('s')
            .leftJoinAndSelect('s.user', 'u')
            .leftJoinAndSelect('s.march', 'm')
            .leftJoinAndSelect('m.monthly', 'o')
            .leftJoinAndSelect('o.client', 'c')
            .where('o.year = :year', { year: input.year })
            .andWhere('o.month = :month', { month: input.month })
            .getMany();

        stoppers.forEach(stopper => {
            let employee = output.employees.find(x => x.userId === stopper.user.id);
            if (employee) {
                employee.seconds += stopper.seconds;
            }
        });

        output.employees.forEach(employee => {
            employee.rate = employee.cost / employee.seconds;
        });

        let monthlies = await AppDataSource.getRepository(MonthlyEntity).createQueryBuilder('m')
            .leftJoinAndSelect('m.client', 'c')
            .where('m.year = :year', { year: input.year })
            .andWhere('m.month = :month', { month: input.month })
            .getMany();

        output.clients = monthlies.map(x => {
            return {
                client: x.client.name,
                cost: 0,
                seconds: 0,
                invoice: 0,
                share: 0,
                records: [] as { user: string; march: string; cost: number; seconds: number }[]
            };
        });

        //sum invoices per client
        invoices.forEach(invoice => {
            let sum = invoice.lines.reduce((sum, line) => {
                return sum + (line.qtty * line.price);
            }, 0);

            let oline = output.clients.find(x => x.client === invoice.monthly.client.name);
            if (oline) {
                oline.invoice += sum;
            }
        });

        //aggregate stoppers per client
        stoppers.forEach(stopper => {
            let client = output.clients.find(x => x.client === stopper.march.monthly.client.name);
            let user = output.employees.find(x => x.userId === stopper.user.id);

            if (client && user) {
                client.cost += stopper.seconds * user.rate;
                client.seconds += stopper.seconds;

                client.records.push({
                    user: stopper.user.name,
                    march: stopper.march.name,
                    cost: stopper.seconds * user.rate,
                    seconds: stopper.seconds
                });
            }
        });

        //calculate share per client
        output.clients.forEach(client => {
            if (client.invoice !== 0) {
                client.share = ((client.cost + (costShare * client.invoice)) / client.invoice) * 100;
            } else {
                client.share = 0;
            }
        });

        return output;
    },

    async generateSummaryReportOutput(input: any): Promise<ISummaryReportOutput> {
        let invoices = await AppDataSource.getRepository(InvoiceEntity).createQueryBuilder('i')
            .leftJoinAndSelect('i.lines', 'l')
            .leftJoinAndSelect('i.monthly', 'm')
            .leftJoinAndSelect('m.client', 'c')
            .where('m.month = :month', { month: input.month })
            .andWhere('m.year = :year', { year: input.year })
            .getMany();

        let output = invoices.reduce((acc, inv) => {
            let forma = inv.monthly.info.forma;
            inv.lines.forEach(line => {

                if (!acc.sumInvoice[line.category]) {
                    acc.sumInvoice[line.category] = {};
                }
                if (!acc.sumInvoice[line.category][forma]) {
                    acc.sumInvoice[line.category][forma] = { sum: 0 };
                }
                acc.sumInvoice[line.category][forma].sum += (line.price * line.qtty);
            });
            return acc;
        }, { sumInvoice: {} } as ISummaryReportOutput);

        return output;
    },

    async generateEmployeesReportOutput(input: any): Promise<IEmployeesReportOutput> {

        let data = await AppDataSource.getRepository(StopperEntity).createQueryBuilder('s')
            .leftJoinAndSelect('s.user', 'u')
            .leftJoinAndSelect('s.march', 'm')
            .leftJoinAndSelect('m.monthly', 'o')
            .leftJoinAndSelect('o.client', 'c')
            .where('o.month = :month', { month: input.month })
            .andWhere('o.year = :year', { year: input.year })
            .getMany();

        let monthlyEntities = await AppDataSource.getRepository(MonthlyEntity).createQueryBuilder('m')
            .leftJoinAndSelect('m.marches', 'a')
            .leftJoinAndSelect('m.invoices', 'i')
            .leftJoinAndSelect('i.lines', 'l')
            .where('m.month = :month', { month: input.month })
            .andWhere('m.year = :year', { year: input.year })
            .getMany();

        let monthlies = monthlyEntities.map((val) => {
            let weigthSum = val.marches.reduce((acc, val) => acc + val.weight, 0);
            let invSum = val.invoices.reduce((acc, val) => acc + val.lines.reduce(
                (acc, val) => acc + val.price, 0), 0);

            return {
                monthlyId: val.id,
                weigthSum: weigthSum,
                invSum: invSum
            }
        });

        let marches = data.reduce((acc, stopper) => {
            let march = acc.find(m => m.marchId === stopper.march.id);
            if (!march) {
                acc.push({
                    marchId: stopper.march.id,
                    sumTime: stopper.seconds
                });
            } else {
                march.sumTime += stopper.seconds;
            }
            return acc;
        }, [] as { marchId: number, sumTime: number }[]);

        let output = data.reduce((acc, stopper) => {
            if (!acc[stopper.user.name]) {
                acc[stopper.user.name] = { sumValue: 0, entries: [] };
            }
            let monthly = monthlies.find(m => m.monthlyId == stopper.march.monthly.id);
            let weightSum = monthly.weigthSum;
            let marchValue = (stopper.march.weight / weightSum) * monthly.invSum;
            let stopperTimeSum = marches.find(m => m.marchId == stopper.march.id).sumTime;
            let stopperValue = (stopper.seconds / stopperTimeSum) * marchValue;

            acc[stopper.user.name].sumValue += stopperValue;

            let entry = acc[stopper.user.name].entries
                .find(e => e.client == stopper.march.monthly.client.name && e.stepName == stopper.march.name);

            if (entry) {
                entry.time += stopper.seconds;
                entry.value += stopperValue;
            } else {
                acc[stopper.user.name].entries.push({
                    client: stopper.march.monthly.client.name,
                    stepName: stopper.march.name,
                    time: stopper.seconds,
                    value: stopperValue
                });
            }

            return acc;
        }, {} as IEmployeesReportOutput);

        return output;
    },

    async generateBudgetReportOutput(input: IBudgetReportInput): Promise<IBudgetReportOutput> {
        let marches = await AppDataSource.getRepository(MarchEntity).createQueryBuilder('m')
            .leftJoinAndSelect('m.monthly', 'o')
            .leftJoinAndSelect('o.invoices', 'i')
            .leftJoinAndSelect('i.lines', 'l')
            .leftJoinAndSelect('m.stoppers', 's')
            .leftJoinAndSelect('o.client', 'c')
            .where('o.month = :month', { month: input.month })
            .andWhere('o.year = :year', { year: input.year })
            .getMany();

        let invoices = await AppDataSource.getRepository(InvoiceEntity).createQueryBuilder('i')
            .leftJoinAndSelect('i.lines', 'l')
            .leftJoinAndSelect('i.monthly', 'm')
            .leftJoinAndSelect('m.client', 'c')
            .where('m.month = :month', { month: input.month })
            .andWhere('m.year = :year', { year: input.year })
            .getMany();

        let output: IBudgetReportOutput = {
            income: [],
            profit: 0,
            sumIncome: 0,
            categoryCost: [],
            profitShare: 0,
            divisionIncome: []
        };

        invoices.forEach(inv => {
            inv.lines.forEach(line => {
                if (!output.income.find(i => i.category == line.category)) {
                    output.income.push({
                        category: line.category,
                        value: 0,
                    });
                }
                output.income.find(i => i.category == line.category).value += line.price * line.qtty;
                output.sumIncome += line.price * line.qtty;

                if (!output.divisionIncome.find(i => i.division == inv.monthly.info.firma)) {
                    output.divisionIncome.push({
                        division: inv.monthly.info.firma,
                        value: 0
                    });
                }

                output.divisionIncome.find(i => i.division == inv.monthly.info.firma)
                    .value += line.price * line.qtty;
            });
        });
        output.profit = output.sumIncome;

        input.cost.forEach(cost => {
            if (!output.categoryCost.find(c => c.category == cost.category)) {
                output.categoryCost.push({
                    category: cost.category,
                    sum: 0
                });
            }
            output.categoryCost.find(c => c.category == cost.category).sum += Number(cost.value);
        });

        output.categoryCost.forEach(cat => {
            cat.share = cat.sum / output.sumIncome;
            output.profit -= cat.sum;
        });

        output.profitShare = output.profit / output.sumIncome;

        return output;
    }
}