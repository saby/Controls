import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import Template = require('wml!Controls-demo/BreadCrumbs/newIcon/Template');
import {Model} from 'Types/entity';

class BreadCrumbs extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected items = null;

    protected _beforeMount(): void {
        this.items = [
            {
                id: 1,
                title: 'breadcrumbs',
                secondTitle: 'тест1',
                parent: null
            },
            {
                id: 2,
                title: 'breadcrumbs',
                secondTitle: 'тест2',
                parent: 1
            },
            {
                id: 3,
                title: 'breadcrumbs 3',
                secondTitle: 'тест3',
                parent: 2
            },
            {
                id: 4,
                title: 'breadcrumbs',
                secondTitle: 'тест4',
                parent: 3
            },
            {
                id: 5,
                title: 'breadcrumbs',
                secondTitle: 'тест5',
                parent: 4
            },
            {
                id: 6,
                title: 'breadcrumbs',
                secondTitle: 'тест6',
                parent: 5
            }
        ].map(function (item) {
            return new Model({
                rawData: item,
                keyProperty: 'id'
            });
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/BreadCrumbs/BreadCrumbs/BreadCrumbs'];
}

export default BreadCrumbs;
