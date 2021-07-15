import {TKey} from 'Controls/interface';
import {TemplateFunction} from 'UI/Base';
import {RecordSet} from 'Types/collection';
import {ICrudPlus, QueryWhereExpression} from 'Types/source';
import {NewSourceController as SourceController} from 'Controls/dataSource';
import {TColumns} from 'Controls/grid';

export interface IExplorerOptions {
    root?: TKey;
    source?: ICrudPlus;
    searchValue?: string;
    keyProperty?: string;
    nodeProperty?: string;
    parentProperty?: string;
    displayProperty?: string;
    hasChildrenProperty?: string;
    filter?: QueryWhereExpression<unknown>;
    itemTemplate?: TemplateFunction | string;
    tileItemTemplate?: TemplateFunction | string;
    dataLoadCallback?: (items: RecordSet, direction: string) => void;
    sourceController?: SourceController;
    columns?: TColumns;
    imageProperty?: string;

    style?: string;
    viewMode?: string;
    backgroundStyle?: string;

    markerVisibility?: string;
    expanderVisibility?: string;
    markItemByExpanderClick?: boolean;
}
