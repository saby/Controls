import {describe, it, beforeEach, afterEach} from 'mocha';
import {assert} from 'chai';
import {stub, restore} from 'sinon';
import Marker from 'Controls/_tabs/Buttons/Marker';

describe('Controls/_tabs/Buttons/Marker', () => {

    beforeEach(() => {
        stub(Marker, 'getComputedStyle').returns({ borderLeftWidth: 0 });
    });

    afterEach(() => {
        restore();
    });

    const elements: HTMLElement[] = [{
            getBoundingClientRect(): DOMRect {
                return { width: 10, left: 20 } as DOMRect;
            }
        } as HTMLElement, {
            getBoundingClientRect(): DOMRect {
                return { width: 30, left: 40 } as DOMRect;
            }
        } as HTMLElement
    ];

    const baseElement: HTMLElement = {
        getBoundingClientRect(): DOMRect {
            return { width: 300, left: 10 } as DOMRect;
        }
    } as HTMLElement;

    it('should return correct width and left after initialisation.', () => {
        const marker: Marker = new Marker();

        assert.isFalse(marker.isInitialized(),
            'Wrong value returned isInitialized() method if items is unset');

        marker.updatePosition(elements, baseElement);

        assert.isTrue(marker.isInitialized(),
            'Wrong value returned isInitialized() method if selected item is set');

        assert.isUndefined(marker.getWidth(), 'Wrong width if selected item is unset');
        assert.isUndefined(marker.getLeft(), 'Wrong left if selected item is unset');

        marker.setSelectedIndex(0);

        assert.strictEqual(marker.getWidth(), 10, 'Wrong width if selected item is set');
        assert.strictEqual(marker.getLeft(), 10,'Wrong left if selected item is set');
    });

    describe('setSelectedIndex', () => {
        it('should\'t update version if selectedIndex changed', () => {
            const marker: Marker = new Marker();
            marker.updatePosition(elements, baseElement);
            marker.setSelectedIndex(0);
            const version: number = marker.getVersion();
            marker.setSelectedIndex(0);
            assert.strictEqual(marker.getVersion(), version);
        });

        it('should update model and version if selectedIndex changed', () => {
            const marker: Marker = new Marker();
            marker.updatePosition(elements, baseElement);
            marker.setSelectedIndex(0);

            const version: number = marker.getVersion();
            marker.setSelectedIndex(1);

            assert.notEqual(marker.getVersion(), version);
            assert.strictEqual(marker.getWidth(), 30, 'Wrong width');
            assert.strictEqual(marker.getLeft(), 30,'Wrong left');
        });

    });

});
