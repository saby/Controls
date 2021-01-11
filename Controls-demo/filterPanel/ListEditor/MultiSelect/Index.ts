import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/filterPanel/ListEditor/MultiSelect/Index';
import {Memory} from 'Types/source';
import {departments} from 'Controls-demo/Filter_new/resources/DataStorage';
import {isEqual} from 'Types/object';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _filterButtonData: unknown[] = [];
    protected _source: Memory = null;
    protected _filterItems: object[] = null;

    protected _beforeMount(): void {
        this._filterItems = [
            { id: 1, title: 'Новиков Д.В.', owner: 'Новиков Д.В.' },
            { id: 2, title: 'Кошелев А.Е.', owner: 'Кошелев А.Е.' },
            { id: 3, title: 'Субботин А.В.', owner: 'Субботин А.В.' },
            { id: 4, title: 'Чеперегин А.С.', owner: 'Чеперегин А.С.' }
        ];

        this._source = new Memory({
            data: departments,
            keyProperty: 'id',
            filter: (item, queryFilter) => {
                const emptyField = []
                let addToData = true;
                for (const filterField in queryFilter) {
                    if (queryFilter.hasOwnProperty(filterField) && addToData) {
                        const filterValue = queryFilter[filterField];
                        const itemValue = item.get('owner');
                        addToData = filterValue.includes(itemValue) || isEqual(filterValue, emptyField);
                    }
                }
                return addToData;
            }
        });
        this._filterButtonData = [
            {
                group: 'Ответственные',
                name: 'owners',
                resetValue: [],
                caption: '',
                value: ['Новиков Д.В.', 'Кошелев А.Е.'],
                textValue: 'Новиков Д.В., Кошелев А.Е.',
                editorTemplateName: 'Controls/filterPanel:ListEditor',
                editorOptions: {
                    multiSelect: true,
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
                    additionalTextProperty: 'id',
                    displayProperty: 'title',
                    selectorTemplate: { templateName: 'Controls-demo/filterPanel/resources/MultiSelectStackTemplate/StackTemplate', templateOptions: {items: this._filterItems}, popupOptions: {width: 300} },
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
