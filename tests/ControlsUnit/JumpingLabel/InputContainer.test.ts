import {deepStrictEqual} from "assert";
import InputContainer from 'Controls/_jumpingLabel/InputContainer';

describe('Controls/_jumpingLabel/InputContainer', () => {
    describe('_setShowFromAbove', () => {
        [{
            value: 0,
            result: true
        }, {
            value: null,
            result: false
        }, {
            value: '0',
            result: true
        }, {
            value: undefined,
            result: false
        }, {
            value: '',
            result: false
        }].forEach((item) => {
            it('_showFromAbove after use _setShowFromAbove', () => {
                const inputContainer = new InputContainer();
                inputContainer._setShowFromAbove({value: item.value});
                const showFromAbove = inputContainer._showFromAbove;
                deepStrictEqual(showFromAbove, item.result);
            });
            it('_showFromAbove after use _setShowFromAbove on the _beforeMount', () => {
                const inputContainer = new InputContainer();
                inputContainer._beforeMount({value:item.value})
                const showFromAbove = inputContainer._showFromAbove;
                deepStrictEqual(showFromAbove, item.result);
            });
            it('_showFromAbove after use _setShowFromAbove on the _beforeUpdate', () => {
                const inputContainer = new InputContainer();
                inputContainer._options = {value:'someValue'};
                inputContainer._beforeUpdate({value:item.value})
                const showFromAbove = inputContainer._showFromAbove;
                deepStrictEqual(showFromAbove, item.result);
            });
        });
    });
});
