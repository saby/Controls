import { assert } from 'chai';

import { TileCollectionItem } from 'Controls/display';

interface IChangedData<T> {
    item?: TileCollectionItem<T>;
    property?: string;
}

describe('Controls/_display/TileCollectionItem', () => {
    describe('.getTileWidth()', () => {
        const owner = {
            getTileWidth(): number {
                return 1;
            }
        };

        it('returns collection tile width', () => {
            const item = new TileCollectionItem({ owner: owner as any });
            assert.strictEqual(item.getTileWidth(), 1);
        });

        it('can be overridden by template variable', () => {
            const item = new TileCollectionItem({ owner: owner as any });
            assert.strictEqual(item.getTileWidth(2), 2);
        });
    });

    it('.getTileHeight()', () => {
        const owner = {
            getTileHeight(): number {
                return 1;
            }
        };

        const item = new TileCollectionItem({ owner: owner as any });
        assert.strictEqual(item.getTileHeight(), 1);
    });

    it('.getCompressionCoefficient()', () => {
        const owner = {
            getCompressionCoefficient(): number {
                return 1;
            }
        };

        const item = new TileCollectionItem({ owner: owner as any });
        assert.strictEqual(item.getCompressionCoefficient(), 1);
    });

    describe('.getShadowVisibility()', () => {
        const owner = {
            getShadowVisibility(): string {
                return 'visible';
            }
        };

        it('returns collection shadow visibility', () => {
            const item = new TileCollectionItem({ owner: owner as any });
            assert.strictEqual(item.getShadowVisibility(), 'visible');
        });

        it('can be overridden by template variable', () => {
            const item = new TileCollectionItem({ owner: owner as any });
            assert.strictEqual(item.getShadowVisibility('hidden'), 'hidden');
        });
    });

    it('.getImageProperty()', () => {
        const owner = {
            getImageProperty(): string {
                return 'myImageProperty';
            }
        };

        const item = new TileCollectionItem({ owner: owner as any });
        assert.strictEqual(item.getImageProperty(), 'myImageProperty');
    });

    it('.setHovered()', () => {
        const given: IChangedData<string> = {};
        const owner = {
            notifyItemChange(item: TileCollectionItem<string>, property: string): void {
                given.item = item;
                given.property = property;
            }
        };

        const item = new TileCollectionItem({ owner: owner as any });
        assert.isFalse(item.isHovered());

        const prevVersion = item.getVersion();

        item.setHovered(true);
        assert.isTrue(item.isHovered());
        assert.isAbove(item.getVersion(), prevVersion);

        assert.strictEqual(given.item, item);
        assert.strictEqual(given.property, 'hovered');
    });

    describe('.setActive() (override)', () => {
        let owner;

        beforeEach(() => {
            owner = {
                _prevHovered: null,
                setHoveredItem(item: TileCollectionItem<string>): void {
                    if (this._prevHovered) {
                        this._prevHovered.setHovered(false, true);
                    }
                    if (item) {
                        item.setHovered(true, true);
                    }
                    this._prevHovered = item;
                }
            };
        });

        it('works as intended', () => {
            const item = new TileCollectionItem({ owner: owner as any });

            item.setActive(true, true);

            assert.isTrue(item.isActive());
        });

        it('also unsets hover state when item is deactivated', () => {
            const item = new TileCollectionItem({ owner: owner as any });

            item.setActive(true, true);
            item.setHovered(true, true);
            owner._prevHovered = item;

            item.setActive(false, true);

            assert.isFalse(item.isActive(), 'setActive(false) should unset active state');
            assert.isFalse(item.isHovered(), 'setActive(false) should unset hovered state');
        });
    });

    it('.setCanShowActions()', () => {
        const given: IChangedData<string> = {};
        const owner = {
            notifyItemChange(item: TileCollectionItem<string>, property: string): void {
                given.item = item;
                given.property = property;
            }
        };

        const item = new TileCollectionItem({ owner: owner as any });
        assert.isFalse(item.canShowActions());

        const prevVersion = item.getVersion();

        item.setCanShowActions(true);
        assert.isTrue(item.canShowActions());
        assert.isAbove(item.getVersion(), prevVersion);

        assert.strictEqual(given.item, item);
        assert.strictEqual(given.property, 'canShowActions');
    });

    describe('.getWrapperClasses()', () => {
        it('unclickable template', () => {
            const item = new TileCollectionItem();
            const classes = item.getWrapperClasses(false);

            assert.include(classes, 'controls-TileView__item');
            assert.include(classes, 'controls-ListView__itemV');
            assert.notInclude(classes, 'controls-ListView__itemV_cursor-pointer');
        });

        it('clickable template', () => {
            const item = new TileCollectionItem();
            const classes = item.getWrapperClasses(true);

            assert.include(classes, 'controls-TileView__item');
            assert.include(classes, 'controls-ListView__itemV');
            assert.include(classes, 'controls-ListView__itemV_cursor-pointer');
        });
    });

    it('.getWrapperStyle()', () => {
        const owner = {
            getTileHeight(): number {
                return 1;
            },
            getTileWidth(): number {
                return 6;
            },
            getCompressionCoefficient(): number {
                return 0.5;
            }
        };
        const item = new TileCollectionItem({ owner: owner as any });
        const style = item.getWrapperStyle();

        assert.include(style, 'flex-basis: 3px;');
        assert.include(style, 'height: 1px;');
        assert.include(style, 'max-width: 6px;');
    });

    it('.getImageWrapperClasses()', () => {
        const owner = {
            getTileScalingMode(): string {
                return 'dynamic';
            }
        };

        const item = new TileCollectionItem({ owner: owner as any });
        assert.include(item.getImageWrapperClasses(), 'controls-TileView__imageWrapper');

        item.setHovered(true, true);
        item.setAnimated(true, true);
        assert.include(item.getImageWrapperClasses(), 'controls-TileView__item_animated');

        assert.include(item.getImageWrapperClasses(true), 'controls-TileView__imageWrapper_reduced');
    });

    it('.getImageWrapperStyle()', () => {
        const owner = {
            getTileScalingMode(): string {
                return 'dynamic';
            },
            getTileHeight(): number {
                return 10;
            },
            getZoomCoefficient(): number {
                return 2;
            }
        };

        const item = new TileCollectionItem({ owner: owner as any });
        assert.include(item.getImageWrapperStyle(), 'height: 10px;');

        item.setHovered(true, true);
        item.setAnimated(true, true);
        assert.include(item.getImageWrapperStyle(), 'height: 20px;');
    });

    it('.getTitleClasses()', () => {
        const item = new TileCollectionItem();

        assert.strictEqual(item.getTitleClasses(true), 'controls-TileView__title');
        assert.include(item.getTitleClasses(false), 'controls-TileView__title_invisible');
    });

    it('.getMultiSelectClasses() (override)', () => {
        const owner = {
            getMultiSelectVisibility(): string {
                return 'visible';
            }
        };

        const item = new TileCollectionItem({ owner: owner as any });
        const classes = item.getMultiSelectClasses();

        assert.include(classes, 'controls-TileView__checkbox');
        assert.include(classes, 'controls-TileView__checkbox_top');
        assert.include(classes, 'js-controls-TileView__withoutZoom');
    });

    describe('.getTileContentClasses()', () => {
        const owner = {
            getTileScalingMode(): string {
                return 'dynamic';
            },
            getShadowVisibility(): string {
                return '#visibility#';
            }
        };

        it('default classes', () => {
            const item = new TileCollectionItem({ owner: owner as any });
            const classes = item.getTileContentClasses();

            assert.include(classes, 'controls-TileView__itemContent');
            assert.include(classes, 'js-controls-SwipeControl__actionsContainer');
            assert.include(classes, 'controls-ListView__item_shadow_#visibility#');
            assert.include(classes, 'controls-TileView__item_withoutMarker');
        });

        it('is active', () => {
            const item = new TileCollectionItem({ owner: owner as any });
            item.setActive(true, true);

            const classes = item.getTileContentClasses();

            assert.include(classes, 'controls-TileView__item_hovered');
            assert.include(classes, 'controls-TileView__item_scaled');
        });

        it('is hovered', () => {
            const item = new TileCollectionItem({ owner: owner as any });
            item.setHovered(true, true);

            const classes = item.getTileContentClasses();

            assert.include(classes, 'controls-TileView__item_hovered');
            assert.include(classes, 'controls-TileView__item_scaled');
        });

        it('can show actions', () => {
            const item = new TileCollectionItem({ owner: owner as any });
            item.setCanShowActions(true, true);

            assert.include(item.getTileContentClasses(), 'controls-ListView__item_showActions');
        });

        it('is fixed', () => {
            const item = new TileCollectionItem({ owner: owner as any });
            item.setHovered(true, true);
            item.setFixedPositionStyle('abc', true);

            assert.include(item.getTileContentClasses(), 'controls-TileView__item_fixed');
        });

        it('is swiped', () => {
            const item = new TileCollectionItem({ owner: owner as any });
            item.setSwiped(true, true);

            const classes = item.getTileContentClasses();

            assert.include(classes, 'controls-TileView__item_swiped');
            assert.include(classes, 'controls-TileView__item_scaled');
        });

        it('is animated', () => {
            const item = new TileCollectionItem({ owner: owner as any });
            item.setHovered(true, true);
            item.setAnimated(true, true);

            const classes = item.getTileContentClasses();

            assert.include(classes, 'controls-TileView__item_animated');
        });

        it('is marked', () => {
            const item = new TileCollectionItem({ owner: owner as any });
            item.setMarked(true, true);

            assert.include(item.getTileContentClasses(), 'controls-TileView__item_withMarker');
        });

        it('is marked, but marker is disabled in template', () => {
            const item = new TileCollectionItem({ owner: owner as any });
            item.setMarked(true, true);

            assert.include(item.getTileContentClasses(undefined, false), 'controls-TileView__item_withoutMarker');
        });
    });

    describe('.isScaled()', () => {
        const owner = {
            _scalingMode: 'dynamic',
            _displayProperty: undefined,
            getTileScalingMode(): string {
                return this._scalingMode;
            },
            getDisplayProperty(): string {
                return this._displayProperty;
            }
        };

        beforeEach(() => {
            owner._scalingMode = 'dynamic';
            owner._displayProperty = undefined;
        });

        it('when hovered', () => {
            const item = new TileCollectionItem({ owner: owner as any });
            item.setHovered(true, true);

            assert.isTrue(item.isScaled());
        });

        it('when active', () => {
            const item = new TileCollectionItem({ owner: owner as any });
            item.setActive(true, true);

            assert.isTrue(item.isScaled());
        });

        it('when swiped', () => {
            const item = new TileCollectionItem({ owner: owner as any });
            item.setSwiped(true, true);

            assert.isTrue(item.isScaled());
        });

        it('not when scalingMode is none', () => {
            owner._scalingMode = 'none';

            const item = new TileCollectionItem({ owner: owner as any });
            item.setHovered(true, true);

            assert.isFalse(item.isScaled());
        });

        it('when scalingMode is none but has displayProperty', () => {
            owner._scalingMode = 'none';
            owner._displayProperty = 'myDisplayProperty';

            const item = new TileCollectionItem({ owner: owner as any });
            item.setHovered(true, true);

            assert.isTrue(item.isScaled());
        });
    });

    it('.setFixedPositionStyle()', () => {
        const owner = {
            getTileScalingMode(): string {
                return 'dynamic';
            }
        };

        const item = new TileCollectionItem({ owner: owner as any });
        assert.isUndefined(item.getFixedPositionStyle(), 'should be initialized as undefined');

        const prevVersion = item.getVersion();

        item.setFixedPositionStyle('abc', true);

        assert.isAbove(item.getVersion(), prevVersion);
        assert.isUndefined(item.getFixedPositionStyle(), 'should not return fixed position style for unscaled items');

        item.setHovered(true, true);

        assert.strictEqual(item.getFixedPositionStyle(), 'abc');
    });

    it('.isFixed()', () => {
        const owner = {
            getTileScalingMode(): string {
                return 'dynamic';
            }
        };

        const item = new TileCollectionItem({ owner: owner as any });
        assert.isFalse(item.isFixed(), 'should be initialized as false');

        item.setHovered(true, true);
        assert.isFalse(item.isFixed(), 'scaled !== fixed');

        item.setFixedPositionStyle('abc', true);
        assert.isTrue(item.isFixed(), 'scaled + has fixed position === fixed');
    });

    it('.setAnimated()', () => {
        const given: IChangedData<string> = {};
        const owner = {
            getTileScalingMode(): string {
                return 'dynamic';
            },
            notifyItemChange(item: TileCollectionItem<string>, property: string): void {
                given.item = item;
                given.property = property;
            }
        };

        const item = new TileCollectionItem({ owner: owner as any });
        assert.isFalse(item.isAnimated());

        const prevVersion = item.getVersion();

        item.setAnimated(true);
        assert.strictEqual(given.item, item);
        assert.strictEqual(given.property, 'animated');
        assert.isAbove(item.getVersion(), prevVersion);

        assert.isFalse(item.isAnimated(), 'item is not animated if it is not scaled');

        item.setHovered(true);
        item.setAnimated(true);
        assert.isTrue(item.isAnimated());
    });

    // TODO This test should be moved out of here when the code in
    // isAnimated is removed or moved somewhere
    it('.isAnimated() unsets scaling and positioning if not animated', () => {
        const given: IChangedData<string> = {};
        const owner = {
            getTileScalingMode(): string {
                return 'dynamic';
            },
            notifyItemChange(item: TileCollectionItem<string>, property: string): void {
                given.item = item;
                given.property = property;
            }
        };

        const item = new TileCollectionItem({ owner: owner as any });

        item.setHovered(true, true);
        item.setCanShowActions(true, true);
        item.setFixedPositionStyle('abc', true);
        item.setAnimated(true, true);

        assert.isTrue(item.isAnimated());

        // make item not scaled
        item.setHovered(false, true);

        assert.isFalse(item.isAnimated(), 'item should not be animated when unscaled');
        assert.isFalse(item.isFixed(), 'item should not be fixed when unscaled');
        assert.isUndefined(item.getFixedPositionStyle(), 'item should not have fixed position when unscaled');
        assert.isFalse(item.canShowActions(), 'item should not show actions when unscaled');

        // canShowActions change should trigger collection update, because
        // it changes one of the item wrapper classes
        assert.strictEqual(given.item, item);
        assert.strictEqual(given.property, 'canShowActions');
    });
});
