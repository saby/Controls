import {Control, TemplateFunction} from "UI/Base";
import {Memory} from 'Types/source';
import * as template from 'wml!Controls-demo/Lookup/MultipleInputNew/EmployeeSelector';

export default class extends Control {
    protected _template: TemplateFunction = template;
    protected _source: Memory = null;

    protected _beforeMount(): void {
        this._source = new Memory({
            data: [
                {
                    id: 0,
                    title: 'Герасимов Александр'
                },
                {
                    id: 1,
                    title: 'Михайлов Сергей'
                },
                {
                    id: 2,
                    title: 'Человек с очень сложным именем Uvuvwevwevwe Onyetenvewve Ugwenmubwem Osas'
                }
            ],
            keyProperty: 'id'
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
