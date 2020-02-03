import { IColumnsManager } from 'Controls/_list/interface/IColumnsManager';
import { SmartColumnsManager } from 'Controls/_list/Controllers/SmartColumnsManager';
import { FixedColumnsManager } from 'Controls/_list/Controllers/FixedColumnsManager';
import { Control, IControlOptions } from 'UI/Base';
import {ColumnsCollection} from 'Controls/display';

interface IColumnsControllerOptions extends IControlOptions {
    columnsMode: 'auto' | 'fixed';
}
export default class ColumnsController extends Control {
    private columnsManager: IColumnsManager;
    constructor(cfg: IColumnsControllerOptions) {
        super(cfg);
        this.setColumnsMode(cfg.columnsMode);
    }
    setColumnsMode(columnsMode: 'auto' | 'fixed'): void {
        if (columnsMode === 'fixed') {
            this.columnsManager = new FixedColumnsManager();
        } else {
            this.columnsManager = new SmartColumnsManager();
        }
    }
    getColumn(collection: ColumnsCollection<unknown>, index: number, columnsCount?: number): number {
        return this.columnsManager.getColumn(collection, index, columnsCount);
    }
}
