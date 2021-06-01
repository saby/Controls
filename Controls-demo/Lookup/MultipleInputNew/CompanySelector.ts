import {Control, TemplateFunction} from "UI/Base";
import {Memory} from 'Types/source';
import * as template from 'wml!Controls-demo/Lookup/MultipleInputNew/CompanySelector';

export default class extends Control {
    protected _template: TemplateFunction = template;
    protected _source: Memory = null;

    protected _beforeMount(): void {
        this._source = new Memory({
            data: [
                {
                    id: 0,
                    title: 'Тензор'
                },
                {
                    id: 1,
                    title: 'Газпром'
                },
                {
                    id: 2,
                    title: 'Длинное название компании, ну очень длинное'
                }
            ],
            keyProperty: 'id'
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
