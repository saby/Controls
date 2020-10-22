import {Control, TemplateFunction} from "UI/Base";
import controlTemplate = require('wml!Controls-demo/BreadCrumbs/InScrollContainer/InScrollContainer');
import {Model} from 'Types/entity';

export default class extends Control {
    protected _template: TemplateFunction = controlTemplate;
    protected _items: Model[];

    protected _beforeMount(): void {
        this._items = [
            { id: 1, title: 'Первая очень длинная хлебная крошка для тестов', parent: null },
            { id: 2, title: 'Вторая очень длинная хлебная крошка для тестов', parent: 1 },
            { id: 3, title: 'Третья очень длинная хлебная крошка для тестов', parent: 2 }
        ].map((item) => {
            return new Model({
                rawData: item,
                keyProperty: 'id'
            });
        });
    }
    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
