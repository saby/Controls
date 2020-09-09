import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/addButton/Template');
import {Memory} from 'Types/source';

class DemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;

    static _theme: string[] = ['Controls/Classes'];

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'key',
            data: [
                { key: 1, title: 'Сообщение', icon: 'icon-EmptyMessage' },
                { key: 2, title: 'Папка' },
                { key: 3, title: 'Тег' }
            ]
        });
    }

    protected _itemClickHandler(e, item): void {
        console.log(e, item);
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default DemoControl;
