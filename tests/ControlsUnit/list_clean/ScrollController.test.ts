import { assert } from 'chai';
import { spy } from 'sinon';
import { Collection } from 'Controls/display';
import { RecordSet } from 'Types/collection';
import { ScrollController } from 'Controls/list';
import * as Env from 'Env/Env';
import * as sinon from 'sinon';

describe('Controls/list_clean/ScrollController', () => {
    const items = new RecordSet({
        rawData: [],
        keyProperty: 'key'
    });
    describe('constructor', () => {
        it('needScrollCalculation === true.', () => {
            const collection = new Collection({
                collection: items
            });
            const setViewIteratorSpy = spy(collection, 'setViewIterator');
            const controller = new ScrollController({
                collection,
                virtualScrollConfig: {},
                useNewModel: true,
                needScrollCalculation: true
            });

            assert.isTrue(setViewIteratorSpy.called);
        });
        it('needScrollCalculation === false.', () => {
            const collection = new Collection({
                collection: items
            });
            const setViewIteratorSpy = spy(collection, 'setViewIterator');
            const controller = new ScrollController({
                collection,
                virtualScrollConfig: {},
                useNewModel: true,
                needScrollCalculation: false
            });

            assert.isFalse(setViewIteratorSpy.called);
        });
    });

    describe('update', () => {
        it('needScrollCalculation === true.', () => {
            const collection = new Collection({
                collection: items
            });
            const controller = new ScrollController({
                collection,
                virtualScrollConfig: {},
                useNewModel: true,
                needScrollCalculation: true
            });
            const newCollection = new Collection({
                collection: items
            });
            const setViewIteratorSpy = spy(newCollection, 'setViewIterator');
            controller.update({
                options: {
                    collection: newCollection,
                    virtualScrollConfig: {},
                    useNewModel: true,
                    needScrollCalculation: false
                },
                params: {}
            });
            assert.isFalse(setViewIteratorSpy.called);
        });
        it('needScrollCalculation === false.', () => {
            const collection = new Collection({
                collection: items
            });
            const controller = new ScrollController({
                collection,
                virtualScrollConfig: {},
                useNewModel: true,
                needScrollCalculation: false
            });
            const newCollection = new Collection({
                collection: items
            });
            const setViewIteratorSpy = spy(newCollection, 'setViewIterator');
            controller.update({
                options: {
                    collection: newCollection,
                    virtualScrollConfig: {},
                    useNewModel: true,
                    needScrollCalculation: true
                }
            });
            assert.isTrue(setViewIteratorSpy.called);
        });
    });

    describe('attachLoadTopTriggerToNull', () => {
        describe('mount', () => {
            it('attachLoadTopTriggerToNull === true', () => {
                const collection = new Collection({
                    collection: items
                });
                const controller = new ScrollController({
                    collection,
                    virtualScrollConfig: {},
                    needScrollCalculation: false,
                    attachLoadTopTriggerToNull: true
                });
                let result = controller.update({
                    options: {
                        collection,
                        virtualScrollConfig: {},
                        needScrollCalculation: false,
                        attachLoadTopTriggerToNull: true
                    },
                    params: {clientHeight: 100, scrollHeight: 300, scrollTop: 0}
                });

                assert.strictEqual(result.triggerOffset.top, 0);
            });
            it('attachLoadTopTriggerToNull === false', () => {
                const collection = new Collection({
                    collection: items
                });
                const controller = new ScrollController({
                    collection,
                    virtualScrollConfig: {},
                    needScrollCalculation: false,
                    attachLoadTopTriggerToNull: false
                });

                let result = controller.update({
                    options: {
                        collection,
                        virtualScrollConfig: {},
                        needScrollCalculation: false,
                        attachLoadTopTriggerToNull: false
                    }, params: {clientHeight: 100, scrollHeight: 300, scrollTop: 0}
                });

                assert.strictEqual(result.triggerOffset.top, 30);
            });
        });
        describe('update', () => {
            it('attachLoadTopTriggerToNull === true -> false', () => {
                const collection = new Collection({
                    collection: items
                });
                let options = {
                    collection,
                    virtualScrollConfig: {},
                    needScrollCalculation: false,
                    attachLoadTopTriggerToNull: true
                };
                const controller = new ScrollController(options);

                let result = controller.update({
                    options: {
                        collection,
                        virtualScrollConfig: {},
                        needScrollCalculation: false,
                        attachLoadTopTriggerToNull: false
                    },
                    params: {clientHeight: 100, scrollHeight: 300, scrollTop: 0}
                });


                assert.strictEqual(result.triggerOffset.top, 30);
            });
        });
    });
    describe('inertialScrolling', () => {
        let clock;
        beforeEach(() => {
            Env.detection.isMobileIOS = true;
            clock = sinon.useFakeTimers();
        });

        afterEach(() => {
            if (typeof window === 'undefined') {
                Env.detection.isMobileIOS = undefined;
            } else {
                Env.detection.isMobileIOS = false;
            }
            clock.restore();
        });
        const collection = new Collection({
            collection: items
        });
        let options = {
            collection,
            virtualScrollConfig: {},
            needScrollCalculation: false
        };
        const controller = new ScrollController(options);

        it('inertialScrolling created', () => {
            assert.isOk(controller._inertialScrolling);
        });
        it('callAfterScrollStopped', () => {

            let callbackCalled = false;
            let callback = () => {
                callbackCalled = true;
            };
            controller.callAfterScrollStopped(callback);
            assert.isTrue(callbackCalled, 'callback must be called');
            callbackCalled = false;

            controller.scrollPositionChange({scrollTop: 0, scrollHeight: 100, clientHeight: 50}, false);
            controller.callAfterScrollStopped(callback);
            assert.isFalse(callbackCalled, 'callback must be called with delay');
            clock.tick(101);
            assert.isTrue(callbackCalled, 'callback must be called');
        });
    });
});
