import {assert} from 'chai';
import {useFakeTimers} from 'sinon';

import { SyntheticEvent } from 'UICommon/Events';

import HoverFreeze, {IHoverFreezeOptions} from 'Controls/_list/Controllers/HoverFreeze';

// const + 1
const TEST_HOVER_FREEZE_TIMEOUT: number = 201;
const TEST_HOVER_UNFREEZE_TIMEOUT: number = 101;

function createFakeMouseEvent(clientX: number, clientY: number): SyntheticEvent {
    return {
        nativeEvent: {
            clientX,
            clientY
        }
    };
}

function mockViewConteainer(itemActionsHeight: number, hoverContainerRect: object): HTMLElement {
    return {
        querySelector: () => ({
            querySelector: () => ({
                offsetHeight: itemActionsHeight
            }),
            getBoundingClientRect: () => hoverContainerRect
        } as undefined as HTMLElement),
        querySelectorAll: (selector: string) => ([
            {
                closest: () => ({
                    querySelector: () => ({
                        offsetHeight: itemActionsHeight
                    })
                }),
                getBoundingClientRect: () => hoverContainerRect
            } as undefined as HTMLElement
        ])
    } as undefined as HTMLElement;
}

function mockStylesContainer(): HTMLElement {
    return {
        innerHTML: ''
    } as undefined as HTMLElement;
}

