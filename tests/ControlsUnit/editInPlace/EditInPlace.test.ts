import {assert} from 'chai';
import {EditInPlace} from 'Controls/_editInPlace/new/EditInPlace';
import {CONSTANTS, TEditableCollection} from 'Controls/_editInPlace/interfaces/Types';
import {Collection} from 'Controls/display';
import {Model} from 'Types/entity';
import {RecordSet} from 'Types/collection';

describe('Controls/_editInPlace/EditInPlace', () => {
    let collection: TEditableCollection;
    let onBeforeBeginEditCalled: boolean;
    let onAfterBeginEditCalled: boolean;
    let onBeforeEndEditCalled: boolean;
    let onAfterEndEditCalled: boolean;
    let editInPlace: EditInPlace;

    beforeEach(() => {
        collection = new Collection({
            keyProperty: 'id',
            collection: new RecordSet<{ id: number, title: string }>({
                keyProperty: 'id',
                rawData: [
                    {id: 1, title: 'First'},
                    {id: 2, title: 'Second'},
                    {id: 3, title: 'Third'}
                ]
            })
        });

        onBeforeBeginEditCalled = false;
        onAfterBeginEditCalled = false;
        onBeforeEndEditCalled = false;
        onAfterEndEditCalled = false;

        editInPlace = new EditInPlace({
            collection,
            onBeforeBeginEdit: () => {
                onBeforeBeginEditCalled = true;
            },
            onAfterBeginEdit: () => {
                onAfterBeginEditCalled = true;
            },
            onBeforeEndEdit: () => {
                onBeforeEndEditCalled = true;
            },
            onAfterEndEdit: () => {
                onAfterEndEditCalled = true;
            }
        });
    });

    describe('edit', () => {
        it('cancel operation [sync callback]', () => {
            editInPlace.updateOptions({
                onBeforeBeginEdit: () => {
                    onBeforeBeginEditCalled = true;
                    return CONSTANTS.CANCEL;
                }
            });

            return editInPlace.edit(collection.at(0).contents).then((res) => {
                assert.isTrue(res && res.canceled);
                assert.isTrue(onBeforeBeginEditCalled);
                assert.isFalse(onAfterBeginEditCalled);
                assert.isUndefined(editInPlace.getEditingKey());
            });
        });

        it('cancel operation [async callback]', () => {
            editInPlace.updateOptions({
                onBeforeBeginEdit: () => {
                    onBeforeBeginEditCalled = true;
                    return Promise.resolve(CONSTANTS.CANCEL);
                }
            });

            return editInPlace.edit(collection.at(0).contents).then((res) => {
                assert.isTrue(res && res.canceled);
                assert.isTrue(onBeforeBeginEditCalled);
                assert.isFalse(onAfterBeginEditCalled);
                assert.isUndefined(editInPlace.getEditingKey());
            });
        });

        it('commit if current adding item has changes', () => {
            throw Error('Need test!');
        });

        it('commit if current editing item has changes', () => {
            const editingItem = collection.at(0).contents;

            return editInPlace.edit(editingItem).then((res) => {
                editingItem.set('title', 'Changed');

                // Первый запуск пропускаем, он нам не интересен
                onBeforeBeginEditCalled = false;
                onAfterBeginEditCalled = false;

                let wasSaved = false;
                let savingStartedForItemWithKey;

                editInPlace.updateOptions({
                    onBeforeEndEdit: (item, willSave) => {
                        if (willSave) {
                            savingStartedForItemWithKey = item.getKey();
                        }
                    },
                    onAfterEndEdit: (item) => {
                        if (savingStartedForItemWithKey === item.getKey()) {
                            wasSaved = true;
                        }
                    },
                    onBeforeBeginEdit: () => {
                        onBeforeBeginEditCalled = true;
                    }
                });
                return editInPlace.edit(collection.at(1).contents).then((resources) => {
                    assert.isTrue(wasSaved);
                    assert.isUndefined(resources);
                    assert.isTrue(onBeforeBeginEditCalled);
                    assert.isTrue(onAfterBeginEditCalled);
                    assert.equal(editInPlace.getEditingKey(), 2);
                });
            });
        });

        it('cancel if current adding item has no changes', () => {
            throw Error('Need test!');
        });

        it('cancel if current editing item has no changes', () => {
            const editingItem = collection.at(0).contents;

            return editInPlace.edit(editingItem).then((res) => {

                // Первый запуск пропускаем, он нам не интересен
                onBeforeBeginEditCalled = false;
                onAfterBeginEditCalled = false;

                let wasCanceled = false;
                let savingStartedForItemWithKey;

                editInPlace.updateOptions({
                    onBeforeEndEdit: (item, willSave) => {
                        if (!willSave) {
                            savingStartedForItemWithKey = item.getKey();
                        }
                    },
                    onAfterEndEdit: (item) => {
                        if (savingStartedForItemWithKey === item.getKey()) {
                            wasCanceled = true;
                        }
                    },
                    onBeforeBeginEdit: () => {
                        onBeforeBeginEditCalled = true;
                    }
                });
                return editInPlace.edit(collection.at(1).contents).then((resources) => {
                    assert.isTrue(wasCanceled);
                    assert.isUndefined(resources);
                    assert.isTrue(onBeforeBeginEditCalled);
                    assert.isTrue(onAfterBeginEditCalled);
                    assert.equal(editInPlace.getEditingKey(), 2);
                });
            });
        });

        it('cancel operation if saving previous led to error', () => {
            const editingItem = collection.at(0).contents;

            return editInPlace.edit(editingItem).then((res) => {

                // Первый запуск пропускаем, он нам не интересен
                onBeforeBeginEditCalled = false;
                onAfterBeginEditCalled = false;

                editInPlace.updateOptions({
                    onBeforeEndEdit: (item, willSave) => {
                        if (!willSave) {
                            throw Error('Error while saving');
                        }
                    },
                    onBeforeBeginEdit: () => {
                        onBeforeBeginEditCalled = true;
                    }
                });
                return editInPlace.edit(collection.at(1).contents).then((resources) => {
                    assert.isTrue(resources && resources.canceled);
                    assert.isFalse(onBeforeBeginEditCalled);
                    assert.isFalse(onAfterBeginEditCalled);
                    assert.equal(editInPlace.getEditingKey(), 1);
                });
            });
        });

        it('item given in arguments', () => {
            assert.isUndefined(editInPlace.getEditingKey());

            editInPlace.updateOptions({
                onBeforeBeginEdit: (options) => {
                    onBeforeBeginEditCalled = true;
                    assert.equal(options.item, collection.at(0).contents);
                }
            });

            return editInPlace.edit(collection.at(0).contents).then((resources) => {
                assert.isUndefined(resources);
                assert.isTrue(onBeforeBeginEditCalled);
                assert.isTrue(onAfterBeginEditCalled);
                assert.equal(editInPlace.getEditingKey(), 1);
            });
        });

        it('item given in callback', () => {
            assert.isUndefined(editInPlace.getEditingKey());

            editInPlace.updateOptions({
                onBeforeBeginEdit: (options) => {
                    onBeforeBeginEditCalled = true;
                    assert.isUndefined(options.item);
                    return collection.at(0).contents;
                }
            });

            return editInPlace.edit().then((resources) => {
                assert.isUndefined(resources);
                assert.isTrue(onBeforeBeginEditCalled);
                assert.isTrue(onAfterBeginEditCalled);
                assert.equal(editInPlace.getEditingKey(), 1);
            });
        });

        it('item was not given', () => {
            return editInPlace.edit().then((res) => {
                assert.isTrue(res && res.canceled);
                assert.isTrue(onBeforeBeginEditCalled);
                assert.isFalse(onAfterBeginEditCalled);
                assert.isUndefined(editInPlace.getEditingKey());
            });
        });

        it('error in before callback [sync callback]', () => {
            let isPromiseRejected = false;
            editInPlace.updateOptions({
                onBeforeBeginEdit: () => {
                    onBeforeBeginEditCalled = true;
                    throw Error('Error in callback');
                }
            });

            return editInPlace.edit(collection.at(0).contents).catch((result) => {
                isPromiseRejected = true;
                return result;
            }).then((res) => {
                assert.isTrue(res && res.canceled);
                assert.isTrue(onBeforeBeginEditCalled);
                assert.isFalse(onAfterBeginEditCalled);
                assert.isFalse(isPromiseRejected);
                assert.isUndefined(editInPlace.getEditingKey());
            });
        });

        it('error in before callback [async callback]', () => {
            let isPromiseRejected = false;
            editInPlace.updateOptions({
                onBeforeBeginEdit: () => {
                    onBeforeBeginEditCalled = true;
                    return Promise.reject(Error('Error in callback')) as Promise<void>;
                }
            });

            return editInPlace.edit(collection.at(0).contents).catch((result) => {
                isPromiseRejected = true;
                return result;
            }).then((res) => {
                assert.isTrue(res && res.canceled);
                assert.isTrue(onBeforeBeginEditCalled);
                assert.isFalse(onAfterBeginEditCalled);
                assert.isFalse(isPromiseRejected);
                assert.isUndefined(editInPlace.getEditingKey());
            });
        });

        it('correct [sync callback]', () => {
            return editInPlace.edit(collection.at(0).contents).then((res) => {
                assert.isUndefined(res);
                assert.isTrue(onBeforeBeginEditCalled);
                assert.isTrue(onAfterBeginEditCalled);
                assert.equal(editInPlace.getEditingKey(), 1);
            });
        });

        it('correct [async callback]', () => {
            editInPlace.updateOptions({
                onBeforeBeginEdit: () => {
                    onBeforeBeginEditCalled = true;
                    return Promise.resolve();
                }
            });
            return editInPlace.edit(collection.at(0).contents).then((res) => {
                assert.isUndefined(res);
                assert.isTrue(onBeforeBeginEditCalled);
                assert.isTrue(onAfterBeginEditCalled);
                assert.equal(editInPlace.getEditingKey(), 1);
            });
        });

        it('callback arguments', () => {
            editInPlace.updateOptions({
                onBeforeBeginEdit: (options, isAdd) => {
                    onBeforeBeginEditCalled = true;
                    assert.equal(options.item, collection.at(0).contents);
                    assert.isFalse(isAdd);
                },
                onAfterBeginEdit: (item, isAdd) => {
                    onAfterBeginEditCalled = true;
                    assert.equal(item, collection.at(0).contents);
                    assert.isFalse(isAdd);
                }
            });
            return editInPlace.edit(collection.at(0).contents).then((res) => {
                assert.isUndefined(res);
                assert.isTrue(onBeforeBeginEditCalled);
                assert.isTrue(onAfterBeginEditCalled);
                assert.equal(editInPlace.getEditingKey(), 1);
            });
        });

        it('item was modified in callback', () => {
            editInPlace.updateOptions({
                onBeforeBeginEdit: (options, isAdd) => {
                    onBeforeBeginEditCalled = true;
                    options.item.set('modified', true);
                },
                onAfterBeginEdit: (item, isAdd) => {
                    onAfterBeginEditCalled = true;
                    assert.equal(item, collection.at(0).contents);
                    assert.isFalse(isAdd);
                    assert.isTrue(item.get('modified'));
                }
            });
            return editInPlace.edit(collection.at(0).contents).then((res) => {
                assert.isUndefined(res);
                assert.isTrue(onBeforeBeginEditCalled);
                assert.isTrue(onAfterBeginEditCalled);
                assert.equal(editInPlace.getEditingKey(), 1);
            });
        });
    });

    describe('add', () => {
        let newItem: Model;
        beforeEach(() => {
            newItem = new Model({
                keyProperty: 'id',
                rawData: {id: 4, title: 'Third'}
            });
        });

        it('cancel operation [sync callback]', () => {
            editInPlace.updateOptions({
                onBeforeBeginEdit: () => {
                    onBeforeBeginEditCalled = true;
                    return CONSTANTS.CANCEL;
                }
            });

            return editInPlace.add(newItem, 'end').then((res) => {
                assert.isTrue(res && res.canceled);
                assert.isTrue(onBeforeBeginEditCalled);
                assert.isFalse(onAfterBeginEditCalled);
                assert.isUndefined(editInPlace.getEditingKey());
            });
        });

        it('cancel operation [async callback]', () => {
            editInPlace.updateOptions({
                onBeforeBeginEdit: () => {
                    onBeforeBeginEditCalled = true;
                    return Promise.resolve(CONSTANTS.CANCEL);
                }
            });

            return editInPlace.add(newItem, 'end').then((res) => {
                assert.isTrue(res && res.canceled);
                assert.isTrue(onBeforeBeginEditCalled);
                assert.isFalse(onAfterBeginEditCalled);
                assert.isUndefined(editInPlace.getEditingKey());
            });
        });

        it('commit if current adding item has changes', () => {
            throw Error('Need test!');
        });

        it('commit if current editing item has changes', () => {
            const editingItem = collection.at(0).contents;

            return editInPlace.edit(editingItem).then((res) => {
                editingItem.set('title', 'Changed');

                // Первый запуск пропускаем, он нам не интересен
                onBeforeBeginEditCalled = false;
                onAfterBeginEditCalled = false;

                let wasSaved = false;
                let savingStartedForItemWithKey;

                editInPlace.updateOptions({
                    onBeforeEndEdit: (item, willSave) => {
                        if (willSave) {
                            savingStartedForItemWithKey = item.getKey();
                        }
                    },
                    onAfterEndEdit: (item) => {
                        if (savingStartedForItemWithKey === item.getKey()) {
                            wasSaved = true;
                        }
                    },
                    onBeforeBeginEdit: () => {
                        onBeforeBeginEditCalled = true;
                    }
                });
                return editInPlace.add(newItem).then((resources) => {
                    assert.isTrue(wasSaved);
                    assert.isUndefined(resources);
                    assert.isTrue(onBeforeBeginEditCalled);
                    assert.isTrue(onAfterBeginEditCalled);
                    assert.equal(editInPlace.getEditingKey(), newItem.getKey());
                });
            });
        });

        it('cancel if current adding item has no changes', () => {
            throw Error('Need test!');
        });

        it('cancel if current editing item has no changes', () => {
            const editingItem = collection.at(0).contents;

            return editInPlace.edit(editingItem).then((res) => {

                // Первый запуск пропускаем, он нам не интересен
                onBeforeBeginEditCalled = false;
                onAfterBeginEditCalled = false;

                let wasCanceled = false;
                let savingStartedForItemWithKey;

                editInPlace.updateOptions({
                    onBeforeEndEdit: (item, willSave) => {
                        if (!willSave) {
                            savingStartedForItemWithKey = item.getKey();
                        }
                    },
                    onAfterEndEdit: (item) => {
                        if (savingStartedForItemWithKey === item.getKey()) {
                            wasCanceled = true;
                        }
                    },
                    onBeforeBeginEdit: () => {
                        onBeforeBeginEditCalled = true;
                    }
                });
                return editInPlace.add(newItem).then((resources) => {
                    assert.isTrue(wasCanceled);
                    assert.isUndefined(resources);
                    assert.isTrue(onBeforeBeginEditCalled);
                    assert.isTrue(onAfterBeginEditCalled);
                    assert.equal(editInPlace.getEditingKey(), newItem.getKey());
                });
            });
        });

        it('cancel operation if saving previous led to error', () => {
            const editingItem = collection.at(0).contents;

            return editInPlace.edit(editingItem).then((res) => {

                // Первый запуск пропускаем, он нам не интересен
                onBeforeBeginEditCalled = false;
                onAfterBeginEditCalled = false;

                editInPlace.updateOptions({
                    onBeforeEndEdit: (item, willSave) => {
                        if (!willSave) {
                            throw Error('Error while saving');
                        }
                    },
                    onBeforeBeginEdit: () => {
                        onBeforeBeginEditCalled = true;
                    }
                });
                return editInPlace.add(newItem).then((resources) => {
                    assert.isTrue(resources && resources.canceled);
                    assert.isFalse(onBeforeBeginEditCalled);
                    assert.isFalse(onAfterBeginEditCalled);
                    assert.equal(editInPlace.getEditingKey(), 1);
                });
            });
        });

        it('item given in arguments', () => {
            assert.isUndefined(editInPlace.getEditingKey());

            editInPlace.updateOptions({
                onBeforeBeginEdit: (options) => {
                    onBeforeBeginEditCalled = true;
                    assert.equal(options.item, newItem);
                }
            });

            return editInPlace.add(newItem).then((resources) => {
                assert.isUndefined(resources);
                assert.isTrue(onBeforeBeginEditCalled);
                assert.isTrue(onAfterBeginEditCalled);
                assert.equal(editInPlace.getEditingKey(), newItem.getKey());
            });
        });

        it('item given in callback', () => {
            assert.isUndefined(editInPlace.getEditingKey());

            editInPlace.updateOptions({
                onBeforeBeginEdit: (options) => {
                    onBeforeBeginEditCalled = true;
                    assert.isUndefined(options.item);
                    return newItem;
                }
            });

            return editInPlace.add().then((resources) => {
                assert.isUndefined(resources);
                assert.isTrue(onBeforeBeginEditCalled);
                assert.isTrue(onAfterBeginEditCalled);
                assert.equal(editInPlace.getEditingKey(), newItem.getKey());
            });
        });

        it('item was not given', () => {
            return editInPlace.add().then((res) => {
                assert.isTrue(res && res.canceled);
                assert.isTrue(onBeforeBeginEditCalled);
                assert.isFalse(onAfterBeginEditCalled);
                assert.isUndefined(editInPlace.getEditingKey());
            });
        });

        it('error in before callback [sync callback]', () => {
            let isPromiseRejected = false;
            editInPlace.updateOptions({
                onBeforeBeginEdit: () => {
                    onBeforeBeginEditCalled = true;
                    throw Error('Error in callback');
                }
            });

            return editInPlace.add(newItem).catch((result) => {
                isPromiseRejected = true;
                return result;
            }).then((res) => {
                assert.isTrue(res && res.canceled);
                assert.isTrue(onBeforeBeginEditCalled);
                assert.isFalse(onAfterBeginEditCalled);
                assert.isFalse(isPromiseRejected);
                assert.isUndefined(editInPlace.getEditingKey());
            });
        });

        it('error in before callback [async callback]', () => {
            let isPromiseRejected = false;
            editInPlace.updateOptions({
                onBeforeBeginEdit: () => {
                    onBeforeBeginEditCalled = true;
                    return Promise.reject(Error('Error in callback')) as Promise<void>;
                }
            });

            return editInPlace.add(newItem).catch((result) => {
                isPromiseRejected = true;
                return result;
            }).then((res) => {
                assert.isTrue(res && res.canceled);
                assert.isTrue(onBeforeBeginEditCalled);
                assert.isFalse(onAfterBeginEditCalled);
                assert.isFalse(isPromiseRejected);
                assert.isUndefined(editInPlace.getEditingKey());
            });
        });

        it('correct [sync callback]', () => {
            return editInPlace.add(newItem).then((res) => {
                assert.isUndefined(res);
                assert.isTrue(onBeforeBeginEditCalled);
                assert.isTrue(onAfterBeginEditCalled);
                assert.equal(editInPlace.getEditingKey(), newItem.getKey());
            });
        });

        it('correct [async callback]', () => {
            editInPlace.updateOptions({
                onBeforeBeginEdit: () => {
                    onBeforeBeginEditCalled = true;
                    return Promise.resolve();
                }
            });
            return editInPlace.add(newItem).then((res) => {
                assert.isUndefined(res);
                assert.isTrue(onBeforeBeginEditCalled);
                assert.isTrue(onAfterBeginEditCalled);
                assert.equal(editInPlace.getEditingKey(), newItem.getKey());
            });
        });

        it('callback arguments', () => {
            throw Error('Need test after implementation IEditableCollectionItem');

            editInPlace.updateOptions({
                onBeforeBeginEdit: (options, isAdd) => {
                    onBeforeBeginEditCalled = true;
                    assert.equal(options.item, collection.at(0).contents);
                    assert.isFalse(isAdd);
                },
                onAfterBeginEdit: (item, isAdd) => {
                    onAfterBeginEditCalled = true;
                    assert.equal(item, collection.at(0).contents);
                    assert.isFalse(isAdd);
                }
            });
            return editInPlace.edit(collection.at(0).contents).then((res) => {
                assert.isUndefined(res);
                assert.isTrue(onBeforeBeginEditCalled);
                assert.isTrue(onAfterBeginEditCalled);
                assert.equal(editInPlace.getEditingKey(), 1);
            });
        });

        it('item was modified in callback', () => {
            throw Error('Need test after implementation IEditableCollectionItem');

            editInPlace.updateOptions({
                onBeforeBeginEdit: (options, isAdd) => {
                    onBeforeBeginEditCalled = true;
                    options.item.set('modified', true);
                },
                onAfterBeginEdit: (item, isAdd) => {
                    onAfterBeginEditCalled = true;
                    assert.equal(item, collection.at(0).contents);
                    assert.isFalse(isAdd);
                    assert.isTrue(item.get('modified'));
                }
            });
            return editInPlace.edit(collection.at(0).contents).then((res) => {
                assert.isUndefined(res);
                assert.isTrue(onBeforeBeginEditCalled);
                assert.isTrue(onAfterBeginEditCalled);
                assert.equal(editInPlace.getEditingKey(), 1);
            });
        });
    });

    testEndEditWith('commit');
    testEndEditWith('cancel');

    function testEndEditWith(operation: 'commit' | 'cancel'): void {
        describe(operation, () => {
            beforeEach(async () => {
                if (operation === 'commit') {
                    editInPlace.cancel = () => {
                        return Promise.reject('Method shouldn\nt be called');
                    };
                } else {
                    editInPlace.commit = () => {
                        return Promise.reject('Method shouldn\nt be called');
                    };
                }
                await editInPlace.edit(collection.at(0).contents);
            });

            it(`skip ${operation} if has no editing`, () => {
                editInPlace = new EditInPlace({
                    collection,
                    onBeforeEndEdit: () => {
                        onBeforeEndEditCalled = true;
                    },
                    onAfterEndEdit: () => {
                        onAfterEndEditCalled = true;
                    }
                });

                return editInPlace[operation]().then((res) => {
                    assert.isUndefined(res);
                    assert.isFalse(onBeforeEndEditCalled);
                    assert.isFalse(onAfterEndEditCalled);
                });
            });

            it('cancel operation [sync callback]', () => {
                assert.equal(editInPlace.getEditingKey(), 1);
                editInPlace.updateOptions({
                    onBeforeEndEdit: () => {
                        onBeforeEndEditCalled = true;
                        return CONSTANTS.CANCEL;
                    }
                });
                return editInPlace[operation]().then((res) => {
                    assert.isTrue(res && res.canceled);
                    assert.isTrue(onBeforeEndEditCalled);
                    assert.isFalse(onAfterEndEditCalled);
                    assert.equal(editInPlace.getEditingKey(), 1);
                });
            });

            it('cancel operation [async callback]', () => {
                assert.equal(editInPlace.getEditingKey(), 1);
                editInPlace.updateOptions({
                    onBeforeEndEdit: () => {
                        onBeforeEndEditCalled = true;
                        return Promise.resolve(CONSTANTS.CANCEL);
                    }
                });
                return editInPlace[operation]().then((res) => {
                    assert.isTrue(res && res.canceled);
                    assert.isTrue(onBeforeEndEditCalled);
                    assert.isFalse(onAfterEndEditCalled);
                    assert.equal(editInPlace.getEditingKey(), 1);
                });
            });

            it('error in before callback [sync callback]', () => {
                let isPromiseRejected = false;
                assert.equal(editInPlace.getEditingKey(), 1);
                editInPlace.updateOptions({
                    onBeforeEndEdit: () => {
                        onBeforeEndEditCalled = true;
                        throw Error('Some error in callback.');
                    }
                });
                return editInPlace[operation]().catch((result) => {
                    isPromiseRejected = true;
                    return result;
                }).then((result) => {
                    assert.isTrue(result && result.canceled);
                    assert.isTrue(onBeforeEndEditCalled);
                    assert.isFalse(onAfterEndEditCalled);
                    assert.isFalse(isPromiseRejected);
                    assert.equal(editInPlace.getEditingKey(), 1);
                });
            });

            it('error in before callback [async callback]', () => {
                let isPromiseRejected = false;
                assert.equal(editInPlace.getEditingKey(), 1);
                editInPlace.updateOptions({
                    onBeforeEndEdit: () => {
                        onBeforeEndEditCalled = true;
                        return Promise.reject(Error('Some error in callback.'));
                    }
                });
                return editInPlace[operation]().catch((result) => {
                    isPromiseRejected = true;
                    return result;
                }).then((result) => {
                    assert.isTrue(result && result.canceled);
                    assert.isTrue(onBeforeEndEditCalled);
                    assert.isFalse(onAfterEndEditCalled);
                    assert.isFalse(isPromiseRejected);
                    assert.equal(editInPlace.getEditingKey(), 1);
                });
            });

            it('correct [sync callback]', () => {
                assert.equal(editInPlace.getEditingKey(), 1);
                return editInPlace[operation]().then((result) => {
                    assert.isUndefined(result);
                    assert.isTrue(onBeforeEndEditCalled);
                    assert.isTrue(onAfterEndEditCalled);
                    assert.isUndefined(editInPlace.getEditingKey());
                });
            });

            it('correct [async callback]', () => {
                assert.equal(editInPlace.getEditingKey(), 1);
                editInPlace.updateOptions({
                    onBeforeEndEdit: () => {
                        onBeforeEndEditCalled = true;
                        return Promise.resolve();
                    }
                });
                return editInPlace[operation]().then((res) => {
                    assert.isUndefined(res);
                    assert.isTrue(onBeforeEndEditCalled);
                    assert.isTrue(onAfterEndEditCalled);
                    assert.isUndefined(editInPlace.getEditingKey());
                });
            });

            it('callback arguments', () => {
                editInPlace.updateOptions({
                    onBeforeEndEdit: (item: Model, willSave: boolean, isAdd: boolean) => {
                        onBeforeEndEditCalled = true;
                        assert.equal(item, collection.at(0).contents);
                        assert.isFalse(isAdd);
                    },
                    onAfterEndEdit: (item, isAdd) => {
                        onAfterEndEditCalled = true;
                        assert.equal(item, collection.at(0).contents);
                        assert.isFalse(isAdd);
                    }
                });
                return editInPlace[operation]().then((res) => {
                    assert.isTrue(onBeforeEndEditCalled);
                    assert.isTrue(onAfterEndEditCalled);
                });
            });
        });
    }
});
