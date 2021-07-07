import {Control, TemplateFunction} from 'UI/Base';
import {RecordSet} from 'Types/collection';
// @ts-ignore
import template = require('wml!Controls-demo/Tabs/AdaptiveButtons/Template');
import {UnregisterUtil, RegisterUtil} from 'Controls/event';

export default class TabButtonsDemo extends Control {
    protected _template: TemplateFunction = template;
    protected SelectedKey1: string = '6';
    protected SelectedKey2: string = '1';
    protected _items: RecordSet | null = null;
    protected _items2: RecordSet | null = null;
    protected _containerWidth: number = 500;
    protected _beforeMount(): void {
        this._items = new RecordSet({
            keyProperty: 'id',
            rawData: [
                {
                    id: '1',
                    title: 'Сводно'
                },
                {
                    id: '2',
                    title: 'Лучший продавец десертов'
                },
                {
                    id: '3',
                    title: 'Лучший менеджер'
                },
                {
                    id: '4',
                    title: 'Самый отзывчивый сотрудник'
                },
                {
                    id: '5',
                    title: 'Лучший по сложным продуктам'
                },
                {
                    id: '6',
                    title: 'Чемпион'
                },
                {
                    id: '7',
                    title: 'Лучший продавец'
                }
            ]
        });
        this._items2 = new RecordSet({
            keyProperty: 'id',
            rawData: [
                {
                    id: '1',
                    caption: 'Лучший по сложным продуктам'
                },
                {
                    id: '2',
                    caption: 'Лучший продавец'
                },
                {
                    id: '3',
                    caption: 'Самый отзывчивый сотрудник'
                },
                {
                    id: '4',
                    caption: 'Чемпион'
                },
                {
                    id: '5',
                    caption: 'Лучший продавец десертов'
                },
                {
                    id: '6',
                    caption: 'Лучший продавец десертов'
                },
                {
                    id: '7',
                    caption: 'Самый отзывчивый сотрудник'
                },
                {
                    id: '8',
                    caption: 'Чемпион'
                },
                {
                    id: '9',
                    caption: 'Чемпион'
                },
                {
                    id: '10',
                    caption: 'Лучший продавец десертов'
                },
                {
                    id: '11',
                    caption: 'Самый отзывчивый сотрудник'
                },
                {
                    id: '12',
                    caption: 'Лучший продавец десертов'
                },
                {
                    id: '13',
                    caption: 'Лучший продавец десертов'
                }
            ]
        });
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

    static _styles: string[] = ['Controls-demo/Tabs/Buttons/Buttons', 'Controls-demo/Controls-demo'];
}
