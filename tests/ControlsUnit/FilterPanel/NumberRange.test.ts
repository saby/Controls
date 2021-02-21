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
});
