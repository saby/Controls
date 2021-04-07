import ViewModel from 'Controls/_filterPanel/View/ViewModel';
import {assert} from 'chai';
import {object} from 'Types/util';
import {RecordSet} from 'Types/collection';

describe('Controls/filterPanel:ViewModel', () => {
    let source = null;
    let viewModel = null;
    beforeEach(() => {
        source = [{
            group: 'Ответственный',
            name: 'owner',
            resetValue: [],
            caption: '',
            value: [],
            textValue: '',
            editorTemplateName: 'Controls/filterPanel:ListEditor',
            editorOptions: {
                style: 'master',
                navigation: {
                    source: 'page',
                    view: 'page',
                    sourceConfig: {
                        pageSize: 3,
                        page: 0,
                        hasMore: false
                    }
                },
                keyProperty: 'owner',
                displayProperty: 'title'
            }
        }, {
            group: 'Пол',
            name: 'gender',
            resetValue: '1',
            caption: '',
            value: '1',
            textValue: 'Мужской',
            editorTemplateName: 'Controls/filterPanel:TumblerEditor',
            editorOptions: {
                items: new RecordSet({
                    rawData: [
                        {
                            id: '1',
                            caption: 'Мужской'
                        },
                        {
                            id: '2',
                            caption: 'Женский'
                        }
                    ],
                    keyProperty: 'id'
                })
            }
        }];
        viewModel = new ViewModel({
            source,
            collapsedGroups: []
        });
    });

    describe('hasExtendedItems', () => {
        it('without extended items', () => {
            assert.isFalse(viewModel.hasExtendedItems());
        });

        it('with extended items', () => {
            source = object.clone(source);
            source[0].viewMode = 'extended';
            viewModel.update({
                source
            });
            assert.isTrue(viewModel.hasExtendedItems());
        });
    });

    describe('hasBasicItems', () => {
        it('with basic items', () => {
            assert.isTrue(viewModel.hasBasicItems());
        });

        it('without basic items', () => {
            source = object.clone(source);
            source.forEach((item) => {
                item.viewMode = 'extended';
            });
            viewModel.update({
                source
            });
            assert.isFalse(viewModel.hasBasicItems());
        });
    });

    describe('handleGroupClick', () => {
        it('reset click', () => {
            assert.equal(viewModel.getCollapsedGroups().length, 0);
            viewModel.update({
                collapsedGroups: ['Пол']
            });
            assert.equal(viewModel.getCollapsedGroups().length, 1);
            viewModel.handleGroupClick('Пол', true);
            assert.equal(viewModel.getCollapsedGroups().length, 0);
        });

        it('collapse group by click', () => {
            assert.equal(viewModel.getCollapsedGroups().length, 0);
            viewModel.handleGroupClick('Пол', false);
            assert.equal(viewModel.getCollapsedGroups()[0], 'Пол');
        });
    });

    describe('constructor', () => {
        it('editingObject by source', () => {
           assert.deepEqual({
               owner: [],
               gender: '1'
           }, viewModel.getEditingObject());
        });

        it('groupItems by source', () => {
            assert.deepEqual({
                Пол: {
                    textValue: 'Мужской',
                    afterEditorTemplate: undefined
                },
                Ответственный: {
                    textValue: '',
                    afterEditorTemplate: undefined
                }
            }, viewModel.getGroupItems());
        });
    });

    describe('update', () => {
        it('update editing object', () => {
            source = object.clone(source);
            source[0].value = 'test';
            source[1].value = 'test2';
            viewModel.update({
                source
            });
            assert.deepEqual({
                owner: 'test',
                gender: 'test2'
            }, viewModel.getEditingObject());
        });

        it('update group items', () => {
            source = object.clone(source);
            source[0].textValue = 'test';
            source[1].textValue = 'test2';
            viewModel.update({
                source
            });
            assert.deepEqual({
                Пол: {
                    textValue: 'test2',
                    afterEditorTemplate: undefined
                },
                Ответственный: {
                    textValue: 'test',
                    afterEditorTemplate: undefined
                }
            }, viewModel.getGroupItems());
        });
    });

    describe('setEditingObject', () => {
        it ('change value and viewMode', () => {
            source = object.clone(source);
            source[1].viewMode = 'extended';
            viewModel.update({
                source
            });

            const editingObject = {
                gender: {
                    textValue: 'Женский',
                    value: 4
                }
            };

            viewModel.setEditingObject(editingObject);
            const newSource = viewModel.getSource();
            assert.equal(newSource[1].textValue, 'Женский');
            assert.equal(newSource[1].viewMode, 'basic');
        });
    });
});
