import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/BreadCrumbs/FontSize/Template');
import {Model} from "Types/entity";
import PrepareDataUtil from 'Controls/_breadcrumbs/PrepareDataUtil';

class DemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;

    protected _items: Model[];
    protected  _visibleItems:any[];

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
        this._visibleItems = PrepareDataUtil.drawBreadCrumbsItems(this._items);
    }

    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default DemoControl;
