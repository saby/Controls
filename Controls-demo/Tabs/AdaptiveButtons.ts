import {Control, TemplateFunction} from 'UI/Base';
import {RecordSet} from 'Types/collection';
import template = require('wml!Controls-demo/Tabs/AdaptiveButtons/AdaptiveButtons');
import {IAdaptiveTabsOptions} from "../../Controls/_tabs/interface/IAdaptiveTabs";
import {UnregisterUtil, RegisterUtil} from 'Controls/event';

export default class TabButtonsDemo extends Control {
    protected _template: TemplateFunction = template;
    protected SelectedKey1: string = '1';
    protected _items: RecordSet | null = null;
    protected _items2: RecordSet | null = null;
    protected _containerWidth: number = 200;
    protected _beforeMount(): void {
        this._items = new RecordSet({
            keyProperty: 'id',
            rawData: [
                {
                    id: '1',
                    title: '1Fffffffffs'
                },
                {
                    id: '2',
                    title: '22Fiffffffffffffffffffffles'
                },
                {
                    id: '3',
                    title: 'Filfffffffffffffffffffffffes'
                },
                {
                    id: '4',
                    title: 'Filffffffffffffffffffffes'
                },
                {
                    id: '5',
                    title: 'Files'
                },
                {
                    id: '6',
                    title: 'Fiffffffffffffffles'
                },
                {
                    id: '7',
                    title: 'Files'
                },
                {
                    id: '8',
                    title: 'Fi4444les'
                },
                {
                    id: '9',
                    title: 'Fi4444les  44444'
                },
                {
                    id: '10',
                    title: 'Fi222les'
                },
                {
                    id: '11',
                    title: 'Files'
                },
                {
                    id: '12',
                    title: 'Fi4444444444les'
                },
                {
                    id: '13',
                    title: 'F 44444444iles'
                }
            ]
        });
        this._items2 = new RecordSet({
            keyProperty: 'id',
            rawData: [
                {
                    id: '1',
                    title: '1Fffffffffs',
                    align: 'left'
                },
                {
                    id: '2',
                    title: '22Fiffffffffffffffffffffles',
                    align: 'left'
                },
                {
                    id: '3',
                    title: 'Filfffffffffffffffffffffffes',
                    align: 'left'
                },
                {
                    id: '4',
                    title: 'Filffffffffffffffffffffes',
                    align: 'left'
                },
                {
                    id: '5',
                    title: 'Files',
                    align: 'left'
                },
                {
                    id: '6',
                    title: 'Fiffffffffffffffles',
                    align: 'left'
                },
                {
                    id: '7',
                    title: 'Files',
                    align: 'left'
                },
                {
                    id: '8',
                    title: 'Fi4444les',
                    align: 'left'
                },
                {
                    id: '9',
                    title: 'Fi4444les  44444',
                    align: 'left'
                },
                {
                    id: '10',
                    title: 'Fi222les',
                    align: 'left'
                },
                {
                    id: '11',
                    title: 'Files',
                    align: 'left'
                },
                {
                    id: '12',
                    title: 'Fi4444444444les',
                    align: 'left'
                },
                {
                    id: '13',
                    title: 'F 44444444iles',
                    align: 'left'
                }
            ]
        });
    }

    protected _afterMount(options?: IAdaptiveTabsOptions, contexts?: any): void {
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
