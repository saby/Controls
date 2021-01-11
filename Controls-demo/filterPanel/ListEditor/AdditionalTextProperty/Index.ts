import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/filterPanel/ListEditor/AdditionalTextProperty/Index';
import {Memory} from 'Types/source';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _filterButtonData: unknown[] = [];
    protected _sourceWithAdditional: object[] = null;
    protected _source: object[] = null;
    protected _filterItems: object[] = null;

    protected _beforeMount(): void {
        this._filterItems = [
            { id: 1, title: 'Новиков Д.В.', owner: 'Новиков Д.В.' },
            { id: 2, title: 'Кошелев А.Е.', owner: 'Кошелев А.Е.' },
            { id: 3, title: 'Субботин А.В.', owner: 'Субботин А.В.' },
            { id: 4, title: 'Чеперегин А.С.', owner: 'Чеперегин А.С.' },
        ];

        this._source = [
            {
                group: 'Ответственный',
                name: 'owner',
                resetValue: [],
                caption: '',
                value: [],
                textValue: '',
                editorTemplateName: 'Controls/filterPanel:ListEditor',
                editorOptions: {
                    style: 'master',
                    navigation: {
                        source: 'page',
                        view: 'page',
                        sourceConfig: {
                            pageSize: 3,
                            page: 0,
                            hasMore: false
                        }
                    },
                    keyProperty: 'owner',
                    displayProperty: 'title',
                    source: new Memory({
                        data: this._filterItems,
                        keyProperty: 'owner'
                    })
                }
            }
        ];

        this._sourceWithAdditional = [
            {
                group: 'Ответственный',
                name: 'owner',
                resetValue: [],
                caption: '',
                value: [],
                textValue: '',
                editorTemplateName: 'Controls/filterPanel:ListEditor',
                editorOptions: {
                    style: 'master',
                    navigation: {
                        source: 'page',
                        view: 'page',
                        sourceConfig: {
                            pageSize: 3,
                            page: 0,
                            hasMore: false
                        }
                    },
                    keyProperty: 'owner',
                    displayProperty: 'title',
                    additionalTextProperty: 'id',
                    source: new Memory({
                        data: this._filterItems,
                        keyProperty: 'owner'
                    })
                }
            }
        ];

    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Filter_new/Filter'];
}
