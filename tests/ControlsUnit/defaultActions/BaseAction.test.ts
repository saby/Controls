import {BaseAction} from 'Controls/actions';
import {assert} from 'chai';

describe('Controls/defaultActions:BaseAction', () => {
    const options = {
        id: 'id',
        icon: 'icon',
        iconStyle: 'iconStyle',
        title: 'title',
        order: 10,
        commandName: ''
    };

    beforeEach(() => {
    });

    it('onExecuteHandler', () => {
        let executeHandlerCalled = false;
        options.onExecuteHandler = () => {
            executeHandlerCalled = true;
        };
        const action = new BaseAction(options);
        action.execute();
        assert.isTrue(executeHandlerCalled);
    });
});
