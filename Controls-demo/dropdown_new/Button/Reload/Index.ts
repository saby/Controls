import {Control, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/dropdown_new/Button/Reload/Index');
import {Memory} from 'Types/source';

class HeaderContentTemplate extends Control {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;
    protected _newSource: Memory;

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'key',
            data: [
                {key: 1, title: 'Ярославль'},
                {key: 2, title: 'Москва'},
                {key: 3, title: 'Санкт-Петербург'}
            ]
        });

        this._newSource = new Memory({
            keyProperty: 'key',
            data: [
                {key: 1, title: 'Владивосток'},
                {key: 2, title: 'Кострома'},
                {key: 3, title: 'Екатеринбург'}
            ]
        });
    }

    protected reloadItems() {
        this._children.DropdownBtn.reload({source: this._newSource});
    }

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/dropdown_new/Button/Index'];
}
export default HeaderContentTemplate;
