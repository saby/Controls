import {NumberRangeEditor} from 'Controls/filterPanel';
import {assert} from 'chai';

describe('Controls/filterPanel:NumberRangeEditor', () => {

    describe('_handleInputCompleted', () => {
        const numberRangeEditor = new NumberRangeEditor({});
        let changesNotified = false;
        let textValue = null;
        numberRangeEditor._notify = (eventName, extendedValue) => {
            textValue = extendedValue[0].textValue;
            changesNotified = true;
        };

        it('minValue is null', () => {
            numberRangeEditor._maxValue = 5;
            numberRangeEditor._handleInputCompleted(null, 1);
            assert.equal(textValue, '');
            assert.isTrue(changesNotified);
        });

        it('minValue is 0', () => {
            numberRangeEditor._minValue = 0;
            numberRangeEditor._handleInputCompleted(null, 0);
            assert.equal(textValue, '0 - 5');
            assert.isTrue(changesNotified);
        });

        it('maxValue is less than minValue', () => {
            numberRangeEditor._minValue = 10;
            numberRangeEditor._maxValue = 1;
            numberRangeEditor._handleInputCompleted(null, 1);
            assert.equal(numberRangeEditor._minValue, 1);
            assert.equal(numberRangeEditor._maxValue, 10);
        });
    });

    describe('_handleMinValueChanged', () => {
        const numberRangeEditor = new NumberRangeEditor({});

        it('minValue is less than maxValue', () => {
            numberRangeEditor._maxValue = 5;
            numberRangeEditor._handleMinValueChanged(null, 1);
            assert.equal(numberRangeEditor._minValue, 1);
        });

        it('minValue is bigger than maxValue', () => {
            numberRangeEditor._handleInputCompleted(null, 16);
            assert.equal(numberRangeEditor._minValue, 1);
        });
    });

    describe('_notifyExtendedValue', () => {
        const numberRangeEditor = new NumberRangeEditor({});
        let changesNotified = false;
        numberRangeEditor._notify = () => {
            changesNotified = true;
        };
        it('minValue is bigger than maxValue', () => {
            numberRangeEditor._notifyExtendedValue([4, 3]);
            assert.isFalse(changesNotified);
        });

        it('minValue is less than maxValue', () => {
            numberRangeEditor._notifyExtendedValue([3, 4]);
            assert.isTrue(changesNotified);
        });
    });
});
