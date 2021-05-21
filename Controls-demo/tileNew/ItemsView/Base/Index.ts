// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as template from 'wml!Controls-demo/tileNew/ItemsView/Base/Index';
import {Model} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {BrandsImages} from 'Controls-demo/DemoData';

interface IRawData {
    id: number;
    title: string;
    img: string;
}

export default class Index extends Control<IControlOptions> {

    protected _template: TemplateFunction = template;

    /**
     * RecordSet данные которого отображает список
     */
    protected _items: RecordSet;

    protected _beforeMount(): void {
        this._items = new RecordSet({
            keyProperty: 'id',
            rawData: [
                {
                    id: 1,
                    title: 'Asus',
                    img: BrandsImages.asus
                },
                {
                    id: 2,
                    title: 'Samsung',
                    img: BrandsImages.samsung
                },
                {
                    id: 3,
                    title: 'Meizu',
                    img: BrandsImages.meizu
                }
            ]
        });
    }

    static _styles: string[] = [
        'Controls-demo/Controls-demo'
    ];
}
