import {View} from 'Controls/list';
import {assert} from 'chai';

describe('Controls/list:View', () => {
    describe('EditInPlace', () => {
        describe('Public API', () => {
            [
                ['beginEdit', false, true],
                ['beginEdit', true, false],
                ['beginAdd', false, true],
                ['beginAdd', true, false],
                ['cancelEdit', false, true],
                ['cancelEdit', true, false],
                ['commitEdit', false, true],
                ['commitEdit', true, false]
            ].forEach(([methodName, readOnly, expectedIsSuccessful]) => {
                it(`${methodName}, readOnly: ${readOnly}`, async () => {
                    const list = new View();

                    let isSuccessful = null;
                    list.saveOptions({readOnly});

                    list._children = {
                        listControl: {
                            beginEdit:  () => Promise.resolve(),
                            beginAdd:   () => Promise.resolve(),
                            cancelEdit: () => Promise.resolve(),
                            commitEdit: () => Promise.resolve(),
                        }
                    };

                    const result = list[methodName]({}).then(() => {
                        isSuccessful = true;
                    }).catch(() => {
                        isSuccessful = false;
                    });
                    assert.instanceOf(result, Promise);

                    await result;

                    if (expectedIsSuccessful) {
                        assert.isTrue(isSuccessful);
                    } else {
                        assert.isFalse(isSuccessful);
                    }
                });
            });
        });
    });
});
