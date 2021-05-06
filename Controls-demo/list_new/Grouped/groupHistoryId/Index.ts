import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/Grouped/groupHistoryId/groupHistoryId';
import {Memory} from 'Types/source';
import {getGroupedCatalog as getData} from '../../DemoHelpers/DataCatalog';

// Патч нужен, чтобы демка не выдавала ошибки
import '../../../Utils/WebApiScopePatch';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;

    protected _beforeMount(options?: IControlOptions, contexts?: object, receivedState?: boolean) {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
