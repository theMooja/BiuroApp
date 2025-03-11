import { inject } from "@angular/core";
import { IReport, IReportHeader } from "../../../../../electron/src/interfaces";
import { ReportsService } from "../../service/reports.service";

export abstract class ReportComponent<TInput, TOutput> {
    abstract onSave(): void;
    abstract getInput(): TInput;

    header: IReportHeader;
    input: TInput;
    output: TOutput;
    report: IReport;

    reportService = inject(ReportsService);

    init() {
        this.input = this.isEmptyObject(this.report.input) ? {} : JSON.parse(this.report.input);
        this.output = this.isEmptyObject(this.report.output) ? {} : JSON.parse(this.report.output);
    }

    isEmptyObject(obj: unknown): boolean {
        return !!obj && Object.keys(obj).length === 0;
    }

    async onOpen(header: IReportHeader) {
        this.header = header;
        this.report = await this.reportService.getReport(header);
        this.init();
    }

    async onGenerate() {
        let input = this.getInput();
        this.report = await this.reportService.generateReport(this.header, input);
        this.init();
    }
}