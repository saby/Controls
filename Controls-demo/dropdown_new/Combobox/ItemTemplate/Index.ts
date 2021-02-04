import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as controlTemplate from 'wml!Controls-demo/dropdown_new/Combobox/ItemTemplate/Index';
import {Memory} from 'Types/source';

export default class extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'key',
            data: [
                {key: 1, title: '01-disease', comment: 'The first 3 days are paid by the employer, the remaining days are paid for by the FSS'},
                {key: 2, title: '02-injury', comment: 'The first 3 days are paid by the employer, the remaining days are paid for by the FSS'},
                {key: 3, title: '03-quarantine', comment: 'Fully paid by the FSS'}
            ]
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/dropdown_new/Combobox/Index'];
}
