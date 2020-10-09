import {assert} from 'chai';
import {Field, TextViewModel} from 'Controls/input';

describe('Controls/input:Field', () => {
    let ctrl: Field;
    let model;
    const name = 'field';
    beforeEach(() => {
        ctrl = new Field({});
        ctrl._options = {name};
        ctrl._children[name] = {};
        model = new TextViewModel({}, '');
    });
    it('Public method paste.', () => {
        let actual;
        ctrl._handleInput = (...args) => {
            actual = args;
        };
        model.value = '';
        ctrl._beforeMount({model});
        ctrl.paste('test paste');

        assert.deepEqual(actual, [{
            before: '',
            insert: 'test paste',
            delete: '',
            after: ''
        }, 'insert']);
    });
    describe('hasAutoFill', () => {
        let eventName;
        beforeEach(() => {
            eventName = null;
            ctrl._notifyEvent = function(name) {
                eventName = name;
            };
        });
        it('Yes', () => {
            model.value = '';
            ctrl._beforeMount({model});
            ctrl._getField().value = 'fill';
            ctrl._afterMount();
            assert.deepEqual(eventName, 'valueChanged');
        });
        it('No', () => {
            model.value = 'fill';
            ctrl._beforeMount({model});
            ctrl._getField().value = 'fill';
            ctrl._afterMount();
            assert.deepEqual(eventName, null);
        });
    });
    describe('Click event', () => {
        it('The selection is saved to the model.', function(done) {
            model.value = '1234567890';
            ctrl._beforeMount({model});

            ctrl._getField().selectionStart = 10;
            ctrl._getField().selectionEnd = 10;
            ctrl._clickHandler();

            setTimeout(() => {
                assert.deepEqual(ctrl._model.selection, {
                    start: 10,
                    end: 10
                });
                done();
            }, 100);
        });
        it('The selection is not saved to the model because control is destroyed.', function(done) {
            model.value = '1234567890';
            ctrl._beforeMount({model});

            ctrl._getField().selectionStart = 5;
            ctrl._getField().selectionEnd = 5;
            ctrl._destroyed = true;
            ctrl._clickHandler();

            setTimeout(() => {
                assert.deepEqual(ctrl._model.selection, {
                    start: 10,
                    end: 10
                });
                done();
            }, 100);
        });
    });
});
