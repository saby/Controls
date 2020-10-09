import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls-demo/PropertyGridNew/Editors/Number/Demo';

export default class Demo extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _source: object[] = [
        {
            name: 'number',
            caption: 'Number',
            editorOptions: {
                inputConfig: {
                    useGrouping: false,
                    showEmptyDecimals: false,
                    integersLength: 4,
                    precision: 0,
                    onlyPositive: true
                }
            }
        }
    ];
    protected _editingObject: object = {
        number: 77
    };

    static _styles: string[] = ['Controls-demo/PropertyGridNew/Editors/Number/Demo'];
}
