import {View} from 'Controls/filterPanel';
import {assert} from 'chai';

describe('Controls/filterPanel:View', () => {

    describe('_groupClick', () => {
        const viewControl = new View({});
        let itemToggled = false;
        const displayItem = {
            getContents: () => 'elem',
            toggleExpanded: () => { itemToggled = true; }
        };
        const clickEvent = {
            target: {
                closest: (text) => {
                    return text === '.controls-FilterViewPanel__group';
                }
            }
        };

        it('displayItem is expanded', () => {
            viewControl._collapsedGroups = ['elem'];

            viewControl._groupClick(null, displayItem, clickEvent);
            assert.deepEqual(viewControl._collapsedGroups, []);
            assert.isTrue(itemToggled);
        });

        it('collapsedGroups includes item contents', () => {
            itemToggled = false;
            viewControl._collapsedGroups = ['elem'];

            viewControl._groupClick(null, displayItem, clickEvent);
            assert.deepEqual(viewControl._collapsedGroups, []);
            assert.isTrue(itemToggled);
        });

        it('displayItem is collapsed', () => {
            itemToggled = false;
            viewControl._collapsedGroups = [];

            viewControl._groupClick(null, displayItem, clickEvent);
            assert.deepEqual(viewControl._collapsedGroups, ['elem']);
            assert.isTrue(itemToggled);
        });
    });

    describe('_resetFilter', () => {
        const viewControl = new View({});
        viewControl._beforeMount({
            source: [{
                name: 'test',
                value: 'test',
                textValue: 'test'
            }]
        });

        it('_setSource was called', () => {
            let sourceUpdated = false;
            viewControl._setSource = () => {
                sourceUpdated = true;
            };
            viewControl._resetFilter();
            assert.isTrue(sourceUpdated);
        });
    });

    describe('_updateSource', () => {
        const viewControl = new View({});

        it('without textValue', () => {
            const editingObject = {
                testName: 'testValue'
            };
            viewControl._source = [
                {
                    name: 'testName',
                    value: 'testValue',
                    textValue: 'testTextValue'
                }
            ];
            viewControl._updateSource(editingObject);
            assert.equal(viewControl._source[0].textValue, 'testTextValue');
        });

        it('with textValue', () => {
            const editingObject = {
                testName: {
                    value: 'newTestValue',
                    textValue: 'newTestTextValue'
                }
            };
            viewControl._source = [
                {
                    name: 'testName',
                    value: 'testValue',
                    textValue: 'testTextValue'
                }
            ];
            viewControl._updateSource(editingObject);
            assert.equal(viewControl._source[0].textValue, 'newTestTextValue');
        });

        it('with false value', () => {
            const editingObject = {
                testName: false
            };
            viewControl._source = [
                {
                    name: 'testName',
                    value: false,
                    textValue: 'No'
                }
            ];
            viewControl._updateSource(editingObject);
            assert.equal(viewControl._source[0].value, false);
        });

    });
});
