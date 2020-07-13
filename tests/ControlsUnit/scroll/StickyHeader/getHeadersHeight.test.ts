import {getStickyHeadersHeight} from 'Controls/scroll';

describe('Controls/scroll/getStickyHeadersHeight', function() {
    it('should return proper height', () => {
        const
            POSITION = 'top',
            FIXED_TYPE = '',
            HEIGHT = 20,
            controllerFn = sinon.stub().returns(HEIGHT);
        const element = {
            closest: () => {
                return {
                    controlNodes: [{
                        control: {
                            getHeadersHeight: () => 10
                        }
                    }, {
                        control: {
                            _moduleName: 'Controls/scroll:Container',
                            getHeadersHeight: controllerFn
                        }
                    }, {
                        control: {
                            getHeadersHeight: () => 30
                        }
                    }]
                };
            }
        }
        assert.strictEqual(getStickyHeadersHeight(element, POSITION, FIXED_TYPE), HEIGHT);
        sinon.assert.calledWith(controllerFn, POSITION, FIXED_TYPE);

    });
});
