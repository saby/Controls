import { getItemsHeightsData } from 'Controls/_list/ScrollContainer/GetHeights';
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
    after(() => {
        if (isNode) {
            global.window = undefined;
        }
    });
});