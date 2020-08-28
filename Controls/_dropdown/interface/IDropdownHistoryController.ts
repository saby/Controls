import {IControlOptions} from 'UI/Base';
import {ISourceOptions, IFilterOptions} from 'Controls/interface';
import {RecordSet} from 'Types/collection';
export type TKey = string|number|null;
import {Model} from 'Types/entity';
import {ICrudPlus} from 'Types/source';

export default interface IDropdownHistoryController {
    update(newOptions: IDropdownHistoryControllerOptions): void;
    setHistory(history?: RecordSet): void;
    getPreparedSource(): ICrudPlus;
    getPreparedFilter(): object;
    getPreparedItem(item: Model): Model;
    getPreparedItems(items?: RecordSet, history?: RecordSet): RecordSet;
    updateHistory(items: RecordSet): void;
    hasHistory(options: IDropdownHistoryControllerOptions): boolean;
    getItemsWithHistory(): RecordSet;
}

export interface IDropdownHistoryControllerOptions extends IControlOptions, IFilterOptions, ISourceOptions {
    historyId?: string;
    historyNew?: string;
}
