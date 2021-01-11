import {assert} from 'chai';
import {DragScrollController as DragScroll} from 'Controls/columnScroll';

describe('Controls/grid_clean/Controllers/DragScroll', () => {
    it('should not prevent default on touch start', () => {
        const dragScroll = new DragScroll({});
        const event = {
            preventDefault: () => {throw Error('preventDefault shouldn\'t be called.')},
            nativeEvent: {
                touches: [{
                    clientX: 0,
                    clientY: 0
                }]
            },
            target: {
                closest: (selector) => selector === 'controls-DragNDrop__notDraggable' ? true : false,
            }
        };
        assert.doesNotThrow(() => {
            const isStarted = dragScroll.onViewTouchStart(event);
            assert.isTrue(isStarted);
        });
    });
});
