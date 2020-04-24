import { assert } from 'chai';

import { CollectionItem } from 'Controls/display';

interface IChangedData<T> {
    item?: CollectionItem<T>;
    property?: string;
}

describe('Controls/_display/CollectionItem', () => {
    describe('.getOwner()', () => {
        it('should return null by default', () => {
            const item = new CollectionItem();
            assert.isNull(item.getOwner());
        });

        it('should return value passed to the constructor', () => {
            const owner = {};
            const item = new CollectionItem({owner: owner as any});

            assert.strictEqual(item.getOwner(), owner);
        });
    });

    describe('.setOwner()', () => {
        it('should set the new value', () => {
            const owner = {};
            const item = new CollectionItem();

            item.setOwner(owner as any);

            assert.strictEqual(item.getOwner(), owner);
        });
    });

    describe('.getContents()', () => {
        it('should return null by default', () => {
            const item = new CollectionItem();
            assert.isNull(item.getContents());
        });

        it('should return value passed to the constructor', () => {
            const contents = {};
            const item = new CollectionItem({contents});

            assert.strictEqual(item.getContents(), contents);
        });
    });

    describe('.setContents()', () => {
        it('should set the new value', () => {
            const contents = {};
            const item = new CollectionItem();

            item.setContents(contents);

            assert.strictEqual(item.getContents(), contents);
        });

        it('should notify the owner', () => {
            const newContents = 'new';
            const given: IChangedData<string> = {};
            const owner = {
                notifyItemChange(item: CollectionItem<string>, property: string): void {
                    given.item = item;
                    given.property = property;
                }
            };
            const item = new CollectionItem({owner: owner as any});

            item.setContents(newContents);

            assert.strictEqual(given.item, item);
            assert.strictEqual(given.property, 'contents');
        });

        it('should not notify the owner', () => {
            const newContents = 'new';
            const given: IChangedData<string> = {};
            const owner = {
                notifyItemChange(item: CollectionItem<string>, property: string): void {
                    given.item = item;
                    given.property = property;
                }
            };
            const item = new CollectionItem({owner: owner as any});

            item.setContents(newContents, true);

            assert.isUndefined(given.item);
            assert.isUndefined(given.property);
        });
    });

    describe('.getUid()', () => {
        it('should return calling result of getItemUid() on owner', () => {
            const owner = {
                getItemUid: (item) => `[${item.getContents()}]`
            };
            const item = new CollectionItem({
                owner: owner as any,
                contents: 'foo'
            });

            assert.equal(item.getUid(), '[foo]');
        });

        it('should return undefined if there is no owner', () => {
            const item = new CollectionItem();
            assert.isUndefined(item.getUid());
        });
    });

    describe('.isSelected()', () => {
        it('should return false by default', () => {
            const item = new CollectionItem();
            assert.isFalse(item.isSelected());
        });

        it('should return value passed to the constructor', () => {
            const selected = true;
            const item = new CollectionItem({selected});

            assert.strictEqual(item.isSelected(), selected);
        });
    });

    describe('.setSelected()', () => {
        it('should set the new value', () => {
            const selected = true;
            const item = new CollectionItem();

            item.setSelected(selected);

            assert.strictEqual(item.isSelected(), selected);
        });

        it('should notify the owner', () => {
            const given: IChangedData<string> = {};
            const owner = {
                notifyItemChange(item: CollectionItem<string>, property: string): void {
                    given.item = item;
                    given.property = property;
                }
            };

            const item = new CollectionItem({owner: owner as any});
            item.setSelected(true);

            assert.strictEqual(given.item, item);
            assert.strictEqual(given.property, 'selected');
        });

        it('should not notify the owner', () => {
            const given: IChangedData<string> = {};
            const owner = {
                notifyItemChange(item: CollectionItem<string>, property: string): void {
                    given.item = item;
                    given.property = property;
                }
            };

            const item = new CollectionItem({owner: owner as any});
            item.setSelected(true, true);

            assert.isUndefined(given.item);
            assert.isUndefined(given.property);
        });
    });

    describe('.toJSON()', () => {
        it('should serialize the collection item', () => {
            const item = new CollectionItem();
            const json = item.toJSON();
            const options = (item as any)._getOptions();

            delete options.owner;

            assert.strictEqual(json.module, 'Controls/display:CollectionItem');
            assert.isNumber(json.id);
            assert.isTrue(json.id > 0);
            assert.deepEqual(json.state.$options, options);
            assert.strictEqual((json.state as any).iid, item.getInstanceId());
        });

        it('should serialize contents of the item if owner is not defined', () => {
            const items = [1];
            (items as any).getIndex = Array.prototype.indexOf;
            const owner = {
                getCollection(): number[] {
                    return items;
                }
            };

            const item = new CollectionItem({
                owner: owner as any,
                contents: 'foo'
            });
            const json = item.toJSON();

            assert.isUndefined((json.state as any).ci);
            assert.equal(json.state.$options.contents, 'foo');
        });

        it('should serialize contents of the item if owner doesn\'t supports IList', () => {
            const items = [1];
            const owner = {
                getCollection(): number[] {
                    return items;
                }
            };

            const item = new CollectionItem({
                owner: owner as any,
                contents: 'foo'
            });
            const json = item.toJSON();

            assert.isUndefined((json.state as any).ci);
            assert.equal(json.state.$options.contents, 'foo');
        });

        it('should don\'t serialize contents of the item if owner supports IList', () => {
            const items = [1];
            const owner = {
                getCollection(): number[] {
                    return items;
                }
            };
            items['[Types/_collection/IList]'] = true;
            (items as any).getIndex = Array.prototype.indexOf;

            const item = new CollectionItem({
                owner: owner as any,
                contents: items[0]
            });
            const json = item.toJSON();

            assert.strictEqual((json.state as any).ci, 0);
            assert.isUndefined(json.state.$options.contents);
        });
    });

    it('.getDisplayProperty()', () => {
        const owner = {
            getDisplayProperty(): string {
                return 'myDisplayProperty';
            }
        };

        const item = new CollectionItem({ owner });

        assert.strictEqual(item.getDisplayProperty(), 'myDisplayProperty');
    });

    it('.setMarked()', () => {
        const given: IChangedData<string> = {};
        const owner = {
            notifyItemChange(item: CollectionItem<string>, property: string): void {
                given.item = item;
                given.property = property;
            }
        };

        const item = new CollectionItem({ owner });
        assert.isFalse(item.isMarked());

        const prevVersion = item.getVersion();

        item.setMarked(true);
        assert.isTrue(item.isMarked());
        assert.isAbove(item.getVersion(), prevVersion);

        assert.strictEqual(given.item, item);
        assert.strictEqual(given.property, 'marked');
    });

    describe('actions', () => {
        let given: IChangedData<string>;
        const owner = {
            notifyItemChange(item: CollectionItem<string>, property: string): void {
                given.item = item;
                given.property = property;
            }
        };

        beforeEach(() => {
            given = {};
        });

        it('.setActions()', () => {
            const item = new CollectionItem({ owner });
            const actions = {};
            const prevVersion = item.getVersion();

            item.setActions(actions);

            assert.strictEqual(item.getActions(), actions);
            assert.isAbove(item.getVersion(), prevVersion);

            assert.strictEqual(given.item, item);
            assert.strictEqual(given.property, 'actions');
        });

        it('.hasVisibleActions()', () => {
            const item = new CollectionItem({ owner });
            const actions = {
                all: [{ id: 1 }, { id: 2 }, { id: 3 }],
                showed: []
            };

            item.setActions(actions);
            assert.isFalse(item.hasVisibleActions());

            const newActions = {
                ...actions,
                showed: [{ id: 1 }]
            };

            item.setActions(newActions);
            assert.isTrue(item.hasVisibleActions());
        });

        it('.hasActionWithIcon()', () => {
            const item = new CollectionItem({ owner });
            const actions = {
                all: [{ id: 1 }, { id: 2 }, { id: 3 }],
                showed: []
            };

            item.setActions(actions);
            assert.isFalse(item.hasActionWithIcon());

            const newActions = {
                ...actions,
                showed: [{ id: 1 }]
            };

            item.setActions(newActions);
            assert.isFalse(item.hasActionWithIcon());

            const actionsWithIcon = {
                ...newActions,
                showed: [...newActions.showed, { id: 2, icon: 'phone' }]
            };

            item.setActions(actionsWithIcon);
            assert.isTrue(item.hasActionWithIcon());
        });

        describe('.shouldDisplayActions()', () => {
            it('displays actions when there are showed actions', () => {
                const item = new CollectionItem({ owner });
                const actions = {
                    all: [{ id: 1 }, { id: 2 }, { id: 3 }],
                    showed: []
                };

                item.setActions(actions);
                assert.isFalse(item.shouldDisplayActions());

                // has showed actions
                const newActions = {
                    ...actions,
                    showed: [{ id: 1 }]
                };

                item.setActions(newActions);
                assert.isTrue(item.shouldDisplayActions());
            });

            it('displays actions in edit mode (toolbar)', () => {
                const item = new CollectionItem({ owner });
                const actions = {
                    all: [{ id: 1 }, { id: 2 }, { id: 3 }],
                    showed: []
                };

                // has no showed actions, but is editing
                item.setActions(actions);
                item.setEditing(true);

                assert.isTrue(item.shouldDisplayActions());
            });
        });
    });

    it('.setSwiped()', () => {
        const given: IChangedData<string> = {};
        const owner = {
            notifyItemChange(item: CollectionItem<string>, property: string): void {
                given.item = item;
                given.property = property;
            }
        };

        const item = new CollectionItem({ owner });
        assert.isFalse(item.isSwiped());

        const prevVersion = item.getVersion();

        item.setSwiped(true);
        assert.isTrue(item.isSwiped());
        assert.isAbove(item.getVersion(), prevVersion);

        assert.strictEqual(given.item, item);
        assert.strictEqual(given.property, 'swiped');
    });

    it('.setActive()', () => {
        const given: IChangedData<string> = {};
        const owner = {
            notifyItemChange(item: CollectionItem<string>, property: string): void {
                given.item = item;
                given.property = property;
            }
        };

        const item = new CollectionItem({ owner });
        assert.isFalse(item.isActive());

        const prevVersion = item.getVersion();

        item.setActive(true);
        assert.isTrue(item.isActive());
        assert.isAbove(item.getVersion(), prevVersion);

        assert.strictEqual(given.item, item);
        assert.strictEqual(given.property, 'active');
    });

    it('.getWrapperClasses()', () => {
        const defaultClasses = [
            'controls-ListView__itemV',
            'controls-ListView__item_highlightOnHover_default_theme_default',
            'controls-ListView__item_default',
            'controls-ListView__item_showActions',
            'js-controls-SwipeControl__actionsContainer'
        ];
        const editingClasses = [
            'controls-ListView__item_editing'
        ];

        const item = new CollectionItem();
        const wrapperClasses = item.getWrapperClasses();

        defaultClasses.forEach((className) => assert.include(wrapperClasses, className));
        editingClasses.forEach((className) => assert.notInclude(wrapperClasses, className));

        item.setEditing(true, true);
        const editingWrapperClasses = item.getWrapperClasses();

        defaultClasses.concat(editingClasses).forEach((className) => assert.include(editingWrapperClasses, className));
    });

    it('.getContentClasses()', () => {
        let multiSelectVisibility: string;
        const owner = {
            getRowSpacing(): string { return '#rowSpacing#'; },
            getLeftSpacing(): string { return '#leftSpacing#'; },
            getRightSpacing(): string { return '#rightSpacing#'; },
            getMultiSelectVisibility(): string { return multiSelectVisibility; }
        };
        const defaultClasses = [
            'controls-ListView__itemContent',
            'controls-ListView__item_default-topPadding_#rowspacing#',
            'controls-ListView__item_default-bottomPadding_#rowspacing#',
            'controls-ListView__item-rightPadding_#rightspacing#'
        ];

        const item = new CollectionItem({ owner });

        // multiselect visible
        multiSelectVisibility = 'visible';
        const visibleContentClasses = item.getContentClasses();
        defaultClasses.concat([
            'controls-ListView__itemContent_withCheckboxes'
        ]).forEach((className) => assert.include(visibleContentClasses, className));

        // multiselect hidden
        multiSelectVisibility = 'hidden';
        const hiddenContentClasses = item.getContentClasses();
        defaultClasses.concat([
            'controls-ListView__item-leftPadding_#leftspacing#'
        ]).forEach((className) => assert.include(hiddenContentClasses, className));
    });

    it('.getMultiSelectClasses()', () => {
        let multiSelectVisibility;
        const owner = {
            getMultiSelectVisibility(): string { return multiSelectVisibility; }
        };
        const defaultClasses = [
            'controls-ListView__checkbox',
            'controls-ListView__notEditable'
        ];

        const item = new CollectionItem({ owner });

        // multiselect hidden
        multiSelectVisibility = 'hidden';
        const hiddenMultiSelectClasses = item.getMultiSelectClasses();
        defaultClasses.forEach((className) => assert.include(hiddenMultiSelectClasses, className));

        // multiselect onhover + not selected
        multiSelectVisibility = 'onhover';
        const onhoverMultiSelectClasses = item.getMultiSelectClasses();
        defaultClasses.concat([
            'controls-ListView__checkbox-onhover'
        ]).forEach((className) => assert.include(onhoverMultiSelectClasses, className));

        // multiselect onhover + selected
        item.setSelected(true, true);
        const selectedMultiSelectClasses = item.getMultiSelectClasses();
        assert.notInclude(selectedMultiSelectClasses, 'controls-ListView__checkbox-onhover');
    });

    describe('.setEditing()', () => {
        it('sets the editing flag and updates the version', () => {
            const given: IChangedData<string> = {};
            const owner = {
                notifyItemChange(item: CollectionItem<string>, property: string): void {
                    given.item = item;
                    given.property = property;
                }
            };

            const item = new CollectionItem({ owner });
            assert.isFalse(item.isEditing());

            const prevVersion = item.getVersion();

            item.setEditing(true);
            assert.isTrue(item.isEditing());
            assert.isAbove(item.getVersion(), prevVersion);

            assert.strictEqual(given.item, item);
            assert.strictEqual(given.property, 'editing');
        });

        it('returns the editing contents as the contents in edit mode', () => {
            const originalContents = { id: 1, _original: true };
            const editingContents = { id: 1, _editing: true };

            const item = new CollectionItem({ contents: originalContents });
            item.setEditing(true, editingContents, true);

            assert.strictEqual(item.getContents(), editingContents);

            item.setEditing(false, null, true);

            assert.strictEqual(item.getContents(), originalContents);
        });

        it('notifies owner when editing contents change', () => {
            const given: IChangedData<string> = {};
            const owner = {
                notifyItemChange(item: CollectionItem<string>, property: string): void {
                    given.item = item;
                    given.property = property;
                }
            };
            const editingContents = {
                '[Types/_entity/ObservableMixin]': true,
                id: 1,
                _editing: true,
                _propertyChangedHandler: null,
                subscribe(eventName, handler): void {
                    if (eventName === 'onPropertyChange') {
                        this._propertyChangedHandler = handler;
                    }
                }
            };

            const item = new CollectionItem({ owner });
            item.setEditing(true, editingContents);

            assert.isFunction(editingContents._propertyChangedHandler);

            // emulate property changing and onPropertyChange firing
            editingContents._propertyChangedHandler.call(item);

            assert.strictEqual(given.item, item);
            assert.strictEqual(given.property, 'editingContents')
        });

        it('unsubscribes from editing contents property change when editing is finished', () => {
            const given: IChangedData<string> = {};
            const owner = {
                notifyItemChange(item: CollectionItem<string>, property: string): void {
                    given.item = item;
                    given.property = property;
                }
            };
            const editingContents = {
                '[Types/_entity/ObservableMixin]': true,
                id: 1,
                _editing: true,
                _propertyChangedHandler: null,
                subscribe(eventName, handler): void {
                    if (eventName === 'onPropertyChange') {
                        this._propertyChangedHandler = handler;
                    }
                },
                unsubscribe(eventName, handler): void {
                    if (eventName === 'onPropertyChange' && this._propertyChangedHandler === handler) {
                        this._propertyChangedHandler = null;
                    }
                }
            };

            const item = new CollectionItem({ owner });
            item.setEditing(true, editingContents);
            item.setEditing(false);

            assert.isNull(editingContents._propertyChangedHandler);
        });

        it('increases item version when editing contents version is increased', () => {
            const editingContents = {
                _version: 0,
                getVersion(): number {
                    return this._version;
                }
            };

            const item = new CollectionItem();
            item.setEditing(true, editingContents, true);

            const prevVersion = item.getVersion();
            editingContents._version++;

            assert.isAbove(item.getVersion(), prevVersion);
        });
    });
});
