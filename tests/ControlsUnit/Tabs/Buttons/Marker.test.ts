import {assert} from 'chai';
import {stub} from 'sinon';
import Marker from 'Controls/_tabs/Buttons/Marker';

describe('Controls/_tabs/Buttons/Marker', () => {

    it('should return correct width and left after initialisation.', () => {
        const marker: Marker = new Marker();

        stub(Marker, 'getComputedStyle').returns({ borderLeftWidth: 0 });

        assert.isFalse(marker.isInitialized(),
            'Wrong value returned isInitialized() method if items is unset');

        marker.updatePosition([{
                getBoundingClientRect(): DOMRect {
                    return { width: 10, left: 20 } as DOMRect;
                }
            } as HTMLElement, {
                getBoundingClientRect(): DOMRect {
                    return { width: 30, left: 40 } as DOMRect;
                }
            } as HTMLElement],
            {
                getBoundingClientRect(): DOMRect {
                    return { width: 300, left: 10 } as DOMRect;
                }
            } as HTMLElement);

        assert.isTrue(marker.isInitialized(),
            'Wrong value returned isInitialized() method if selected item is set');

        assert.isUndefined(marker.getWidth(), 'Wrong width if selected item is unset');
        assert.isUndefined(marker.getLeft(), 'Wrong left if selected item is unset');

        marker.setSelectedIndex(0);

        assert.strictEqual(marker.getWidth(), 10, 'Wrong width if selected item is set');
        assert.strictEqual(marker.getLeft(), 10,'Wrong left if selected item is set');

        marker.setSelectedIndex(1);

        assert.strictEqual(marker.getWidth(), 30, 'Wrong width if selected item is set');
        assert.strictEqual(marker.getLeft(), 30,'Wrong left if selected item is set');

    });

});
