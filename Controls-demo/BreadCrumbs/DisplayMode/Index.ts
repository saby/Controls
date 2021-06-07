import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import Template = require('wml!Controls-demo/BreadCrumbs/DisplayMode/DisplayMode');
import {Model} from 'Types/entity';

class DisplayMode extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _items: object;
    protected _item: object;

    protected _beforeMount(): void {
        this._items  = [
            {
                id: 1,
                title: 'Настолько длинное название папки что оно не влезет в максимальный размер 1',
                secondTitle: 'тест1',
                parent: null
            },
            {
                id: 2,
                title: 'Notebooks 2',
                secondTitle: 'тест2',
                parent: 1
            },
            {
                id: 3,
                title: 'Smartphones 3',
                secondTitle: 'тест3',
                parent: 2
            },
            {
                id: 4,
                title: 'Record1',
                secondTitle: 'тест4',
                parent: 3
            },
            {
                id: 5,
                title: 'Record2',
                secondTitle: 'тест5',
                parent: 4
            },
            {
                id: 6,
                title: 'Очень длинное название кнопки назад очень длинное название',
                secondTitle: 'тест6',
                parent: 5
            }
        ].map((item) => {
            return new Model({
                rawData: item,
                keyProperty: 'id'
            });
        });
        this._item  = [
            {
                id: 6,
                title: 'Очень длинное название кнопки назад очень длинное название кнопки назад очень длинное название кнопки назад',
                secondTitle: 'тест6'
            }
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

export default DisplayMode;
