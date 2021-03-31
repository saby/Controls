import {assert} from 'chai';
import {Field, TextViewModel} from 'Controls/input';
import WorkWithSelection from 'Controls/_input/resources/Field/WorkWithSelection';

describe('Controls/input:Field', () => {
    let ctrl: Field;
    let model;
    const name = 'field';
    beforeEach(() => {
        ctrl = new Field({});
        ctrl._options = {name};
        ctrl._children[name] = {
            setSelectionRange(start: number, end: number): void {
                this.selectionStart = start;
                this.selectionEnd = end;
            }
        };
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
        it('The selection is saved to the model.', (done) => {
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
        it('The selection is not saved to the model because control is destroyed.', (done) => {
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
        it('Select event raised before synchronize new selection value from model.', () => {
            model.value = '1234567890';
            ctrl._beforeMount({model});

            const field = ctrl._getField();
            const target = {
                selectionStart: model.value.length,
                selectionEnd: model.value.length
            };
            const isFieldFocusedOriginal = WorkWithSelection.isFieldFocused;
            WorkWithSelection.isFieldFocused = () => true;
            ctrl._focusHandler({
                target,
                nativeEvent: {
                    target
                }
            });
            ctrl.setSelectionRange(0, 7);
            // Отстрельнуло после фокуса
            ctrl._selectHandler();
            // После установки селекшена
            ctrl._selectHandler();
            // Это баг, из-за которого стреляет лишний раз, см FixBugs
            ctrl._selectHandler();

            assert.deepEqual(model.selection, {
                start: 0,
                end: 7
            });

            assert.equal(field.selectionStart, 0);
            assert.equal(field.selectionEnd, 7);
            WorkWithSelection.isFieldFocused = isFieldFocusedOriginal;
        });
    });
});
