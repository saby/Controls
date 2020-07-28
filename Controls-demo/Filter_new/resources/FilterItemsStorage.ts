import {Memory} from 'Types/source';
import hierarchyHistoryMemory = require('Controls-demo/FilterView/resources/hierarchyHistoryMemory');
import {Service as HistoryService} from 'Controls/history';
import memorySourceFilter = require('Controls-demo/Utils/MemorySourceFilter');
import {warehouseData, responsibleData, hierarchyOperationData} from './DataStorage';
import {merge, isEqual} from 'Types/object';
import {object} from 'Types/util';

const historyItemsValues = {
    Category: {
        value: [2],
        textValue: 'Документы'
    },
    NDS: {
        value: [1],
        textValue: 'С НДС'
    },
    deleted: {
        value: true,
        textValue: 'Удаленные'
    },
    state: {
        value: [4],
        textValue: 'Завершенные положительно'
    },
    passed: {
        value: true,
        textValue: 'Подписанные'
    },
    closed: {
        value: [1],
        textValue: 'Закрытые'
    }
};

const hierarchyFilters: any[] = [{
    name: 'hierarchyOperations',
    value: {},
    resetValue: {},
    emptyText: 'Все операции',
    itemTemplate: 'Controls-demo/Filter_new/resources/Editors/HierarchyLookup',
    editorOptions: {
        displayProperty: 'title',
        keyProperty: 'id',
        parentProperty: 'parent',
        nodeProperty: '@parent',
        source: new hierarchyHistoryMemory({
            originSource: new Memory({
                keyProperty: 'id',
                data: hierarchyOperationData
            }),
            historySource: new HistoryService({
                historyId: 'DEMO_HISTORY_ID'
            })
        }),
        filter: {$_history: true},
        selectorTemplate: {
            templateName: 'Controls-demo/Dropdown/TreeStackTemplate',
            templateOptions: {
                headingCaption: 'Выберите операцию',
                items: hierarchyOperationData,
                nodeProperty: '@parent', parentProperty: 'parent', multiSelect: true
            },
            popupOptions: {
                width: 600
            }
        },
        navigation: {source: 'page', view: 'page', sourceConfig: {pageSize: 8, page: 0}},
        selectorTemplateName: 'Controls-demo/Dropdown/TreeStackTemplate',
        suggestTemplateName: 'Controls-demo/Input/Lookup/Suggest/SuggestTemplate',
        className: 'controls-demo-FilterView__lookupTemplate',
        caption: 'Операции',
        placeholder: 'Введите название операции',
        searchParam: 'title',
        multiSelect: true
    },
    viewMode: 'frequent'
}];

