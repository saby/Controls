import {assert} from 'chai';
import {fake, SinonSpy} from 'sinon';
import { SyntheticEvent } from 'UICommon/Events';
import {__ChangeEventController} from 'Controls/input';

describe('Controls/input:__ChangeEventController', () => {
    let handler: SinonSpy;
    let inst: __ChangeEventController;
    const currentDisplayValue: string = '';
    const newDisplayValue: string = 'test';
    const focusEvent: SyntheticEvent<FocusEvent> = new SyntheticEvent<FocusEvent>({} as FocusEvent);
    const keyboardEventEnter: SyntheticEvent<KeyboardEvent> = new SyntheticEvent<KeyboardEvent>({
        key: 'Enter'
    } as KeyboardEvent);
    const keyboardEventSpace: SyntheticEvent<KeyboardEvent> = new SyntheticEvent<KeyboardEvent>({
        code: 'Space'
    } as KeyboardEvent);

    beforeEach(() => {
        handler = fake();
        inst = new __ChangeEventController(currentDisplayValue, handler);
    });

    it('Вызован обработчик после ухода фокуса у input', () => {
        inst.blurHandler(focusEvent, {
            tag: 'input',
            model: {
                displayValue: newDisplayValue
            }
        });
        assert.isTrue(handler.called);
    });
    it('Вызован обработчик после ухода фокуса у textarea', () => {
        inst.blurHandler(focusEvent, {
            tag: 'textarea',
            model: {
                displayValue: newDisplayValue
            }
        });
        assert.isTrue(handler.called);
    });
    it('Вызован обработчик после нажатия на Enter у input', () => {
        inst.keyDownHandler(keyboardEventEnter, {
            tag: 'input',
            model: {
                displayValue: newDisplayValue
            }
        });
        assert.isTrue(handler.called);
    });
    it('Не вызован обработчик после нажатия на Enter у textarea', () => {
        inst.keyDownHandler(keyboardEventEnter, {
            tag: 'textarea',
            model: {
                displayValue: newDisplayValue
            }
        });
        assert.isFalse(handler.called);
    });
    it('Не вызован обработчик после нажатия на Space у input', () => {
        inst.keyDownHandler(keyboardEventSpace, {
            tag: 'input',
            model: {
                displayValue: newDisplayValue
            }
        });
        assert.isFalse(handler.called);
    });
    it('Не вызован обработчик после нажатия на Space у textarea', () => {
        inst.keyDownHandler(keyboardEventSpace, {
            tag: 'textarea',
            model: {
                displayValue: newDisplayValue
            }
        });
        assert.isFalse(handler.called);
    });
    it('Не вызван обработчик после фиксации текущего значение и ухода фокуса у input', () => {
        inst.fixed(newDisplayValue);
        inst.blurHandler(focusEvent, {
            tag: 'input',
            model: {
                displayValue: newDisplayValue
            }
        });
        assert.isFalse(handler.called);
    });
    it('Не вызван обработчик после фиксации текущего значение и ухода фокуса у textarea', () => {
        inst.fixed(newDisplayValue);
        inst.blurHandler(focusEvent, {
            tag: 'textarea',
            model: {
                displayValue: newDisplayValue
            }
        });
        assert.isFalse(handler.called);
    });
});
