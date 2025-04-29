import axios from "axios";
import { parse, addWeeks, format } from 'date-fns';
import { AppDataSource } from "../datasource";
import { InvoiceEntity } from "../entity/Invoice";
import { InvoiceLineEntity } from "../entity/InvoiceLine";
import { ListValueEntity } from "../entity/ListValue";
import { MonthlyEntity } from "../entity/Monthly";
import { IInvoiceEntity } from "../interfaces";

export const InvoiceController = {
  async saveInvoice(data: IInvoiceEntity): Promise<IInvoiceEntity> {
    let invoiceRepo = AppDataSource.getRepository(InvoiceEntity);
    const lineRepo = AppDataSource.getRepository(InvoiceLineEntity);
    const monthlyRepo = AppDataSource.getRepository(MonthlyEntity);

    let invoice: InvoiceEntity;

    if (data.id) {
      invoice = await invoiceRepo.findOne({
        where: { id: data.id },
        relations: ['lines'],
      });

      invoice.sendDate = data.sendDate;
      invoice.paidDate = data.paidDate;
      invoice.no = data.no;
    }

    if (!invoice) {
      invoice = new InvoiceEntity();
      invoice.no = data.no;
      invoice.monthly = await monthlyRepo.findOneBy({ id: data.monthly.id });
      invoice.paidDate = data.paidDate;
      invoice.sendDate = data.sendDate;
    }

    //remove
    const inputLineIds = data.lines.map((line) => line.id);
    const linesToRemove = invoice.lines?.filter(
      (line) => !inputLineIds.includes(line.id)
    );

    if (linesToRemove?.length) {
      await lineRepo.remove(linesToRemove);
    }

    //add and update
    const updatedLines = data.lines.map((line) => {

      if (line.id) {
        const existingLine = invoice.lines.find((l) => l.id === line.id);
        if (existingLine) {
          existingLine.description = line.description;
          existingLine.price = line.price;
          existingLine.qtty = line.qtty;
          existingLine.category = line.category;
          existingLine.vat = line.vat;
          return existingLine;
        }
      }

      const newLine = new InvoiceLineEntity();
      newLine.description = line.description;
      newLine.price = line.price;
      newLine.qtty = line.qtty;
      newLine.category = line.category;
      newLine.vat = line.vat;
      return newLine;
    });

    invoice.lines = updatedLines;
    return (await invoiceRepo.save(invoice)) as unknown as IInvoiceEntity;
  },

  saveInvoiceDates(invoices: IInvoiceEntity[]) {
    const repo = AppDataSource.getRepository(InvoiceEntity);

    invoices.forEach(async (invoice) => {
      const entity = await repo.findOneBy({ id: invoice?.id });
      if (!entity) return;

      entity.sendDate = invoice.sendDate;
      entity.paidDate = invoice.paidDate;
      await entity.save();
    });
  },

  async getInvoices(clientId: number, year: number, month: number): Promise<IInvoiceEntity[]> {
    return await AppDataSource.getRepository(InvoiceEntity)
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.lines', 'l')
      .leftJoinAndSelect('i.monthly', 'm')
      .where('m.client = :clientId', { clientId })
      .andWhere('m.year = :year', { year })
      .andWhere('m.month = :month', { month })
      .getMany();
  },

  async integrateInvoice(invoice: IInvoiceEntity): Promise<IInvoiceEntity> {
    let repo = AppDataSource.getRepository(InvoiceEntity);
    let invoiceEntity = await repo.createQueryBuilder('i')
      .leftJoinAndSelect('i.lines', 'l')
      .leftJoinAndSelect('i.monthly', 'm')
      .leftJoinAndSelect('m.client', 'c')
      .where('i.id = :id', { id: invoice.id })
      .getOne();

    if (invoiceEntity.monthly.info.firma.toLowerCase() == 'finka') {
      let apiKey = await AppDataSource.getRepository(ListValueEntity).findOneBy({
        target: 'finka-fakturownia'
      });

      const fakturowniaDomain = 'finka';
      const apiToken = apiKey.value;

      if (!invoiceEntity.sendDate) {
        invoiceEntity.sendDate = new Date();
      }

      const responseData = await this.sendInvoiceToFakturownia(invoiceEntity, fakturowniaDomain, apiToken);
      invoice.no = responseData.number;
      invoice.sendDate = this.toSafeDate(responseData.issue_date);

      return await this.saveInvoice(invoice);
    }

    return invoice;
  },

  toSafeDate(date: string) {
    const parsed = parse(date, 'yyyy-MM-dd', new Date());

    return new Date(Date.UTC(
      parsed.getFullYear(),
      parsed.getMonth(),
      parsed.getDate()
    ));
  },

  async sendInvoiceToFakturownia(invoiceEntity: InvoiceEntity, fakturowniaDomain: string, apiToken: string) {

    const positions = invoiceEntity.lines.reduce((acc, line) => {
      const existingPosition = acc.find((pos) => pos.name === line.category);
      if (existingPosition) {
        existingPosition.total_price_gross += line.price * line.qtty;
      } else {
        acc.push({
          name: line.category,
          tax: 'disabled',
          total_price_gross: line.price * line.qtty,
          quantity: 1
        });
      }
      return acc;
    }, [] as any[]);

    const invoiceData = {
      api_token: apiToken,
      invoice: {
        kind: "vat",
        number: null as string | null,
        sell_date: format(invoiceEntity.sendDate, 'yyyy-MM-dd'),
        issue_date: format(invoiceEntity.sendDate, 'yyyy-MM-dd'),
        payment_to: format(addWeeks(invoiceEntity.sendDate, 1), 'yyyy-MM-dd'),
        client_id: invoiceEntity.monthly.client.details.fakturowniaId,
        payment_type: 'transfer',
        positions: positions,
      }
    };

    try {
      const response = await axios.post(
        `https://${fakturowniaDomain}.fakturownia.pl/invoices.json`,
        invoiceData,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;

    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }
}