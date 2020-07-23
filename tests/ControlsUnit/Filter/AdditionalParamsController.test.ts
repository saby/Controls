import {default as Controller} from 'Controls/_filterPopup/Panel/AdditionalParams/Controllers/AdditionalItems';
import {assert} from 'chai';

let itemsController = null;
const defaultFilterItems = [{
    name: 'date',
    resetValue: null,
    group: 'firstGroup',
    value: null,
    type: 'dateRange',
    itemTemplate: 'wml!Controls-demo/Filter_new/resources/Editors/DateRange',
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
        visibility: false
    },
    {
        name: 'payment2',
        value: [],
        resetValue: [],
        textValue: '',
        viewMode: 'extended',
        itemTemplate: 'wml!Controls-demo/Filter_new/resources/Editors/Dropdown',
        additionalTemplate: 'Controls-demo/Filter_new/resources/Editors/Additional/Select',
        visibility: false
    },
    {
        name: 'NDS',
        value: [],
        resetValue: [],
        textValue: '',
        viewMode: 'extended',
        itemTemplate: 'wml!Controls-demo/Filter_new/resources/Editors/Dropdown',
        additionalTemplate: 'Controls-demo/Filter_new/resources/Editors/Additional/Select',
        visibility: false
    },
    {
        name: 'payment3',
        value: [],
        resetValue: [],
        textValue: '',
        viewMode: 'extended',
        itemTemplate: 'wml!Controls-demo/Filter_new/resources/Editors/Dropdown',
        additionalTemplate: 'Controls-demo/Filter_new/resources/Editors/Additional/Select',
        visibility: false
    },
    {
        name: 'payment4',
        value: [],
        resetValue: [],
        textValue: '',
        viewMode: 'extended',
        itemTemplate: 'wml!Controls-demo/Filter_new/resources/Editors/Dropdown',
        additionalTemplate: 'Controls-demo/Filter_new/resources/Editors/Additional/Select',
        visibility: false
    }];

function getItemsWithExpander(): any[] {
    const moreItems = [{
        name: 'payment4',
        value: [],
        resetValue: [],
        textValue: '',
        viewMode: 'extended',
        itemTemplate: 'wml!Controls-demo/Filter_new/resources/Editors/Dropdown',
        additionalTemplate: 'Controls-demo/Filter_new/resources/Editors/Additional/Select',
        visibility: false
    },
    {
        name: 'payment5',
        value: [],
        resetValue: [],
        textValue: '',
        viewMode: 'extended',
        itemTemplate: 'wml!Controls-demo/Filter_new/resources/Editors/Dropdown',
        additionalTemplate: 'Controls-demo/Filter_new/resources/Editors/Additional/Select',
        visibility: false
    },
    {
        name: 'payment355',
        value: [],
        resetValue: [],
        textValue: '',
        viewMode: 'extended',
        itemTemplate: 'wml!Controls-demo/Filter_new/resources/Editors/Dropdown',
        additionalTemplate: 'Controls-demo/Filter_new/resources/Editors/Additional/Select',
        visibility: false
    },
    {
        name: 'payment155',
        value: [],
        resetValue: [],
        textValue: '',
        viewMode: 'extended',
        itemTemplate: 'wml!Controls-demo/Filter_new/resources/Editors/Dropdown',
        additionalTemplate: 'Controls-demo/Filter_new/resources/Editors/Additional/Select',
        visibility: false
    },
    {
        name: 'payment55',
        value: [],
        resetValue: [],
        textValue: '',
        viewMode: 'extended',
        itemTemplate: 'wml!Controls-demo/Filter_new/resources/Editors/Dropdown',
        additionalTemplate: 'Controls-demo/Filter_new/resources/Editors/Additional/Select',
        visibility: false
    },
        {
            name: 'payment5123335',
            value: [],
            resetValue: [],
            textValue: '',
            viewMode: 'extended',
            itemTemplate: 'wml!Controls-demo/Filter_new/resources/Editors/Dropdown',
            additionalTemplate: 'Controls-demo/Filter_new/resources/Editors/Additional/Select',
            visibility: false
        }];
    return defaultFilterItems.concat(moreItems);
}

describe('AdditionalItemsController', () => {
    beforeEach(() => {
        itemsController = new Controller({
            source: defaultFilterItems,
            keyProperty: 'name'
        });
    });

    describe('getResult', () => {
        it('returns only invisible items', () => {
            const controllerResult = itemsController.getResult();
            const returnsOnlyInvisibleItems = controllerResult.visibleItems.every((item): boolean => {
                return item.visibility === false;
            });
            assert.isTrue(returnsOnlyInvisibleItems);
        });

        it('expanderVisible', () => {
            const controllerResult = itemsController.getResult();
            assert.isFalse(controllerResult.expanderVisible);

            const updateControllerResult = itemsController.update({
                source: getItemsWithExpander(),
                keyProperty: 'name'
            });
            assert.isTrue(updateControllerResult.expanderVisible);
        });

        it('columns calculating', () => {
            const controllerResult = itemsController.getResult();
            const correctColumns = {
                payment: 'left',
                payment2: 'left',
                NDS: 'left',
                payment3: 'right',
                payment4: 'right'
            };
            const groupsCorrectCalculated = controllerResult.visibleItems.every((item) => {
                return correctColumns[item.name] === item.column;
            });
            const updateControllerResult = itemsController.update({
                source: defaultFilterItems.slice(),
                keyProperty: 'name',
                groupProperty: 'group'
            });
            const groupsNotCalculatedWhenHasGroupProperty = updateControllerResult.visibleItems.every((item) => {
                return !item.column;
            });
            assert.isTrue(groupsCorrectCalculated);
            assert.isTrue(groupsNotCalculatedWhenHasGroupProperty);
        });

        it('handleUpdateItem', () => {
            const newSource = itemsController.handleUpdateItem(defaultFilterItems[0], 'textValue', 'newText');
            assert.isTrue(newSource[0].visibility);
            assert.isTrue(newSource[0].textValue === 'newText');
        });
    });
});
