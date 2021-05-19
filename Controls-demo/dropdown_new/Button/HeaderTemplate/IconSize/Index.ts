import {Control, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/dropdown_new/Button/HeaderTemplate/IconSize/Index');
import {Memory} from 'Types/source';

class HeaderContentTemplate extends Control {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'key',
            data: [
                { key: '1',  icon: 'icon-EmptyMessage', iconStyle: 'info', title: 'Message', iconSize: 'm' },
                { key: '2', title: 'Report' },
                { key: '3', icon: 'icon-TFTask', iconSize: 'm', title: 'Task' },
                { key: '4', title: 'News'}
            ]
        });
    }
    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/dropdown_new/Button/Index'];
}
export default HeaderContentTemplate;
