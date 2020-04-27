import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import {Record} from 'Types/entity';
import * as template from 'wml!Controls-demo/StateIndicator/StandartStateIndicatorDemo';
import * as popupTemplate from 'wml!Controls-demo/StateIndicator/template/template';

import {Infobox} from 'Controls/popup';

interface IStandartStateIndicatorDemoData {
    value: number;
    className: string;
    title: string;
}

interface IStandartStateIndicatorDemoChildren extends Record {
    IBOpener?: Infobox;
}

export default class StandartStateIndicatorDemo extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _states: null;
    protected _scales: number[];
    protected _datas: IStandartStateIndicatorDemoData[][];

    protected _children: IStandartStateIndicatorDemoChildren;

    constructor(cfg: any) {
        super(cfg);
        this._scales = [
            10,
            10,
            10,
            10,
            10,
            10,
            10,
            5,
            5,
            5,
            5,
            6,
            7.6,
        ];
        this._datas = [
            [{value: 0, className: '', title: 'Положительно'}],
            [{value: 3, className: '', title: 'Положительно'}],
            [{value: 53, className: '', title: 'Положительно'}],
            [{value: 100, className: '', title: 'Положительно'}],
            [
                {value: 0, className: '', title: 'Положительно'},
                {value: 30, className: '', title: 'В работе'}
            ],
            [
                {value: 20, className: '', title: 'Положительно'},
                {value: 80, className: '', title: 'В работе'}
            ],
            [
                {value: 40, className: '', title: 'Положительно'},
                {value: 12, className: '', title: 'В работе'}
            ],
            [
                {value: 35, className: '', title: 'Положительно'},
                {value: 40, className: '', title: 'В работе'}
            ],
            [
                {value: 30, className: '', title: 'Положительно'},
                {value: 70, className: '', title: 'В работе'}
            ],
            [
                {value: 10, className: '', title: 'Положительно'},
                {value: 30, className: '', title: 'В работе'},
                {value: 50, className: '', title: 'Отрицательно'}
            ],
            [
                {value: 25, className: '', title: 'Положительно'},
                {value: 25, className: '', title: 'В работе'},
                {value: 25, className: '', title: 'Отрицательно'}
            ],
            [
                {value: 33, className: '', title: 'Положительно'},
                {value: 33, className: '', title: 'В работе'},
                {value: 33, className: '', title: 'Отрицательно'},
                {value: 1, className: 'controls-StateIndicator__emptySector', title: 'Не обработано'}
            ],
            [
                {value: 20, className: '', title: 'Положительно'},
                {value: 30, className: '', title: 'В работе'},
                {value: 3, className: '', title: 'Отрицательно'},
                {value: 47, className: 'controls-StateIndicator__emptySector', title: 'Не обработано'}
            ]
        ];
    }

   protected _mouseEnterHandler(e?: any, _item?: HTMLElement): void {
      const config = {
         target: _item,
         targetSide: 'top',
         alignment: 'start',
         showDelay: 1000,
         template: popupTemplate,
         templateOptions: {data: this._datas[_item.parentElement.parentElement.getAttribute('index')]}
      };
      this._children.IBOpener.open(config);
   }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/StateIndicator/StandartStateIndicatorDemo'];
}