const defaultItems = [{
        name: 'date',
        resetValue: null,
        value: null,
        type: 'dateRange',
        itemTemplate: 'wml!Controls-demo/Filter_new/resources/Editors/DateRange',
        editorOptions: {
            emptyCaption: 'Весь период',
            editorMode: 'Selector',
            chooseHalfyears: true,
            chooseYears: true,
            clearButtonVisibility: true
        },
        viewMode: 'basic'
    },
    {
        name: 'Category',
        value: [1],
        resetValue: [1],
        itemTemplate: 'wml!Controls-demo/Filter_new/resources/Editors/Dropdown',
        textValue: '',
        editorOptions: {
            source: new Memory({
                keyProperty: 'id',
                data: [
                    {id: 1, title: 'Картинки'},
                    {id: 2, title: 'Документы'},
                    {id: 3, title: 'Видео'},
                    {id: 4, title: 'Аудио'}
                ]
            }),
            displayProperty: 'title',
            keyProperty: 'id'
        },
        viewMode: 'basic'
    },
    {
        name: 'payment',
        value: [],
        resetValue: [],
        textValue: '',
        viewMode: 'extended',
        itemTemplate: 'wml!Controls-demo/Filter_new/resources/Editors/Dropdown',
        additionalTemplate: 'Controls-demo/Filter_new/resources/Editors/Additional/Select',
        visibility: false,
        editorOptions: {
            source: new Memory({
                keyProperty: 'id',
                data: [
                    {id: 1, title: 'Оплачено'},
                    {id: 2, title: 'Нет'},
                    {id: 3, title: 'С ошибками'}
                ]
            })
        }
    },
    {
        name: 'score',
        value: [],
        resetValue: [],
        textValue: '',
        viewMode: 'extended',
        itemTemplate: 'wml!Controls-demo/Filter_new/resources/Editors/Dropdown',
        additionalTemplate: 'Controls-demo/Filter_new/resources/Editors/Additional/Select',
        visibility: false,
        editorOptions: {
            source: new Memory({
                keyProperty: 'id',
                data: [
                    {id: 1, title: 'Оплачено'},
                    {id: 2, title: 'Нет'},
                    {id: 3, title: 'Частично'}
                ]
            })
        }
    },
    {
        name: 'held',
        value: [],
        resetValue: [],
        textValue: '',
        viewMode: 'extended',
        itemTemplate: 'wml!Controls-demo/Filter_new/resources/Editors/Dropdown',
        additionalTemplate: 'Controls-demo/Filter_new/resources/Editors/Additional/Select',
        visibility: false,
        editorOptions: {
            source: new Memory({
                keyProperty: 'id',
                data: [
                    {id: 1, title: 'Проведенные'},
                    {id: 2, title: 'Нет'},
                    {id: 3, title: 'С ошибками'}
                ]
            })
        }
    },
    {
        name: 'score2',
        value: [],
        resetValue: [],
        textValue: '',
        viewMode: 'extended',
        itemTemplate: 'wml!Controls-demo/Filter_new/resources/Editors/Dropdown',
        additionalTemplate: 'Controls-demo/Filter_new/resources/Editors/Additional/Select',
        visibility: false,
        editorOptions: {
            source: new Memory({
                keyProperty: 'id',
                data: [
                    {id: 1, title: 'Поступившие на склад'},
                    {id: 2, title: 'В расходы'}
                ]
            })
        }
    },
    {
        name: 'NDS',
        value: [],
        resetValue: [],
        textValue: '',
        viewMode: 'extended',
        itemTemplate: 'wml!Controls-demo/Filter_new/resources/Editors/Dropdown',
        additionalTemplate: 'Controls-demo/Filter_new/resources/Editors/Additional/Select',
        visibility: false,
        editorOptions: {
            source: new Memory({
                keyProperty: 'id',
                data: [
                    {id: 1, title: 'С НДС'},
                    {id: 3, title: 'БЕЗ НДС'}
                ]
            })
        }
    },
    {
        name: 'passed',
        value: false,
        resetValue: false,
        textValue: 'Подписанные',
        viewMode: 'extended',
        itemTemplate: 'wml!Controls-demo/Filter_new/resources/Editors/Link',
        additionalTemplate: 'wml!Controls-demo/Filter_new/resources/Editors/Additional/Link',
        visibility: false,
        editorOptions: {
            caption: 'Подписанные'
        }
    },
    {
        name: 'closed',
        value: [],
        resetValue: [],
        textValue: '',
        viewMode: 'extended',
        itemTemplate: 'wml!Controls-demo/Filter_new/resources/Editors/Dropdown',
        additionalTemplate: 'Controls-demo/Filter_new/resources/Editors/Additional/Select',
        visibility: false,
        editorOptions: {
            source: new Memory({
                keyProperty: 'id',
                data: [
                    {id: 1, title: 'Закрытые'},
                    {id: 2, title: 'Нет'}
                ]
            })
        }
    },
    {
        name: 'deleted',
        value: false,
        resetValue: false,
        textValue: 'Удаленные',
        viewMode: 'extended',
        itemTemplate: 'wml!Controls-demo/Filter_new/resources/Editors/Link',
        additionalTemplate: 'wml!Controls-demo/Filter_new/resources/Editors/Additional/Link',
        visibility: false,
        editorOptions: {
            caption: 'Удаленные'
        }
    },
    {
        name: 'warehouse',
        value: [],
        resetValue: [],
        textValue: '',
        viewMode: 'extended',
        itemTemplate: 'Controls-demo/Filter_new/resources/Editors/Lookup',
        additionalTemplate: 'Controls-demo/Filter_new/resources/Editors/Lookup',
        visibility: false,
        editorOptions: {
            displayProperty: 'title',
            keyProperty: 'id',
            parentProperty: 'parent',
            nodeProperty: '@parent',
            caption: 'Склад',
            source: new Memory({
                keyProperty: 'id',
                data: warehouseData,
                filter: memorySourceFilter()
            }),
            selectorTemplate: {
                templateName: 'Controls-demo/Dropdown/TreeStackTemplate',
                templateOptions: {
                    headingCaption: 'Выберите склад',
                    items: warehouseData,
                    nodeProperty: '@parent', parentProperty: 'parent', multiSelect: true
                },
                popupOptions: {
                    width: 600
                }
            },
            navigation: {source: 'page', view: 'page', sourceConfig: {pageSize: 8, page: 0}},
            selectorTemplateName: 'Controls-demo/Dropdown/TreeStackTemplate',
            suggestTemplateName: 'Controls-demo/Input/Lookup/Suggest/SuggestTemplate',
            className: 'controls-demo-FilterView__lookupTemplate',
            placeholder: 'Введите название склада',
            searchParam: 'title',
            multiSelect: true
        }
    },
    {
        name: 'responsible',
        value: [],
        resetValue: [],
        textValue: '',
        viewMode: 'extended',
        itemTemplate: 'Controls-demo/Filter_new/resources/Editors/Lookup',
        additionalTemplate: 'Controls-demo/Filter_new/resources/Editors/Lookup',
        visibility: false,
        editorOptions: {
            displayProperty: 'title',
            keyProperty: 'id',
            parentProperty: 'parent',
            nodeProperty: '@parent',
            caption: 'Ответственного',
            source: new Memory({
                keyProperty: 'id',
                data: responsibleData,
                filter: memorySourceFilter()
            }),
            selectorTemplate: {
                templateName: 'Controls-demo/Dropdown/TreeStackTemplate',
                templateOptions: {
                    headingCaption: 'Выберите ответственного',
                    items: responsibleData,
                    nodeProperty: '@parent', parentProperty: 'parent', multiSelect: true
                },
                popupOptions: {
                    width: 600
                }
            },
            navigation: {source: 'page', view: 'page', sourceConfig: {pageSize: 8, page: 0}},
            selectorTemplateName: 'Controls-demo/Dropdown/TreeStackTemplate',
            suggestTemplateName: 'Controls-demo/Input/Lookup/Suggest/SuggestTemplate',
            className: 'controls-demo-FilterView__lookupTemplate',
            placeholder: 'Введите ФИО',
            searchParam: 'title',
            multiSelect: true
        }
    },
    {
        name: 'unpinned',
        value: [],
        resetValue: [],
        textValue: 'Незакрепленные',
        viewMode: 'extended',
        itemTemplate: 'wml!Controls-demo/Filter_new/resources/Editors/Link',
        additionalTemplate: 'wml!Controls-demo/Filter_new/resources/Editors/Additional/Link',
        visibility: false,
        editorOptions: {
            caption: 'Незакрепленные'
        }
    },
    {
        name: 'state',
        value: [],
        resetValue: [],
        textValue: '',
        viewMode: 'extended',
        itemTemplate: 'wml!Controls-demo/Filter_new/resources/Editors/Dropdown',
        additionalTemplate: 'Controls-demo/Filter_new/resources/Editors/Additional/Dropdown',
        visibility: false,
        editorOptions: {
            emptyText: 'По состоянию',
            source: new Memory({
                keyProperty: 'id',
                data: [
                    {id: 1, title: 'Завершенные'},
                    {id: 2, title: 'На выполнении'},
                    {id: 3, title: 'В обработке'},
                    {id: 4, title: 'Завершенные отрицательно'},
                    {id: 4, title: 'Завершенные положительно'}
                ]
            })
        }
    }];

