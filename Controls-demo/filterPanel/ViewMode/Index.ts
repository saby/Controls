import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/filterPanel/ViewMode/Index';
import * as stackTemplate from 'wml!Controls-demo/filterPanel/resources/MultiSelectStackTemplate/StackTemplate';
import {Memory} from 'Types/source';
import {RecordSet} from 'Types/collection';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _stackTemplate: TemplateFunction = stackTemplate;
    protected _filterButtonData: unknown[] = [];
    protected _source: Memory = null;
    protected _navigation: object = null;
    protected _filterItems: object[] = null;

    protected _beforeMount(): void {
        this._filterButtonData = [
            {
                caption: '',
                name: 'booleanEditor2',
                editorTemplateName: 'Controls/filterPanel:TextEditor',
                resetValue: false,
                viewMode: 'basic',
                value: false,
                editorOptions: {
                    value: true,
                    extendedCaption: 'Без рабочих групп'
                }
            }, {
                group: 'Пол',
                name: 'gender',
                resetValue: '1',
                caption: '',
                viewMode: 'extended',
                value: '1',
                textValue: 'Мужской',
                editorTemplateName: 'Controls/filterPanel:TumblerEditor',
                editorOptions: {
                    extendedCaption: 'Пол',
                    items: new RecordSet({
                        rawData: [
                            {
                                id: '1',
                                caption: 'Мужской'
                            },
                            {
                                id: '2',
                                caption: 'Женский'
                            }
                        ],
                        keyProperty: 'id'
                    })
                }
            }
        ];
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Filter_new/Filter'];
}
