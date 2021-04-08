import {assert} from 'chai';
import * as sinon from 'sinon';
import {BaseControl, IBaseControlOptions, ListViewModel} from 'Controls/list';
import {Memory} from 'Types/source';
import {CollectionItem} from 'Controls/display';
import {Model} from 'Types/entity';

describe('Controls/_list/BaseControl/HoverFreezeController', () => {
    let baseControl: BaseControl;
    const fakeEvent = {};
    const fakeNativeEvent = {} as undefined as Event;
    const record = {
        getKey: () => 1
    };
    const itemData = {
        ItemActionsItem: true,
        getContents: () => record
    }

    beforeEach(() => {
        const config = {
            itemActions: [{id: 0}],
            itemActionsPosition: 'outside',
            viewName: 'Controls/List/ListView',
            keyProperty: 'id',
            viewModelConstructor: ListViewModel,
            source: new Memory({
                keyProperty: 'id',
                data: []
            })
        };
        baseControl = new BaseControl<IBaseControlOptions>(config);

        // @ts-ignore
        baseControl._beforeMount(config);

        // @ts-ignore
        baseControl.saveOptions(config);

        // @ts-ignore
        baseControl._children = {
            itemActionsOutsideStyle: {}
        };

        // @ts-ignore
        BaseControl._private.initHoverFreezeController(baseControl);
    });

    describe('_onItemActionsMouseEnter', () => {
        it ('should not startFreezeHoverTimeout when non-ItemActionsItem', () => {
            itemData.ItemActionsItem = false;

            const spyStartFreezeHoverTimeout = sinon.spy(baseControl._hoverFreezeController, 'startFreezeHoverTimeout');
            baseControl._onItemActionsMouseEnter(fakeEvent, itemData as CollectionItem<Model>);
            sinon.assert.notCalled(spyStartFreezeHoverTimeout);

            itemData.ItemActionsItem = true;

            baseControl._onItemActionsMouseEnter(fakeEvent, itemData as CollectionItem<Model>);
            sinon.assert.calledOnce(spyStartFreezeHoverTimeout);

            spyStartFreezeHoverTimeout.restore();
        });
    });

    describe('_itemMouseEnter', () => {
        it ('should not startFreezeHoverTimeout when non-ItemActionsItem', () => {
            itemData.ItemActionsItem = false;

            const spyStartFreezeHoverTimeout = sinon.spy(baseControl._hoverFreezeController, 'startFreezeHoverTimeout');
            baseControl._itemMouseEnter(fakeEvent, itemData as CollectionItem<Model>, fakeNativeEvent);
            sinon.assert.notCalled(spyStartFreezeHoverTimeout);

            itemData.ItemActionsItem = true;

            baseControl._itemMouseEnter(fakeEvent, itemData as CollectionItem<Model>, fakeNativeEvent);
            sinon.assert.calledOnce(spyStartFreezeHoverTimeout);

            spyStartFreezeHoverTimeout.restore();
        });
    });

    describe('_itemMouseMove', () => {
        it ('should not setDelayedHoverItem when non-ItemActionsItem', () => {
            itemData.ItemActionsItem = false;

            const spySetDelayedHoverItem = sinon.spy(baseControl._hoverFreezeController, 'setDelayedHoverItem');
            baseControl._itemMouseMove(fakeEvent, itemData as CollectionItem<Model>, fakeNativeEvent);
            sinon.assert.notCalled(spySetDelayedHoverItem);

            itemData.ItemActionsItem = true;

            baseControl._itemMouseMove(fakeEvent, itemData as CollectionItem<Model>, fakeNativeEvent);
            sinon.assert.calledOnce(spySetDelayedHoverItem);

            spySetDelayedHoverItem.restore();
        });
    });
});