export function getItems(): unknown[] {
    return defaultItems.concat(hierarchyFilters);
}

export function getItemsWithGroup(): any[] {
    return [{
            name: 'date',
            resetValue: null,
            group: 'firstGroup',
            value: null,
            type: 'dateRange',
            itemTemplate: 'wml!Controls-demo/Filter_new/resources/Editors/DateRange',
            editorOptions: {
                emptyCaption: 'Весь период',
                editorMode: 'Selector',
                chooseHalfyears: true,
                chooseYears: true,
                clearButtonVisibility: true
            },
            viewMode: 'basic'
        },
        {
            name: 'payment',
            value: [],
            resetValue: [],
            group: 'firstGroup',
            column: 'left',
            markFirstItem: true,
            textValue: '',
            viewMode: 'extended',
            itemTemplate: 'wml!Controls-demo/Filter_new/resources/Editors/Dropdown',
            additionalTemplate: 'Controls-demo/Filter_new/resources/Editors/Additional/Select',
            visibility: false,
            editorOptions: {
                source: new Memory({
                    keyProperty: 'id',
                    data: [
                        {id: 1, title: 'Оплачено'},
                        {id: 2, title: 'Нет'},
                        {id: 3, title: 'С ошибками'}
                    ]
                })
            }
        },
        {
            name: 'payment2',
            value: [],
            resetValue: [],
            textValue: '',
            viewMode: 'extended',
            group: 'firstGroup',
            column: 'left',
            itemTemplate: 'wml!Controls-demo/Filter_new/resources/Editors/Dropdown',
            additionalTemplate: 'Controls-demo/Filter_new/resources/Editors/Additional/Select',
            visibility: false,
            editorOptions: {
                source: new Memory({
                    keyProperty: 'id',
                    data: [
                        {id: 1, title: 'Оплачено'},
                        {id: 2, title: 'Нет'},
                        {id: 3, title: 'С ошибками'}
                    ]
                })
            }
        },
        {
            name: 'NDS',
            value: [],
            resetValue: [],
            textValue: '',
            viewMode: 'extended',
            markFirstItem: true,
            group: 'secondGroup',
            column: 'left',
            itemTemplate: 'wml!Controls-demo/Filter_new/resources/Editors/Dropdown',
            additionalTemplate: 'Controls-demo/Filter_new/resources/Editors/Additional/Select',
            visibility: false,
            editorOptions: {
                source: new Memory({
                    keyProperty: 'id',
                    data: [
                        {id: 1, title: 'С НДС'},
                        {id: 3, title: 'БЕЗ НДС'}
                    ]
                })
            }
        },
        {
            name: 'payment3',
            value: [],
            resetValue: [],
            textValue: '',
            viewMode: 'extended',
            markFirstItem: true,
            group: 'group3',
            column: 'right',
            itemTemplate: 'wml!Controls-demo/Filter_new/resources/Editors/Dropdown',
            additionalTemplate: 'Controls-demo/Filter_new/resources/Editors/Additional/Select',
            visibility: false,
            editorOptions: {
                source: new Memory({
                    keyProperty: 'id',
                    data: [
                        {id: 1, title: 'Оплачено'},
                        {id: 2, title: 'Не оплачено'},
                        {id: 3, title: 'С ошибками'}
                    ]
                })
            }
        },
        {
            name: 'payment4',
            value: [],
            resetValue: [],
            textValue: '',
            viewMode: 'extended',
            markFirstItem: true,
            group: 'group4',
            column: 'right',
            itemTemplate: 'wml!Controls-demo/Filter_new/resources/Editors/Dropdown',
            additionalTemplate: 'Controls-demo/Filter_new/resources/Editors/Additional/Select',
            visibility: false,
            editorOptions: {
                source: new Memory({
                    keyProperty: 'id',
                    data: [
                        {id: 1, title: 'Оплачено полностью'},
                        {id: 2, title: 'Оплачено частично'},
                        {id: 3, title: 'Не оплачено'}
                    ]
                })
            }
        }];
}

export function getItemsWithItemTemplate(): unknown[] {
    return defaultItems.map((item): object => {
        const defaultItem = object.clone(item);
        if (defaultItem.hasOwnProperty('additionalTemplate')) {
            delete defaultItem.additionalTemplate;
        }
        return defaultItem;
    });
}

export function getAdditionalTemplateItems(): unknown[] {
    return defaultItems.filter((item): boolean => !!item.additionalTemplate || item.viewMode === 'basic');
}

export function getHierarchyFilterItems(): unknown[] {
    return hierarchyFilters;
}

export function getHistoryItems(count?: number): Array<Record<string, unknown>>  {
    const historyItems = defaultItems.filter((item): boolean => historyItemsValues.hasOwnProperty(item.name));
    return historyItems ? historyItems.slice(0, count) : historyItems;
}

export function getChangedHistoryItems(count?: number): Array<Record<string, unknown>> {
    return getHistoryItems(count).map((historyItem): Record<string, unknown> => {
        const item = merge(object.clone(historyItem), historyItemsValues[historyItem.name as string]);
        if (item.viewMode === 'extended') {
            item.visibility = !isEqual(item.value, item.resetValue);
        }
        return item;
    });
}
