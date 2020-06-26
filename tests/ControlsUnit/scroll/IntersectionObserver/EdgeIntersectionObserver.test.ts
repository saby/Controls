import EdgeIntersectionObserver from 'Controls/_scroll/IntersectionObserver/EdgeIntersectionObserver';

describe('Controls/scroll:EdgeIntersectionObserverContainer', () => {
    let component;
    beforeEach(() => {
        component = {
            getInstanceId: () => {
                return 'instId'
            },
            _notify: sinon.fake()
        }
    })
    describe('constructor', () => {
        it('should initialize observers', () => {
            const observer = new EdgeIntersectionObserver(
                component, () => {}, 'topTrigger', 'bottomTrigger', );

            sinon.assert.calledTwice(component._notify);
            sinon.assert.alwaysCalledWith(component._notify, 'intersectionObserverRegister');

        });
    });

    describe('_observeHandler', () => {
        [{
            entry: {
                target: 'topTrigger',
                isIntersecting: true
            },
            result: 'topIn'
        }, {
            entry: {
                target: 'topTrigger',
                isIntersecting: false
            },
            result: 'topOut'
        }, {
            entry: {
                target: 'bottomTrigger',
                isIntersecting: true
            },
            result: 'bottomIn'
        }, {
            entry: {
                target: 'bottomTrigger',
                isIntersecting: false
            },
            result: 'bottomOut'
        }].forEach((test) => {
            it(`should generate "${test.result}" event`, () => {
                const observer = new EdgeIntersectionObserver(
                    component, () => {}, 'topTrigger', 'bottomTrigger', );

                sinon.stub(observer, '_handler');
                observer._observeHandler({nativeEntry: test.entry});
                sinon.assert.calledWith(observer._handler, test.result);
                sinon.restore();
            });
        })
    });

    describe('destroy', () => {
        it('should destroy all objects', () => {
            const observer = new EdgeIntersectionObserver(
                component, () => {}, 'topTrigger', 'bottomTrigger', );

            observer.destroy();

            sinon.assert.calledWith(component._notify, 'intersectionObserverUnregister');
            assert.isNull(observer._component);
            assert.isNull(observer._topTriggerElement);
            assert.isNull(observer._bottomTriggerElement);
            assert.isNull(observer._handler);
        });
    });
});
