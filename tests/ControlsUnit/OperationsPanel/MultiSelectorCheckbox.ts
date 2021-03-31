import {MultiSelectorCheckbox} from 'Controls/operations';
import {assert} from 'chai';

function getMultiSelectorCheckbox(options): MultiSelectorCheckbox {
    const checkbox = new MultiSelectorCheckbox(options);
    checkbox.saveOptions(options);
    return checkbox;
}

const checkboxCheckedOptions = {
    isAllSelected: true,
    selectedKeys: [null]
};

const checkboxNotCheckedOptions = {
    isAllSelected: false,
    selectedKeys: []
};

const checkboxPartialCheckedOptions = {
    selectedKeysCount: 10,
    selectedKeys: [1],
    isAllSelected: false
};

describe('Controls/_operations/MultiSelector/Checkbox', () => {

    describe('Lifecycle hooks', () => {

        describe('_beforeMount', () => {
            const checkbox = getMultiSelectorCheckbox({});

            it('checkbox checked', () => {
                checkbox._beforeMount(checkboxCheckedOptions);
                assert.isTrue(checkbox._checkboxValue);
            });

            it('checkbox partial checked', () => {
                checkbox._beforeMount(checkboxPartialCheckedOptions);
                assert.isNull(checkbox._checkboxValue);
            });

            it('checkbox not checked', () => {
                checkbox._beforeMount(checkboxNotCheckedOptions);
                assert.isFalse(checkbox._checkboxValue);
            });
        });

        describe('_beforeUpdate', () => {
            const checkbox = getMultiSelectorCheckbox({});

            it('checkbox checked', () => {
                checkbox._beforeUpdate(checkboxCheckedOptions);
                assert.isTrue(checkbox._checkboxValue);
            });

            it('checkbox partial checked', () => {
                checkbox._beforeUpdate(checkboxPartialCheckedOptions);
                assert.isNull(checkbox._checkboxValue);
            });

            it('checkbox not checked', () => {
                checkbox._beforeUpdate(checkboxNotCheckedOptions);
                assert.isFalse(checkbox._checkboxValue);
            });
        });

        describe('_onCheckBoxClick', () => {
            let checkbox;
            let actionName;

            beforeEach(() => {
                checkbox = getMultiSelectorCheckbox({});
                checkbox._notify = (event, eventArgs) => {
                    actionName = eventArgs[0];
                };
            });

            afterEach(() => {
                actionName = undefined;
            });

            it('checked checkbox readOnly click', () => {
                checkbox._checkboxValue = true;
                checkbox._onCheckBoxClick();
                assert.isUndefined(actionName);
            });

            it('checked checkbox click', () => {
                checkbox._checkboxValue = true;
                checkbox._onCheckBoxClick();
                assert.equal(actionName, 'unselectAll');
            });

            it('checked not checkbox click', () => {
                checkbox._checkboxValue = false;
                checkbox._onCheckBoxClick();
                assert.equal(actionName, 'selectAll');
            });

            it('checked partial checkbox click', () => {
                checkbox._checkboxValue = null;
                checkbox._onCheckBoxClick();
                assert.equal(actionName, 'unselectAll');
            });
        });

    });

});
