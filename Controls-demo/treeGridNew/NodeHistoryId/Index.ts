import {Control, TemplateFunction} from 'UI/Base';
import {USER} from 'ParametersWebAPI/Scope';
import {HierarchicalMemory} from 'Types/source';

import { Gadgets } from '../DemoHelpers/DataCatalog';

import * as Template from 'wml!Controls-demo/treeGridNew/NodeHistoryId/NodeHistoryId';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _columns: unknown[] = Gadgets.getGridColumnsForFlat();

    protected _beforeMount(): void {
        // Демка может работать только с хранилищем в сессии.
        // В этом случае получить на SSR идентификаторы раскрытых груп невозможно.
        // Поэтому, тут такая логика: Если группы будут раскрыты при загрузке демки, то
        // функционал работает....
        USER.set('NODE_HISTORY', JSON.stringify([1, 2]));

        this._viewSource = new HierarchicalMemory({
            parentProperty: 'parent',
            keyProperty: 'id',
            data: Gadgets.getFlatData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