describe('Controls/list/HoverFreeze', () => {
    let cfg: IHoverFreezeOptions;
    let hoverContainerRect: {top: number, left: number, width: number, height: number};
    let itemActionsHeight: number;
    let clock: any;
    let hoverFreeze: HoverFreeze;
    let isFreezeHoverCallbackCalled: boolean;
    let isUnFreezeHoverCallbackCalled: boolean;

    before(() => {
        const isNode = typeof document === 'undefined';
        if (isNode) {
            global.getComputedStyle = () => ({});
        }
    });

    beforeEach(() => {
        isFreezeHoverCallbackCalled = false;
        isUnFreezeHoverCallbackCalled = false;
        clock = useFakeTimers();
        hoverContainerRect = {
            top: 25,
            left: 25,
            height: 30,
            width: 100
        };
        itemActionsHeight = 30;
    });

    afterEach(() => {
        clock.restore();
    });

    describe('startFreezeHoverTimeout', () => {
        beforeEach(() => {
            cfg = {
                viewContainer: mockViewConteainer(itemActionsHeight, hoverContainerRect),
                stylesContainer: mockStylesContainer(),
                uniqueClass: 'unique-class',
                measurableContainerSelector: 'measurable-container-selector',
                freezeHoverCallback: () => {
                    isFreezeHoverCallbackCalled = true;
                },
                unFreezeHoverCallback: () => {
                    isUnFreezeHoverCallbackCalled = true;
                }
            };
            hoverFreeze =  new HoverFreeze(cfg);
        });

        it('should start freeze timer', () => {
            hoverFreeze.startFreezeHoverTimeout('key_1', 0, 0);

            // until timer stops it must not be frozen
            assert.notEqual(hoverFreeze.getCurrentItemKey(), 'key_1');
            clock.tick(TEST_HOVER_FREEZE_TIMEOUT);
            assert.equal(hoverFreeze.getCurrentItemKey(), 'key_1');
        });

        it('should freeze only the last key', () => {
            hoverFreeze.startFreezeHoverTimeout('key_1', 0, 0);
            clock.tick(TEST_HOVER_FREEZE_TIMEOUT / 2);
            hoverFreeze.startFreezeHoverTimeout('key_2', 0, 0);
            clock.tick(TEST_HOVER_FREEZE_TIMEOUT / 2);
            hoverFreeze.startFreezeHoverTimeout('key_3', 0, 0);
            assert.notEqual(hoverFreeze.getCurrentItemKey(), 'key_3');

            // until timer stops it must not be frozen
            clock.tick(TEST_HOVER_FREEZE_TIMEOUT);
            assert.equal(hoverFreeze.getCurrentItemKey(), 'key_3');
        });

        it ('should call freezeHoverCallback', () => {
            hoverFreeze.startFreezeHoverTimeout('key_1', 0, 0);
            assert.isFalse(isFreezeHoverCallbackCalled);
            clock.tick(TEST_HOVER_FREEZE_TIMEOUT);
            assert.isTrue(isFreezeHoverCallbackCalled);
        });
    });

    describe('startUnfreezeHoverTimeout', () => {
        beforeEach(() => {
            cfg = {
                viewContainer: mockViewConteainer(itemActionsHeight, hoverContainerRect),
                stylesContainer: mockStylesContainer(),
                uniqueClass: 'unique-class',
                measurableContainerSelector: 'measurable-container-selector',
                freezeHoverCallback: () => {
                    isFreezeHoverCallbackCalled = true;
                },
                unFreezeHoverCallback: () => {
                    isUnFreezeHoverCallbackCalled = true;
                }
            };
            hoverFreeze =  new HoverFreeze(cfg);
        });

        it('should start unfreeze timer when cursor position is in bottom of the moveArea', () => {
            // mouse cursor position is in bottom of the moveArea
            const event = createFakeMouseEvent(100, 80);
            hoverFreeze.startFreezeHoverTimeout('key_1', 0, 0);
            clock.tick(TEST_HOVER_FREEZE_TIMEOUT);
            hoverFreeze.startUnfreezeHoverTimeout(event);

            // until timer stops it must not be unfrozen
            assert.equal(hoverFreeze.getCurrentItemKey(), 'key_1');
            clock.tick(TEST_HOVER_UNFREEZE_TIMEOUT);
            assert.equal(hoverFreeze.getCurrentItemKey(), null);
        });

        it('should not start unfreeze timer when cursor position is under the moveArea', () => {
            // mouse cursor position is under the moveArea
            const event = createFakeMouseEvent(100, 100);
            hoverFreeze.startFreezeHoverTimeout('key_1', 0, 0);
            clock.tick(TEST_HOVER_FREEZE_TIMEOUT);
            hoverFreeze.startUnfreezeHoverTimeout(event);

            // it must be unfrozen immediately
            assert.equal(hoverFreeze.getCurrentItemKey(), null);
        });

        it('should restart unfreeze timer', () => {
            // mouse cursor is moving right inside of the moveArea
            const event1 = createFakeMouseEvent(80, 60);
            const event2 = createFakeMouseEvent(90, 80);
            const event3 = createFakeMouseEvent(100, 80);
            hoverFreeze.startFreezeHoverTimeout('key_1', 0, 0);
            clock.tick(TEST_HOVER_FREEZE_TIMEOUT);
            hoverFreeze.startUnfreezeHoverTimeout(event1);
            clock.tick(TEST_HOVER_UNFREEZE_TIMEOUT / 2);
            hoverFreeze.startUnfreezeHoverTimeout(event2);
            clock.tick(TEST_HOVER_UNFREEZE_TIMEOUT / 2);
            hoverFreeze.startUnfreezeHoverTimeout(event3);

            // until timer stops it must not be unfrozen
            assert.equal(hoverFreeze.getCurrentItemKey(), 'key_1');
            clock.tick(TEST_HOVER_UNFREEZE_TIMEOUT);
            assert.equal(hoverFreeze.getCurrentItemKey(), null);
        });

        it ('should call unFreezeHoverCallback deferred when cursor position is in bottom of the moveArea', () => {
            hoverFreeze.startFreezeHoverTimeout('key_1', 0, 0);
            clock.tick(TEST_HOVER_FREEZE_TIMEOUT);

            const event = createFakeMouseEvent(100, 80);
            hoverFreeze.startUnfreezeHoverTimeout(event);
            assert.isFalse(isUnFreezeHoverCallbackCalled);
            clock.tick(TEST_HOVER_UNFREEZE_TIMEOUT);
            assert.isTrue(isUnFreezeHoverCallbackCalled);
        });

        it ('should call unFreezeHoverCallback deferred when cursor position is inside of current item', () => {
            hoverFreeze.startFreezeHoverTimeout('key_1', 0, 0);
            clock.tick(TEST_HOVER_FREEZE_TIMEOUT);

            const event = createFakeMouseEvent(100, hoverContainerRect.top + hoverContainerRect.height - 1);
            hoverFreeze.startUnfreezeHoverTimeout(event);
            assert.isFalse(isUnFreezeHoverCallbackCalled);
            clock.tick(TEST_HOVER_UNFREEZE_TIMEOUT);
            assert.isTrue(isUnFreezeHoverCallbackCalled);
        });

        it ('should call unFreezeHoverCallback immediately when cursor position is under the moveArea', () => {
            hoverFreeze.startFreezeHoverTimeout('key_1', 0, 0);
            clock.tick(TEST_HOVER_FREEZE_TIMEOUT);

            // mouse cursor position is under the moveArea
            const event = createFakeMouseEvent(100, 100);
            hoverFreeze.startUnfreezeHoverTimeout(event);
            assert.isTrue(isUnFreezeHoverCallbackCalled);
        });

        it ('should call unFreezeHoverCallback immediately when cursor position is rights of current item', () => {
            hoverFreeze.startFreezeHoverTimeout('key_1', 0, 0);
            clock.tick(TEST_HOVER_FREEZE_TIMEOUT);

            const event = createFakeMouseEvent(hoverContainerRect.left +  hoverContainerRect.width + 1, 54);
            hoverFreeze.startUnfreezeHoverTimeout(event);
            assert.isTrue(isUnFreezeHoverCallbackCalled);
        });

        it ('should call unFreezeHoverCallback immediately when cursor position is lefts of current item', () => {
            hoverFreeze.startFreezeHoverTimeout('key_1', 0, 0);
            clock.tick(TEST_HOVER_FREEZE_TIMEOUT);

            const event = createFakeMouseEvent(hoverContainerRect.left - 1, 54);
            hoverFreeze.startUnfreezeHoverTimeout(event);
            assert.isTrue(isUnFreezeHoverCallbackCalled);
        });

        it ('should call unFreezeHoverCallback immediately when cursor position is above of current item', () => {
            hoverFreeze.startFreezeHoverTimeout('key_1', 0, 0);
            clock.tick(TEST_HOVER_FREEZE_TIMEOUT);

            const event = createFakeMouseEvent(100, hoverContainerRect.top - 1);
            hoverFreeze.startUnfreezeHoverTimeout(event);
            assert.isTrue(isUnFreezeHoverCallbackCalled);
        });

        it ('should call unFreezeHoverCallback immediately when cursor position is under the moveArea', () => {
            hoverFreeze.startFreezeHoverTimeout('key_1', 0, 0);
            clock.tick(TEST_HOVER_FREEZE_TIMEOUT);

            // mouse cursor position is under the moveArea
            const event1 = createFakeMouseEvent(100, 80);
            const event2 = createFakeMouseEvent(45, 60);
            hoverFreeze.startUnfreezeHoverTimeout(event1);
            assert.isFalse(isUnFreezeHoverCallbackCalled);

            // Вышли за угол треугольника
            hoverFreeze.startUnfreezeHoverTimeout(event2);
            assert.isTrue(isUnFreezeHoverCallbackCalled);
        });
    });

    describe('virtualScroll', () => {
        it('should start freeze timer with correct start index', () => {
            const viewContainer = mockViewConteainer(itemActionsHeight, hoverContainerRect);
            cfg = {
                viewContainer,
                stylesContainer: mockStylesContainer(),
                uniqueClass: 'unique-class',
                measurableContainerSelector: 'measurable-container-selector',
                freezeHoverCallback: () => {
                    isFreezeHoverCallbackCalled = true;
                },
                unFreezeHoverCallback: () => {
                    isUnFreezeHoverCallbackCalled = true;
                }
            };
            hoverFreeze =  new HoverFreeze(cfg);
            const originalQuerySelectorAll = viewContainer.querySelectorAll;
            viewContainer.querySelectorAll = (selector: string) => {
                assert.equal(selector, ' .unique-class .controls-ListView__itemV:nth-child(51) ' +
                    '.measurable-container-selector,  .unique-class .controls-ListView__itemV:nth-child(51)');
                return originalQuerySelectorAll(selector);
            };
            hoverFreeze.startFreezeHoverTimeout('key_1', 150, 100);
            clock.tick(TEST_HOVER_FREEZE_TIMEOUT);
        });
    });
});
