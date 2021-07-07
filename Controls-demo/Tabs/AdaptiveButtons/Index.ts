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
                    caption: '1Fffffffffs'
                },
                {
                    id: '2',
                    caption: '22Fiffffffffffffffffffffles'
                },
                {
                    id: '3',
                    caption: 'Filfffffffffffffffffffffffes'
                },
                {
                    id: '4',
                    caption: 'Filffffffffffffffffffffes'
                },
                {
                    id: '5',
                    caption: 'Files'
                },
                {
                    id: '6',
                    caption: 'Fiffffffffffffffles'
                },
                {
                    id: '7',
                    caption: 'Files'
                },
                {
                    id: '8',
                    caption: 'Fi4444les'
                },
                {
                    id: '9',
                    caption: 'Fi4444les  44444'
                },
                {
                    id: '10',
                    caption: 'Fi222les'
                },
                {
                    id: '11',
                    caption: 'Files'
                },
                {
                    id: '12',
                    caption: 'Fi4444444444les'
                },
                {
                    id: '13',
                    caption: 'F 44444444iles'
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