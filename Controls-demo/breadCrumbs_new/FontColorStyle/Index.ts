import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/breadCrumbs_new/FontColorStyle/FontColorStyle');
import {Model} from "Types/entity";

class FontColorStyle extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;

    private _items: Model[];

    protected _beforeMount(): void {
        this._items = [
            { id: 1, title: 'Первая папка', parent: null },
            { id: 2, title: 'Вторая папка', parent: 1 },
            { id: 3, title: 'Третья папка', parent: 2 }
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

export default FontColorStyle;
