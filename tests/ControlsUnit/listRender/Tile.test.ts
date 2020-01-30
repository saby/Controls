import { assert } from 'chai';

import { Tile } from 'Controls/listRender';

describe('Controls/_listRender/Tile', () => {
    const defaultCfg = {
        listModel: {
            destroyed: true,
            getActionsMenuConfig: () => null
        }
    };

    it('_beforeMount()', () => {
        const tile = new Tile(defaultCfg);
        tile._beforeMount(defaultCfg);

        const anotherTile = new Tile(defaultCfg);
        anotherTile._beforeMount(defaultCfg);

        assert.notStrictEqual(tile._templateKeyPrefix, anotherTile._templateKeyPrefix);
    });

    it('_afterMount()', () => {
        const tile = new Tile(defaultCfg);

        const subscriptions: string[] = [];
        tile._notify = (eventName, params) => {
            if (eventName === 'register') {
                subscriptions.push(params[0]);
            }
        };

        tile._afterMount();

        assert.includeMembers(subscriptions, ['controlResize', 'scroll']);
    });

    it('_beforeUpdate()', () => {
        const oldCfg = {
            ...defaultCfg
        };
        const newCfg = {
            ...oldCfg,
            listModel: {
                ...oldCfg.listModel
            }
        };

        const tile = new Tile(defaultCfg);
        tile.saveOptions(oldCfg);

        const animatedItem = { isFixed: () => false };
        tile._animatedItem = animatedItem;

        tile._beforeUpdate(oldCfg);
        assert.strictEqual(tile._animatedItem, animatedItem);
        assert.isFalse(tile._shouldPerformAnimation, 'should not perform animation if animated item is not fixed');

        tile._animatedItem = { isFixed: () => true };
        tile._beforeUpdate(oldCfg);
        assert.isTrue(tile._shouldPerformAnimation, 'should perform animation if animated item is fixed');

        tile._beforeUpdate(newCfg);
        assert.isNull(tile._animatedItem);
    });

    describe('_afterUpdate()', () => {
        it('animates and shows actions of fixed animated item once', () => {
            const tile = new Tile(defaultCfg);
            tile._shouldPerformAnimation = true;

            const animatedItem = {
                _animated: false,
                _canShowActions: false,
                isFixed() { return true; },
                isAnimated() { return this._animated; },
                setFixedPositionStyle() {},
                setCanShowActions(value) { this._canShowActions = value; },
                setAnimated(value) { this._animated = value; }
            };

            tile._animatedItem = animatedItem;
            tile._afterUpdate();

            assert.isTrue(animatedItem._animated, 'should call setAnimated');
            assert.isTrue(animatedItem._canShowActions, 'should call setCanShowActions');

            animatedItem._animated = false;
            tile._afterUpdate();

            assert.isFalse(animatedItem._animated, 'should only animate the same item once on afterUpdate');
        });

        it('ignores unfixed animated item', () => {
            const tile = new Tile(defaultCfg);
            tile._shouldPerformAnimation = true;

            const animatedItem = {
                _animated: false,
                _canShowActions: false,
                isFixed() { return false; },
                isAnimated() { return this._animated; },
                setFixedPositionStyle() {},
                setCanShowActions(value) { this._canShowActions = value; },
                setAnimated(value) { this._animated = value; }
            };

            tile._animatedItem = animatedItem;
            tile._afterUpdate();

            assert.isFalse(animatedItem._animated, 'should not animate unfixed items');
        });

        it('does not fail with destroyed animated item', () => {
            const tile = new Tile(defaultCfg);
            tile._shouldPerformAnimation = true;

            const animatedItem = {
                destroyed: true
            };

            tile._animatedItem = animatedItem;
            tile._afterUpdate();

            assert.isNull(tile._animatedItem);
        });

        it('does not animate without shouldPerformAnimation', () => {
            const tile = new Tile(defaultCfg);
            tile._shouldPerformAnimation = false;

            const animatedItem = {
                _animated: false,
                _canShowActions: false,
                isFixed() { return true; },
                isAnimated() { return this._animated; },
                setFixedPositionStyle() {},
                setCanShowActions(value) { this._canShowActions = value; },
                setAnimated(value) { this._animated = value; }
            };

            tile._animatedItem = animatedItem;
            tile._afterUpdate();

            assert.isFalse(animatedItem._animated, 'should not animate without shouldPerformAnimation');
        });
    });

    it('_beforeUnmount()', () => {
        const tile = new Tile(defaultCfg);

        const unsubscriptions: string[] = [];
        tile._notify = (eventName, params) => {
            if (eventName === 'unregister') {
                unsubscriptions.push(params[0]);
            }
        };

        tile._beforeUnmount();

        assert.includeMembers(unsubscriptions, ['controlResize', 'scroll']);
    });

    describe('hover changes', () => {
        let tile: Tile;
        let hoveredItem;

        beforeEach(() => {
            hoveredItem = undefined;
            tile = new Tile(defaultCfg);
            tile._debouncedSetHoveredItem = tile._setHoveredItem = (item) => {
                hoveredItem = item;
            };
            tile._context = {
                isTouch: {
                    isTouch: false
                }
            };
        })

        it('_onItemWheel()', () => {
            tile._onItemWheel();
            assert.isNull(hoveredItem);
        });

        describe('_onItemMouseEnter()', () => {
            it('sets hovered item', () => {
                tile._shouldProcessHover = () => true;
                const item = {};
                tile._onItemMouseEnter({}, item);
                assert.strictEqual(hoveredItem, item);
            });

            it('checks if it should process hover', () => {
                tile._shouldProcessHover = () => false;
                const item = {};
                tile._onItemMouseEnter({}, item);
                assert.isUndefined(hoveredItem);
            });
        });

        describe('_onItemMouseLeave()', () => {
            it('unsets hover state', () => {
                const item = {
                    isActive() { return false; }
                };
                tile._onItemMouseLeave({}, item);
                assert.isNull(hoveredItem);
            });

            it('does not unset hover state if item is active', () => {
                hoveredItem = 'unchanged';
                const item = {
                    isActive() { return true; }
                };
                tile._onItemMouseLeave({}, item);
                assert.strictEqual(hoveredItem, 'unchanged');
            });
        });
    });

    describe('_onItemMouseMove()', () => {
        it('sets hovered item position', () => {
            const tile = new Tile(defaultCfg);
            tile._shouldProcessHover = () => true;

            let setHoveredItemPositionCalled = false;
            tile._setHoveredItemPosition = () => {
                setHoveredItemPositionCalled = true;
            };

            tile._onItemMouseMove({}, {
                isFixed() { return true; }
            });
            assert.isFalse(setHoveredItemPositionCalled, 'should not calculate hover position on already fixed items');

            tile._onItemMouseMove({}, {
                isFixed() { return false; }
            });
            assert.isTrue(setHoveredItemPositionCalled, 'should calculate hover position for unfixed items');
        });

        it('checks if should process hover', () => {
            const tile = new Tile(defaultCfg);
            tile._shouldProcessHover = () => false;

            let setHoveredItemPositionCalled = false;
            tile._setHoveredItemPosition = () => {
                setHoveredItemPositionCalled = true;
            };

            tile._onItemMouseMove({}, {
                isFixed() { return false; }
            });
            assert.isFalse(setHoveredItemPositionCalled);
        });
    });

    it('_convertPositionToStyle()', () => {
        const tile = new Tile(defaultCfg);
        const style = tile._convertPositionToStyle({ top: 30, left: -10 });

        assert.include(style, 'top: 30px;');
        assert.include(style, 'left: -10px;');
    });

    describe('_setHoveredItem()', () => {
        it('sets model hovered item', () => {
            const cfg = {
                ...defaultCfg,
                listModel: {
                    hoveredItem: null,
                    getHoveredItem() { return this.hoveredItem; },
                    setHoveredItem(item) { this.hoveredItem = item; }
                }
            };
            const tile = new Tile(cfg);
            tile.saveOptions(cfg);

            const item = {};
            tile._setHoveredItem(item);
            assert.strictEqual(cfg.listModel.hoveredItem, item);
        });

        it('does not set hovered item if it matches', () => {
            const cfg = {
                ...defaultCfg,
                listModel: {
                    hoveredItem: null,
                    getHoveredItem() { return this.hoveredItem; },
                    setHoveredItem(item) { this.hoveredItem = item; }
                }
            };
            const tile = new Tile(cfg);
            tile.saveOptions(cfg);

            const item = {};
            tile._setHoveredItem(item);

            let calledModelSetHoveredItem = false;
            cfg.listModel.setHoveredItem = () => {
                calledModelSetHoveredItem = true;
            };
            tile._setHoveredItem(item);

            assert.isFalse(calledModelSetHoveredItem, 'should not call setHoveredItem for the same item again');
        });
    });

    describe('_setHoveredItemPosition()', () => {
        let cfg;
        let fakeItem;
        let fakeEvent;

        beforeEach(() => {
            let viewContainer = {
                getBoundingClientRect() {
                    return {};
                }
            };
            let hoverTarget = {
                closest(selector) {
                    if (selector !== '.js-controls-TileView__withoutZoom') {
                        return viewContainer;
                    }
                }
            };
            cfg = {
                ...defaultCfg,
                listModel: {
                    getItemContainerSize() {
                        return { _itemContainerSize: true };
                    },
                    getItemContainerPosition() {
                        return { _itemContainerPosition: true };
                    },
                    getItemContainerPositionInDocument() {
                        return { _positionInDocument: true };
                    },
                    getItemContainerStartPosition() {
                        return { _startPosition: true };
                    }
                }
            };
            fakeEvent = {
                target: hoverTarget
            };
            fakeItem = {
                fixedPositionStyle: null,
                canShowActions: false,
                setFixedPositionStyle(value) {
                    fakeItem.fixedPositionStyle = value;
                },
                setCanShowActions(value) {
                    fakeItem.canShowActions = value;
                }
            };
        });

        it('target item position is outside of document', () => {
            cfg.listModel.getItemContainerPositionInDocument = () => {
                return false;
            };
            cfg.tileScalingMode = 'inside';

            const tile = new Tile(cfg);
            tile.saveOptions(cfg);
            tile.getItemsContainer = () => ({
                getBoundingClientRect() {
                    return {};
                }
            });

            tile._setHoveredItemPosition(fakeEvent, fakeItem);

            assert.isNull(fakeItem.fixedPositionStyle);
            assert.isNotOk(tile._animatedItem);
        });

        it('none scaling mode', () => {
            cfg.tileScalingMode = 'none';

            const tile = new Tile(cfg);
            tile.saveOptions(cfg);
            tile.getItemsContainer = () => ({
                getBoundingClientRect() {
                    return {};
                }
            });

            tile._setHoveredItemPosition(fakeEvent, fakeItem);

            assert.isNull(fakeItem.fixedPositionStyle);
            assert.isNotOk(tile._animatedItem);
        });

        it('inside tile scaling mode', () => {
            cfg.listModel.getItemContainerPositionInDocument = () => {
                return { _positionInDocument: 1 };
            };
            cfg.listModel.getItemContainerStartPosition = () => {
                return { _startPosition: 1 };
            };
            cfg.tileScalingMode = 'inside';

            const tile = new Tile(cfg);
            tile.saveOptions(cfg);
            tile.getItemsContainer = () => ({
                getBoundingClientRect() {
                    return {};
                }
            });

            tile._setHoveredItemPosition(fakeEvent, fakeItem);

            assert.strictEqual(fakeItem.fixedPositionStyle, '_startPosition: 1px;');
            assert.strictEqual(tile._animatedItem, fakeItem);
            assert.strictEqual(tile._animatedItemTargetPosition, '_positionInDocument: 1px;');
            assert.isFalse(fakeItem.canShowActions);
        });
    });
});
