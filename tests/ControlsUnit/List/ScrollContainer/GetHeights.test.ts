import { getItemsHeightsData } from 'Controls/_baseList/ScrollContainer/GetHeights';
import {assert} from 'chai';

describe('getItemsHeightsData', () => {
    let isNode;
    let createElement = (hidden: boolean) => {
        return {
            classList: {
                contains: () => hidden
            },
            getBoundingClientRect: () => {
                return {
                    height: 100
                }
            }
        }
    }
    before(() => {
        isNode = typeof document === 'undefined';
            if (isNode) {
                global.window = {
                    getComputedStyle: () => {}
                };
            }
    });
    it('getItemsHeightsData', () => {
        let container = {
            children: [true, true, false, false, false].map(createElement)
        }
        assert.deepEqual(getItemsHeightsData(container as any as HTMLElement).itemsHeights, [100, 100, 100]);
        assert.deepEqual(getItemsHeightsData(container as any as HTMLElement).itemsOffsets, [0, 100, 200]);
    });

    it('getItemsHeightsData useQuerySelector', () => {
        let container = {
            children: [],
            querySelectorAll: () => {
                return [true, true, false, false, false].map(createElement)
            }
        }
        assert.deepEqual(getItemsHeightsData(container as any as HTMLElement, true).itemsHeights, [100, 100, 100]);
        assert.deepEqual(getItemsHeightsData(container as any as HTMLElement, true).itemsOffsets, [0, 100, 200]);
    });
    after(() => {
        if (isNode) {
            global.window = undefined;
        }
    });
});
