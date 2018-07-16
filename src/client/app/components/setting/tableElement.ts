import { FormGroup } from "@angular/forms";
import { TableDataSource } from "./tableDataSource";

export class TableElement<T> {
    id: number;
    editing: boolean;
    currentData?: T;
    originalData: T;
    source: TableDataSource<T>;
    validator: FormGroup;

    delete(): void { }
    confirmEditCreate(): boolean { return true; }
    startEdit(): void { }
    cancelOrDelete(): void { }
}