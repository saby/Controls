import InputRender from 'Controls/_lookup/BaseLookupView/InputRender';
import {assert} from 'chai';

function getInputRender(cfg: object = {}) {
    const render = new InputRender(cfg);
    render.saveOptions(cfg);
    render._children = {
        readOnlyField: 'readOnlyInput',
        input: 'input'
    };
    return render;
}

describe('LookupView/InputRender', () => {

    describe('_getReadOnlyField', () => {

        it('isInputVisible: true', () => {
            const render = getInputRender({
                isInputVisible: true
            });
            assert.equal(render._getReadOnlyField(), 'readOnlyInput');
        });

    });

});
