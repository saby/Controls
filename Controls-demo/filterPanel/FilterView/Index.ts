import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/filterPanel/FilterView/Index';
import {isEqual} from 'Types/object';
import {Memory} from 'Types/source';
import {departments} from 'Controls-demo/filterPanel/resources/DataStorage';
import {RecordSet} from 'Types/collection';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _filterSource: object[] = [];
    protected _source: Memory = null;
    protected _filterItems: object[] = null;

    protected _beforeMount(): void {
        this._source = new Memory({
            data: departments,
            keyProperty: 'id',
            filter: (item, queryFilter) => {
                let addToData = true;
                for (const filterField in queryFilter) {
                    if (queryFilter.hasOwnProperty(filterField) && item.get(filterField) && addToData) {
                        const filterValue = queryFilter[filterField];
                        const itemValue = item.get(filterField);
                        addToData = filterValue.includes(itemValue) || isEqual(filterValue, []);
                    }
                }
                return addToData;
            }
        });
        this._filterItems = [
            { id: 1, title: 'Новиков Д.В.', owner: 'Новиков Д.В.' },
            { id: 2, title: 'Кошелев А.Е.', owner: 'Кошелев А.Е.' },
            { id: 3, title: 'Субботин А.В.', owner: 'Субботин А.В.' }
        ];
        this._filterSource = [
            {
                group: 'Ответственный',
                name: 'owner',
                resetValue: [],
                caption: '',
                value: [],
                textValue: '',
                viewMode: 'basic',
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
            }, {
                group: 'Пол',
                name: 'gender',
                resetValue: null,
                caption: '',
                value: '1',
                textValue: 'Мужской',
                viewMode: 'basic',
                editorTemplateName: 'Controls/filterPanel:TumblerEditor',
                editorOptions: {
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
