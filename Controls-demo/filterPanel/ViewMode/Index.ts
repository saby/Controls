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
                group: 'Уволенные',
                name: 'booleanEditor1',
                editorTemplateName: 'Controls/filterPanel:LookupEditor',
                resetValue: [],
                viewMode: 'extended',
                caption: '',
                value: [],
                textValue: '',
                editorOptions: {
                    searchParam: 'title',
                    source: new Memory({
                        data: [
                            { id: 1, title: 'Новиков Д.В.', owner: 'Новиков Д.В.' },
                            { id: 2, title: 'Кошелев А.Е.', owner: 'Кошелев А.Е.' },
                            { id: 3, title: 'Субботин А.В.', owner: 'Субботин А.В.' },
                            { id: 4, title: 'Чеперегин А.С.', owner: 'Чеперегин А.С.' },
                        ],
                        keyProperty: 'owner'
                    }),
                    keyProperty: 'id',
                    displayProperty: 'title',
                    extendedCaption: 'Уволенные',
                    selectorTemplate: {
                        templateName: 'Controls-demo/filterPanel/resources/MultiSelectStackTemplate/StackTemplate',
                        templateOptions: {items: [
                                    { id: 1, title: 'Новиков Д.В.', owner: 'Новиков Д.В.' },
                                    { id: 2, title: 'Кошелев А.Е.', owner: 'Кошелев А.Е.' },
                                    { id: 3, title: 'Субботин А.В.', owner: 'Субботин А.В.' },
                                    { id: 4, title: 'Чеперегин А.С.', owner: 'Чеперегин А.С.' },
                                ]},
                        popupOptions: {
                            width: 500
                        }
                    }
                }
            }, {
                caption: '',
                name: 'booleanEditor2',
                editorTemplateName: 'Controls/filterPanel:BooleanEditor',
                resetValue: false,
                viewMode: 'extended',
                value: false,
                editorOptions: {
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
