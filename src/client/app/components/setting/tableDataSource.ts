import { TableElement } from "./tableElement";
import { Subject } from "rxjs";
import { ValidatorService } from "../../services/validatorService";

export class TableDataSource<T> {
    datasourceSubject: Subject<T[]>;
    constructor(
        data: T[], dataType?: new () => T, validatorService?: ValidatorService, config = { prependNewElements: false }) { }

    updateDatasource(data: T[], options = { emitEvent: true }): void { }

    createNew(): void { }

    getRow(id: number): TableElement<T> {return new TableElement<T>(); }
}
