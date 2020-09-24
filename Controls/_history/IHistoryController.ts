import {IControlOptions} from 'UI/Base';
import {IFilterOptions} from 'Controls/interface';
import {RecordSet} from 'Types/collection';
export type TKey = string|number|null;
import {Model} from 'Types/entity';
import {Source} from 'Controls/history';

export default interface IHistoryController {
    updateOptions(newOptions: IHistoryControllerOptions): void;
    setHistory(history?: RecordSet): void;
    getPreparedSource(): Source;
    getPreparedFilter(): object;
    getPreparedItem(item: Model): Model;
    getPreparedItems(items?: RecordSet, history?: RecordSet): RecordSet;
    updateHistory(items: RecordSet): void;
    hasHistory(options: IHistoryControllerOptions): boolean|string;
    getItemsWithHistory(): RecordSet;
}

export interface IHistoryControllerOptions extends IControlOptions, IFilterOptions {
    source: Source;
    historyId?: string;
    historyNew?: string;
}
