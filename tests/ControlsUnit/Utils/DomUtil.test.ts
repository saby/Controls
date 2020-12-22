import {stub} from 'sinon';
import {assert} from 'chai';
import {DOMUtil} from 'Controls/sizeUtils';

function ClassList(): void {};
ClassList.prototype = [];
// @ts-ignore
ClassList.prototype.add = ClassList.prototype.push;

describe('Controls/sizeUtils:DOMUtil', () => {
    describe('Calculating sizes of DOM elements', () => {
        let isNode;
        let createElementStub;
        let appendChildStub;
        let removeChildStub;
        let getComputedStyleStub;

        function restoreAll(): void {
            createElementStub.restore();
            appendChildStub.restore();
            removeChildStub.restore();
            getComputedStyleStub.restore();
        }

        before(() => {
            isNode = typeof document === 'undefined';
            if (isNode) {
                global.document = {
                    body: {
                        appendChild: () => {},
                        removeChild: () => {}
                    },
                    createElement: () => {}
                };
                global.window = {
                    getComputedStyle: () => {}
                };
            }
        });

        beforeEach(() => {
            createElementStub = stub(document, 'createElement');
            const fakeChild = {
                style: {
                    position: 'static',
                    left: '0px',
                    top: '0px'
                },
                // @ts-ignore
                clientWidth: 123
            };
            const fakeElement = {
                clientWidth: 321,
                innerHTML: '',
                style: {
                    position: 'static',
                    left: '0px',
                    top: '0px'
                },
                // @ts-ignore
                classList: new ClassList(),
                setAttribute: () => {},
                getElementsByClassName: () => [fakeChild, fakeChild],
                appendChild: (child) => stub(),
                getBoundingClientRect: () => ({
                    width: 321,
                    height: 10,
                    top: 3,
                    right: 3,
                    bottom: 3,
                    left: 3
                })
            };
            // @ts-ignore
            createElementStub.withArgs('div').returns(fakeElement);
            appendChildStub = stub(document.body, 'appendChild');
            removeChildStub = stub(document.body, 'removeChild');
            getComputedStyleStub = stub(window, 'getComputedStyle');
            // @ts-ignore
            getComputedStyleStub.withArgs(fakeChild).returns({
                marginLeft: '2px',
                marginRight: '2px'
            });
        });

        after(() => {
            if (isNode) {
                global.document = undefined;
                global.window = undefined;
            }
        });

        // Метод должен правильно считать размеры элементов и отступы их родительского контейнера
        it ('getElementsWidth() should return array with sizes considering margins', () => {
            const result = DOMUtil.getElementsWidth(
                ['<div class="items-class">1</div>', '<div class="items-class">2</div>'],
                'items-class',
                true);
            restoreAll();
            assert.deepEqual(result, [127, 127]);
        });

        it ('getElementsWidth() should return array with sizes not considering margins', () => {
            const result = DOMUtil.getElementsWidth(
                ['<div class="items-class">1</div>', '<div class="items-class">2</div>'],
                'items-class',
                false);
            restoreAll();
            assert.deepEqual(result, [123, 123]);
        });

        it ('getWidthForCssClass() should return size not considering margins', () => {
            const result = DOMUtil.getWidthForCssClass('block-class');
            restoreAll();
            assert.deepEqual(result, 321);
        });
    });
});
