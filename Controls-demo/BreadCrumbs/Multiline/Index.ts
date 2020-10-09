import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
// @ts-ignore
import Template = require('wml!Controls-demo/BreadCrumbs/Multiline/MultilinePath');
import {Model} from 'Types/entity';
import {SyntheticEvent} from 'Vdom/Vdom';
import {UnregisterUtil, RegisterUtil} from 'Controls/event';

class Multiline extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _items: object;
    protected _items2: object;
    protected _item: object;
    protected _info: string = '';
    protected _containerWidth: number = 500;
    protected _containerWidth2: number = 350;

    protected _beforeMount(): void {
        this._items  = [
            {
                id: 1,
                title: 'Продвижение СБИС',
                secondTitle: 'тест1',
                parent: null
            },
            {
                id: 2,
                title: 'Филиальная сеть',
                secondTitle: 'тест2',
                parent: 1
            },
            {
                id: 3,
                title: '3-й дивизион',
                secondTitle: 'тест3',
                parent: 2
            },
            {
                id: 4,
                title: '6504 Южно-Сахалинск',
                secondTitle: 'тест4',
                parent: 3
            },
            {
                id: 5,
                title: 'Работники',
                secondTitle: 'тест5',
                parent: 4
            },
            {
                id: 6,
                title: 'Менеджеры',
                secondTitle: 'тест6',
                parent: 5
            },
            {
                id: 7,
                title: 'Разработка',
                secondTitle: 'тест5',
                parent: 4
            },
            {
                id: 8,
                title: 'Тестирование',
                secondTitle: 'тест6',
                parent: 5
            },
            {
                id: 9,
                title: 'Работники',
                secondTitle: 'тест5',
                parent: 4
            },
            {
                id: 10,
                title: 'Менеджеры',
                secondTitle: 'тест6',
                parent: 5
            },
            {
                id: 11,
                title: 'Разработка',
                secondTitle: 'тест5',
                parent: 4
            },
            {
                id: 12,
                title: 'Тестирование',
                secondTitle: 'тест6',
                parent: 5
            }
        ].map((item) => {
            return new Model({
                rawData: item,
                keyProperty: 'id'
            });
        });
        this._items2  = [
            {
                id: 1,
                title: 'Очень длинное название первой папки Очень длинное название первой папки Очень длинное название первой папки',
                secondTitle: 'тест1',
                parent: null
            },
            {
                id: 2,
                title: 'Длинное название второй папки Длинное название второй папки Длинное название второй папки Длинное название второй папки',
                secondTitle: 'тест2',
                parent: 1
            }
        ].map((item) => {
            return new Model({
                rawData: item,
                keyProperty: 'id'
            });
        });
        this._item  = [
            {
                id: 1,
                title: 'Продвижение СБИС',
                secondTitle: 'тест1'
            }
        ].map((item) => {
            return new Model({
                rawData: item,
                keyProperty: 'id'
            });
        });
    }

    private _onItemClick(e: SyntheticEvent<MouseEvent>, item: Model): void {
        this._info = '' + item.getId();
    }
    protected _afterMount(): void {
        RegisterUtil(this, 'controlResize', this._onResize.bind(this));
    }
    protected _beforeUnmount(): void {
        UnregisterUtil(this, 'controlResize');
    }

    private _onResize(): void {
        if (this._container.clientWidth !== this._containerWidth) {
            this._containerWidth = this._container.clientWidth;
        }
    }

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Multiline;
