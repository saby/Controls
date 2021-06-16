import {IControlOptions, TemplateFunction} from 'UI/Base';
import {IToolBarItem} from 'Controls/toolbars';
import {Memory} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {TKey} from 'Controls/interface';

export interface IActionOptions {
    providerName: string;
    providerOptions: Record<string, any>;
    [key: string]: any;
}

export interface IOperationsPanelItem extends IToolBarItem {
    actionName?: string;
    actionOptions: IActionOptions;
}

export interface IOperationsPanelOptions extends IControlOptions {
    source?: Memory;
    items?: RecordSet | IOperationsPanelItem[];
    keyProperty: string;
    selectedKeys: TKey[];
    excludedKeys: TKey[];
    itemTemplate?: TemplateFunction;
    operationsPanelOpenedCallback: () => void;
    itemTemplateProperty?: string;
    parentProperty?: string;
    fontColorStyle?: string;
}
