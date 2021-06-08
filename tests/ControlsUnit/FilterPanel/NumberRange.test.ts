import {NumberRangeEditor} from 'Controls/filterPanel';
import {assert} from 'chai';

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

        it('minValue is less than maxValue', () => {
            numberRangeEditor._maxValue = 5;
            numberRangeEditor._handleMinValueChanged(event, 1);
            assert.equal(numberRangeEditor._minValue, 1);
        });

        it('minValue is bigger than maxValue', () => {
            numberRangeEditor._handleInputCompleted(event, 16);
            assert.equal(numberRangeEditor._minValue, 1);
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
        numberRangeEditor._notify = () => {
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
});
