import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/filterPanel/NumberRangeEditor/Index';
import * as AfterEditorTemplate from 'wml!Controls-demo/filterPanel/resources/AfterEditorTemplate';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _afterEditorTemplate: TemplateFunction = AfterEditorTemplate;
    protected _filterButtonData: unknown[] = [];
    protected _source: object[] = null;

    protected _beforeMount(): void {
        this._source = [
            {
                group: 'Количество сотрудников',
                name: 'amount',
                editorTemplateName: 'Controls/filterPanel:NumberRangeEditor',
                resetValue: [],
                caption: '',
                value: [],
                textValue: '',
                editorOptions: {
                    afterEditorTemplate: 'wml!Controls-demo/filterPanel/resources/AfterEditorTemplate'
                }
            }
        ];
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Filter_new/Filter'];
}
