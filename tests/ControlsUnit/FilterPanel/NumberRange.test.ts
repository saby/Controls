import {NumberRangeEditor} from 'Controls/filterPanel';
import {assert} from 'chai';

describe('Controls/filterPanel:NumberRangeEditor', () => {

    describe('_handleInputCompleted', () => {
        const numberRangeEditor = new NumberRangeEditor({});
        let changesNotified = false;
        let textValue = null;
        numberRangeEditor._children = {
            numberRangeValidate: {
                validate: () => {}
            }
        };
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
});
