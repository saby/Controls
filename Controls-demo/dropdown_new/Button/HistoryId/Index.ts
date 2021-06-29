import {Control, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/dropdown_new/Button/HistoryId/Index');
import {Memory} from 'Types/source';
import {getItems, overrideOrigSourceMethod, resetHistory} from './Utils';

class HeaderContentTemplate extends Control {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'key',
            data: getItems()
        });
    }

    protected _afterMount(): void {
        overrideOrigSourceMethod();
    }

    protected _beforeUnmount(): void {
        resetHistory();
    }
    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/dropdown_new/Button/Index'];
}
export default HeaderContentTemplate;
