import {afterEach, beforeEach, describe, it} from 'mocha';
import {assert} from 'chai';
import {restore, stub} from 'sinon';
import Marker, {AUTO_ALIGN, IMarkerElement} from 'Controls/_tabs/Buttons/Marker';

describe('Controls/_tabs/Buttons/Marker', () => {

    beforeEach(() => {
        stub(Marker, 'getComputedStyle').returns({ borderLeftWidth: 0, borderRightWidth: 0 });
    });

    afterEach(() => {
        restore();
    });

    const elements: IMarkerElement[] = [{
            element: {
                getBoundingClientRect(): DOMRect {
                    return { width: 10, left: 20, right: 0 } as DOMRect;
                }
            } as HTMLElement
        }, {
            element: {
                getBoundingClientRect(): DOMRect {
                    return {width: 30, left: 40, right: 0} as DOMRect;
                }
            } as HTMLElement
        }
    ];

    const baseElement: HTMLElement = {
        getBoundingClientRect(): DOMRect {
            return { width: 300, left: 10, right: 0 } as DOMRect;
        }
    } as HTMLElement;

    it('should return correct width and offset after initialisation.', () => {
        const marker: Marker = new Marker();

        assert.isFalse(marker.isInitialized(),
            'Wrong value returned isInitialized() method if items is unset');

        marker.updatePosition(elements, baseElement);

        assert.isTrue(marker.isInitialized(),
            'Wrong value returned isInitialized() method if selected item is set');

        assert.isUndefined(marker.getWidth(), 'Wrong width if selected item is unset');
        assert.isUndefined(marker.getOffset(), 'Wrong offset if selected item is unset');

        marker.setSelectedIndex(0);

        assert.strictEqual(marker.getWidth(), 10, 'Wrong width if selected item is set');
        assert.strictEqual(marker.getOffset(), 10,'Wrong offset if selected item is set');
    });

    describe('setSelectedIndex', () => {
        it('should\'t update version if selectedIndex changed', () => {
            const marker: Marker = new Marker();
            let changed: boolean;
            marker.updatePosition(elements, baseElement);
            changed = marker.setSelectedIndex(0)
            assert.isTrue(changed);
            const version: number = marker.getVersion();
            changed = marker.setSelectedIndex(0)
            assert.isFalse(changed);
            assert.strictEqual(marker.getVersion(), version);
        });

        it('should update model and version if selectedIndex changed', () => {
            const marker: Marker = new Marker();
            let changed: boolean;
            marker.updatePosition(elements, baseElement);
            marker.setSelectedIndex(0);

            const version: number = marker.getVersion();
            marker.setSelectedIndex(1);

            assert.notEqual(marker.getVersion(), version);
            assert.strictEqual(marker.getWidth(), 30, 'Wrong width');
            assert.strictEqual(marker.getOffset(), 30,'Wrong offset');
        });

    });

    describe('setAlign', () => {
        it('should update align', () => {
            const marker: Marker = new Marker();
            marker.updatePosition(elements, baseElement);
            marker.setSelectedIndex(0);

            marker.setAlign(AUTO_ALIGN.right);
            assert.strictEqual(marker.getOffset(), 0,'Wrong left. align = right');

            marker.setAlign(AUTO_ALIGN.auto);
            assert.strictEqual(marker.getOffset(), 10,'Wrong left. align = auto');

        });
    });

});
