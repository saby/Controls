import {NumberRangeEditor} from 'Controls/filterPanel';
import {assert} from 'chai';
import {StickyOpener} from 'Controls/popup';

describe('Controls/filterPanel:NumberRangeEditor', () => {

    describe('_handleInputCompleted', () => {
        const numberRangeEditor = new NumberRangeEditor({});
        let changesNotified = false;
        let textValue = null;
        const event = {
            target: {
                closest: () => {}
            }
        };
        numberRangeEditor._notify = (eventName, extendedValue) => {
            textValue = extendedValue[0].textValue;
            changesNotified = true;
        };

        numberRangeEditor._applyButtonSticky = new StickyOpener();

        it('minValue is null', () => {
            numberRangeEditor._maxValue = 5;
            numberRangeEditor._handleInputCompleted(event, 1);
            assert.equal(textValue, '');
            assert.isTrue(changesNotified);
        });

        it('minValue is 0', () => {
            numberRangeEditor._minValue = 0;
            numberRangeEditor._handleInputCompleted(event, 0);
            assert.equal(textValue, '0 - 5');
            assert.isTrue(changesNotified);
        });

        it('maxValue is less than minValue', () => {
            numberRangeEditor._minValue = 10;
            numberRangeEditor._maxValue = 1;
            numberRangeEditor._handleInputCompleted(event, 1);
            assert.equal(numberRangeEditor._minValue, 1);
            assert.equal(numberRangeEditor._maxValue, 10);
        });
    });

    describe('_handleMinValueChanged', () => {
        const numberRangeEditor = new NumberRangeEditor({});
        const event = {
            target: {
                closest: () => {}
            }
        };
        numberRangeEditor._applyButtonSticky = new StickyOpener();

        it('minValue is less than maxValue', () => {
            numberRangeEditor._maxValue = 5;
            numberRangeEditor._handleMinValueChanged(event, 1);
            assert.equal(numberRangeEditor._minValue, 1);
        });

        it('minValue is equal to maxValue', () => {
            numberRangeEditor._maxValue = 5;
            numberRangeEditor._handleMinValueChanged(event, 5);
            assert.equal(numberRangeEditor._minValue, 5);
        });

        it('minValue is bigger than maxValue', () => {
            numberRangeEditor._handleInputCompleted(event, 16);
            assert.equal(numberRangeEditor._minValue, 5);
        });
    });

    describe('_processPropertyValueChanged', () => {
        const numberRangeEditor = new NumberRangeEditor({});
        let changesNotified = false;
        const event = {
            target: {
                closest: () => {}
            }
        };
        numberRangeEditor._notifyPropertyValueChanged = () => {
            changesNotified = true;
        };
        it('minValue is bigger than maxValue', () => {
            numberRangeEditor._processPropertyValueChanged(event, [4, 3]);
            assert.isFalse(changesNotified);
        });

        it('minValue is less than maxValue', () => {
            numberRangeEditor._processPropertyValueChanged(event, [3, 4]);
            assert.isTrue(changesNotified);
        });
    });

    describe('_needNotifyChanges', () => {
        const numberRangeEditor = new NumberRangeEditor({});
        it('minValue is equal to maxValue', () => {
            const value = [1, 1];
            assert.isTrue(numberRangeEditor._needNotifyChanges(value));
        });
    });

    describe('_notifyPropertyValueChanged', () => {
        const numberRangeEditor = new NumberRangeEditor({});
        let value;
        numberRangeEditor._notify = (eventName, extendedValue) => {
            value = extendedValue[0].value;
        };

        it('extended value updated after input value changed', () => {
            const minValue = 1;
            const maxValue = 4;
            numberRangeEditor._handleMinValueChanged(null, minValue);
            numberRangeEditor._handleMaxValueChanged(null, maxValue);
            numberRangeEditor._notifyPropertyValueChanged();
            assert.deepEqual(value, [1, 4]);
        });
    });
});
