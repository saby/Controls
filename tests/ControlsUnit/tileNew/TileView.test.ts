import { assert } from 'chai';
import { spy } from 'sinon';

import { RecordSet } from 'Types/collection';
import TileCollection from 'Controls/_tile/display/TileCollection';
import TileView from 'Controls/_tile/TileView';
import {CssClassesAssert} from 'ControlsUnit/CustomAsserts';
import GroupItem from 'Controls/_display/GroupItem';
import {SyntheticEvent} from "UI/Vdom";
import TileCollectionItem from 'Controls/_tile/display/TileCollectionItem';

describe('Controls/_tile/TileView', () => {
    let tileView, model;
    beforeEach(() => {
        model = new TileCollection({
            tileMode: 'static',
            tileHeight: 300,
            imageProperty: 'image',
            keyProperty: 'id',
            collection: new RecordSet({
                rawData: [{
                    id: 1,
                    image: 'image1'
                }, {
                    id: 2,
                    image: 'image2'
                }],
                keyProperty: 'id'
            })
        });

        const cfg = {
            listModel: model,
            keyProperty: 'id',
            tileScalingMode: 'outside',
            tileWidth: 200,
            useNewModel: true
        };

        tileView = new TileView(cfg);
        tileView.saveOptions(cfg);
        tileView._beforeMount(cfg);
    });

    describe('_onResize', () => {
        it('should reset hovered item', () => {
            const event = {
                type: ''
            };
            model.setHoveredItem(model.getItemBySourceKey(1));
            tileView._onResize(event);
            assert.equal(model.getHoveredItem(), null);
        });

        it('not should reset hovered item', () => {
            const event = {
                type: 'animationend'
            };
            model.setHoveredItem(model.getItemBySourceKey(1));
            tileView._onResize(event);
            assert.equal(model.getHoveredItem().key, 1);
        });
    });

    describe('_onItemMouseMove', () => {
        it('not set item is hovered', () => {
            const event = {
                closest: () => {
                    return {
                        getBoundingClientRect: () => {
                            return {
                                bottom: 473,
                                height: 240,
                                left: 360,
                                right: 1560,
                                top: 233,
                                width: 1200,
                                x: 360,
                                y: 233
                            };
                        }
                    };
                }
            };
            const item = model.getItemBySourceKey(1);
            tileView._onItemMouseMove(event, item);
            assert.isFalse(item.isHovered());
        });
    });

    describe('getItemsPaddingContainerClasses', () => {
        it('getItemsPaddingContainerClasses', () => {
            tileView.saveOptions({});
            CssClassesAssert.isSame(tileView.getItemsPaddingContainerClasses(), 'controls-TileView__itemPaddingContainer controls-TileView__itemsPaddingContainer_spacingLeft_default controls-TileView__itemsPaddingContainer_spacingRight_default controls-TileView__itemsPaddingContainer_spacingTop_default controls-TileView__itemsPaddingContainer_spacingBottom_default');
            tileView.saveOptions({
                itemPadding: {left: 's', right: 'null'}
            });
            CssClassesAssert.isSame(tileView.getItemsPaddingContainerClasses(), 'controls-TileView__itemPaddingContainer controls-TileView__itemsPaddingContainer_spacingLeft_s controls-TileView__itemsPaddingContainer_spacingRight_null controls-TileView__itemsPaddingContainer_spacingTop_default controls-TileView__itemsPaddingContainer_spacingBottom_default');
        });

        it('with itemPaddingsContainerOptions', () => {
            tileView.saveOptions({
                itemsContainerPadding: {
                    left: 's',
                    right: 'null'
                }
            });
            CssClassesAssert.isSame(tileView.getItemsPaddingContainerClasses(), 'controls-TileView__itemPaddingContainer controls-TileView__itemsPaddingContainer_spacingLeft_s_itemPadding_default controls-TileView__itemsPaddingContainer_spacingRight_null_itemPadding_default controls-TileView__itemsPaddingContainer_spacingTop_default_itemPadding_default controls-TileView__itemsPaddingContainer_spacingBottom_default_itemPadding_default');
        });
    });

    describe('_onItemMouseLeave', () => {
        it('not tile item', () => {
            const event = new SyntheticEvent(null, {});
            const item = new GroupItem();
            assert.doesNotThrow(tileView._onItemMouseLeave.bind(tileView, event, item));
        });
        
        it('tile item', () => {
            const owner = {
                getDisplayProperty: () => '',
                notifyItemChange: () => {/*mock*/}
            };
            const event = new SyntheticEvent(null, {});
            const item = new TileCollectionItem({owner});
            const methodSpy = spy(item, 'setCanShowActions');
            tileView._onItemMouseLeave(event, item);
            assert.isTrue(methodSpy.withArgs(false).called);
        });
    });
});
