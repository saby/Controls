import {Memory} from 'Types/source';
import {merge, isEqual} from 'Types/object';
import {object} from 'Types/util';

const historyItemsValues = {
    owner: {
        value: ['Кошелев А.Е.', 'Новиков Д.В.'],
        textValue: 'Кошелев, Новиков',
        needCollapse: true
    },
    amount: {
        value: [11 , 30],
        textValue: '11 - 30'
    }
};

const defaultItems = [
    {
        group: 'Количество сотрудников',
        name: 'amount',
        editorTemplateName: 'Controls/filterPanel:NumberRangeEditor',
        resetValue: [],
        caption: '',
        value: [],
        textValue: '',
        editorOptions: {
            afterEditorTemplate: 'wml!Controls-demo/filterPanel/resources/AfterEditorTemplate',
            minValueInputPlaceholder: '0',
            maxValueInputPlaceholder: '1 000 000'
        }
    },
    {
        group: 'Ответственный',
        name: 'owner',
        resetValue: [],
        caption: '',
        value: [],
        textValue: '',
        editorTemplateName: 'Controls/filterPanel:ListEditor',
        editorOptions: {
            multiSelect: true,
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
            selectorTemplate: {
                templateName: 'Controls-demo/filterPanel/resources/MultiSelectStackTemplate/StackTemplate',
                templateOptions: {items: this._filterItems},
                popupOptions: {
                    width: 500
                }
            },
            source: new Memory({
                data: this._filterItems,
                keyProperty: 'owner'
            })
        }
    }
];

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
