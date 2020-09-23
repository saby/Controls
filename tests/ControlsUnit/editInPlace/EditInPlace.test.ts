import {assert} from 'chai';
import {Controller as EditInPlace, CONSTANTS} from 'Controls/editInPlace';
import {Collection} from 'Controls/display';
import {Model} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import {Logger} from 'UI/Utils';

describe('Controls/_editInPlace/EditInPlace', () => {
    let items: RecordSet;
    let newItem: Model;
    let collection: Collection<Model>;
    let onBeforeBeginEditCalled: boolean;
    let onAfterBeginEditCalled: boolean;
    let onBeforeEndEditCalled: boolean;
    let onAfterEndEditCalled: boolean;
    let editInPlace: EditInPlace;
    const nativeLoggerError = Logger.error;

    before(() => {
        Logger.error = (msg: string = '', errorPoint?: object | Node | any, errorInfo?: object): object => ({});
    });
    after(() => {
        Logger.error = nativeLoggerError;
    });

    beforeEach(() => {
        newItem = new Model({
            keyProperty: 'id',
            rawData: {id: 4, title: 'Fourth'}
        });

        items = new RecordSet<{ id: number, title: string }>({
            keyProperty: 'id',
            rawData: [
                {id: 1, title: 'First'},
                {id: 2, title: 'Second'},
                {id: 3, title: 'Third'}
            ]
        });

        collection = new Collection({
            keyProperty: 'id',
            collection: items
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
                assert.notExists(editInPlace.getEditingItem());
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
                assert.notExists(editInPlace.getEditingItem());
            });
        });

        it('commit if current adding item has changes', () => {
            return editInPlace.add(newItem).then(() => {
                editInPlace.getEditingItem().set('title', 'Changed');

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
                return editInPlace.edit(items.at(1)).then((result) => {
                    assert.isTrue(wasSaved);
                    assert.isUndefined(result);
                    assert.isTrue(onBeforeBeginEditCalled);
                    assert.isTrue(onAfterBeginEditCalled);
                    assert.equal(editInPlace.getEditingItem().getKey(), 2);
                });
            });
        });

        it('commit if current editing item has changes', () => {

            return editInPlace.edit(items.at(0)).then((res) => {
                editInPlace.getEditingItem().set('title', 'Changed');

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
                return editInPlace.edit(collection.at(1).contents).then((result) => {
                    assert.isTrue(wasSaved);
                    assert.isUndefined(result);
                    assert.isTrue(onBeforeBeginEditCalled);
                    assert.isTrue(onAfterBeginEditCalled);
                    assert.equal(editInPlace.getEditingItem().getKey(), 2);
                });
            });
        });

        it('cancel if current adding item has no changes', () => {
            return editInPlace.edit(items.at(0)).then((res) => {
                // Первый запуск пропускаем, он нам не интересен
                onBeforeBeginEditCalled = false;
                onAfterBeginEditCalled = false;

                let wasSaved = false;

                editInPlace.updateOptions({
                    onBeforeEndEdit: (item, willSave) => {
                        wasSaved = willSave;
                    },
                    onBeforeBeginEdit: () => {
                        onBeforeBeginEditCalled = true;
                    }
                });
                return editInPlace.edit(items.at(1)).then((result) => {
                    assert.isFalse(wasSaved);
                    assert.isUndefined(result);
                    assert.isTrue(onBeforeBeginEditCalled);
                    assert.isTrue(onAfterBeginEditCalled);
                    assert.equal(editInPlace.getEditingItem().getKey(), 2);
                });
            });
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
                return editInPlace.edit(collection.at(1).contents).then((result) => {
                    assert.isTrue(wasCanceled);
                    assert.isUndefined(result);
                    assert.isTrue(onBeforeBeginEditCalled);
                    assert.isTrue(onAfterBeginEditCalled);
                    assert.equal(editInPlace.getEditingItem().getKey(), 2);
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
                return editInPlace.edit(collection.at(1).contents).then((result) => {
                    assert.isTrue(result && result.canceled);
                    assert.isFalse(onBeforeBeginEditCalled);
                    assert.isFalse(onAfterBeginEditCalled);
                    assert.equal(editInPlace.getEditingItem().getKey(), 1);
                });
            });
        });

        it('item given in arguments', () => {
            assert.notExists(editInPlace.getEditingItem());

            editInPlace.updateOptions({
                onBeforeBeginEdit: (options) => {
                    onBeforeBeginEditCalled = true;
                    assert.equal(options.item, collection.at(0).contents);
                }
            });

            return editInPlace.edit(collection.at(0).contents).then((result) => {
                assert.isUndefined(result);
                assert.isTrue(onBeforeBeginEditCalled);
                assert.isTrue(onAfterBeginEditCalled);
                assert.equal(editInPlace.getEditingItem().getKey(), 1);
            });
        });

        it('item given in callback', () => {
            assert.notExists(editInPlace.getEditingItem());

            editInPlace.updateOptions({
                onBeforeBeginEdit: (options) => {
                    onBeforeBeginEditCalled = true;
                    assert.isUndefined(options.item);
                    return { item: collection.at(0).contents };
                }
            });

            return editInPlace.edit().then((result) => {
                assert.isUndefined(result);
                assert.isTrue(onBeforeBeginEditCalled);
                assert.isTrue(onAfterBeginEditCalled);
                assert.equal(editInPlace.getEditingItem().getKey(), 1);
            });
        });

        it('item was not given', () => {
            return editInPlace.edit().then((res) => {
                assert.isTrue(res && res.canceled);
                assert.isTrue(onBeforeBeginEditCalled);
                assert.isFalse(onAfterBeginEditCalled);
                assert.notExists(editInPlace.getEditingItem());
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
                assert.notExists(editInPlace.getEditingItem());
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
                assert.notExists(editInPlace.getEditingItem());
            });
        });

        it('correct [sync callback]', () => {
            return editInPlace.edit(collection.at(0).contents).then((res) => {
                assert.isUndefined(res);
                assert.isTrue(onBeforeBeginEditCalled);
                assert.isTrue(onAfterBeginEditCalled);
                assert.equal(editInPlace.getEditingItem().getKey(), 1);
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
                assert.equal(editInPlace.getEditingItem().getKey(), 1);
            });
        });

        it('callback arguments', () => {
            editInPlace.updateOptions({
                onBeforeBeginEdit: (options, isAdd) => {
                    onBeforeBeginEditCalled = true;
                    assert.equal(options.item, items.at(0));
                    assert.isFalse(isAdd);
                },
                onAfterBeginEdit: (item, isAdd) => {
                    onAfterBeginEditCalled = true;
                    assert.equal(item, editInPlace.getEditingItem());
                    assert.isFalse(isAdd);
                }
            });
            return editInPlace.edit(items.at(0)).then((res) => {
                assert.isUndefined(res);
                assert.isTrue(onBeforeBeginEditCalled);
                assert.isTrue(onAfterBeginEditCalled);
                assert.equal(editInPlace.getEditingItem().getKey(), 1);
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
                assert.equal(editInPlace.getEditingItem().getKey(), 1);
            });
        });
    });

    describe('add', () => {

        it('cancel operation [sync callback]', () => {
            editInPlace.updateOptions({
                onBeforeBeginEdit: () => {
                    onBeforeBeginEditCalled = true;
                    return CONSTANTS.CANCEL;
                }
            });

            return editInPlace.add(newItem, 'bottom').then((res) => {
                assert.isTrue(res && res.canceled);
                assert.isTrue(onBeforeBeginEditCalled);
                assert.isFalse(onAfterBeginEditCalled);
                assert.notExists(editInPlace.getEditingItem());
            });
        });

        it('cancel operation [async callback]', () => {
            editInPlace.updateOptions({
                onBeforeBeginEdit: () => {
                    onBeforeBeginEditCalled = true;
                    return Promise.resolve(CONSTANTS.CANCEL);
                }
            });

            return editInPlace.add(newItem, 'bottom').then((res) => {
                assert.isTrue(res && res.canceled);
                assert.isTrue(onBeforeBeginEditCalled);
                assert.isFalse(onAfterBeginEditCalled);
                assert.notExists(editInPlace.getEditingItem());
            });
        });

        it('commit if current adding item has changes', () => {
            return editInPlace.add(newItem).then(() => {
                editInPlace.getEditingItem().set('title', 'Changed');

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
                const secondNewItem = new Model({
                    keyProperty: 'id',
                    rawData: {
                        id: 5,
                        title: 'Fives'
                    }
                });
                return editInPlace.add(secondNewItem).then((result) => {
                    assert.isTrue(wasSaved);
                    assert.isUndefined(result);
                    assert.isTrue(onBeforeBeginEditCalled);
                    assert.isTrue(onAfterBeginEditCalled);
                    assert.equal(editInPlace.getEditingItem().getKey(), secondNewItem.getKey());
                });
            });
        });

        it('commit if current editing item has changes', () => {

            return editInPlace.edit(items.at(0)).then((res) => {
                editInPlace.getEditingItem().set('title', 'Changed');

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
                return editInPlace.add(newItem).then((result) => {
                    assert.equal(items.at(0).get('title'), 'Changed');
                    assert.isTrue(wasSaved);
                    assert.isUndefined(result);
                    assert.isTrue(onBeforeBeginEditCalled);
                    assert.isTrue(onAfterBeginEditCalled);
                    assert.equal(editInPlace.getEditingItem().getKey(), newItem.getKey());
                });
            });
        });

        it('cancel if current adding item has no changes', () => {
            return editInPlace.edit(items.at(0)).then((res) => {
                // Первый запуск пропускаем, он нам не интересен
                onBeforeBeginEditCalled = false;
                onAfterBeginEditCalled = false;

                let wasSaved = false;

                editInPlace.updateOptions({
                    onBeforeEndEdit: (item, willSave) => {
                        wasSaved = willSave;
                    },
                    onBeforeBeginEdit: () => {
                        onBeforeBeginEditCalled = true;
                    }
                });
                return editInPlace.add(newItem).then((result) => {
                    assert.isFalse(wasSaved);
                    assert.isUndefined(result);
                    assert.isTrue(onBeforeBeginEditCalled);
                    assert.isTrue(onAfterBeginEditCalled);
                    assert.equal(editInPlace.getEditingItem().getKey(), newItem.getKey());
                });
            });
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
                return editInPlace.add(newItem).then((result) => {
                    assert.isTrue(wasCanceled);
                    assert.isUndefined(result);
                    assert.isTrue(onBeforeBeginEditCalled);
                    assert.isTrue(onAfterBeginEditCalled);
                    assert.equal(editInPlace.getEditingItem().getKey(), newItem.getKey());
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
                return editInPlace.add(newItem).then((result) => {
                    assert.isTrue(result && result.canceled);
                    assert.isFalse(onBeforeBeginEditCalled);
                    assert.isFalse(onAfterBeginEditCalled);
                    assert.equal(editInPlace.getEditingItem().getKey(), 1);
                });
            });
        });

        it('item given in arguments', () => {
            assert.notExists(editInPlace.getEditingItem());

            editInPlace.updateOptions({
                onBeforeBeginEdit: (options) => {
                    onBeforeBeginEditCalled = true;
                    assert.equal(options.item, newItem);
                }
            });

            return editInPlace.add(newItem).then((result) => {
                assert.isUndefined(result);
                assert.isTrue(onBeforeBeginEditCalled);
                assert.isTrue(onAfterBeginEditCalled);
                assert.equal(editInPlace.getEditingItem().getKey(), newItem.getKey());
            });
        });

        it('item given in callback', () => {
            assert.notExists(editInPlace.getEditingItem());

            editInPlace.updateOptions({
                onBeforeBeginEdit: (options) => {
                    onBeforeBeginEditCalled = true;
                    assert.isUndefined(options.item);
                    return { item: newItem };
                }
            });

            return editInPlace.add().then((result) => {
                assert.isUndefined(result);
                assert.isTrue(onBeforeBeginEditCalled);
                assert.isTrue(onAfterBeginEditCalled);
                assert.equal(editInPlace.getEditingItem().getKey(), newItem.getKey());
            });
        });

        it('item was not given', () => {
            return editInPlace.add().then((res) => {
                assert.isTrue(res && res.canceled);
                assert.isTrue(onBeforeBeginEditCalled);
                assert.isFalse(onAfterBeginEditCalled);
                assert.notExists(editInPlace.getEditingItem());
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
                assert.notExists(editInPlace.getEditingItem());
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
                assert.notExists(editInPlace.getEditingItem());
            });
        });

        it('correct [sync callback]', () => {
            return editInPlace.add(newItem).then((res) => {
                assert.isUndefined(res);
                assert.isTrue(onBeforeBeginEditCalled);
                assert.isTrue(onAfterBeginEditCalled);
                assert.equal(editInPlace.getEditingItem().getKey(), newItem.getKey());
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
                assert.equal(editInPlace.getEditingItem().getKey(), newItem.getKey());
            });
        });

        it('callback arguments', () => {
            editInPlace.updateOptions({
                onBeforeBeginEdit: (options, isAdd) => {
                    onBeforeBeginEditCalled = true;
                    assert.equal(options.item, newItem);
                    assert.isTrue(isAdd);
                },
                onAfterBeginEdit: (item, isAdd) => {
                    onAfterBeginEditCalled = true;
                    assert.equal(item, editInPlace.getEditingItem());
                    assert.isTrue(isAdd);
                }
            });
            return editInPlace.add(newItem).then((res) => {
                assert.isUndefined(res);
                assert.isTrue(onBeforeBeginEditCalled);
                assert.isTrue(onAfterBeginEditCalled);
                assert.equal(editInPlace.getEditingItem().getKey(), newItem.getKey());
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
                    assert.isTrue(item.get('modified'));
                    assert.isFalse(item.isChanged());
                }
            });
            return editInPlace.add(newItem).then((res) => {
                assert.isUndefined(res);
                assert.isTrue(onBeforeBeginEditCalled);
                assert.isTrue(onAfterBeginEditCalled);
                assert.equal(editInPlace.getEditingItem().getKey(), newItem.getKey());
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
                assert.equal(editInPlace.getEditingItem().getKey(), 1);
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
                    assert.equal(editInPlace.getEditingItem().getKey(), 1);
                });
            });

            it('cancel operation [async callback]', () => {
                assert.equal(editInPlace.getEditingItem().getKey(), 1);
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
                    assert.equal(editInPlace.getEditingItem().getKey(), 1);
                });
            });

            it('error in before callback [sync callback]', () => {
                let isPromiseRejected = false;
                assert.equal(editInPlace.getEditingItem().getKey(), 1);
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
                    assert.equal(editInPlace.getEditingItem().getKey(), 1);
                });
            });

            it('error in before callback [async callback]', () => {
                let isPromiseRejected = false;
                assert.equal(editInPlace.getEditingItem().getKey(), 1);
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
                    assert.equal(editInPlace.getEditingItem().getKey(), 1);
                });
            });

            it('correct [sync callback]', () => {
                assert.equal(editInPlace.getEditingItem().getKey(), 1);
                return editInPlace[operation]().then((result) => {
                    assert.isUndefined(result);
                    assert.isTrue(onBeforeEndEditCalled);
                    assert.isTrue(onAfterEndEditCalled);
                    assert.notExists(editInPlace.getEditingItem());
                });
            });

            it('correct [async callback]', () => {
                assert.equal(editInPlace.getEditingItem().getKey(), 1);
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
                    assert.notExists(editInPlace.getEditingItem());
                });
            });

            it('callback arguments', () => {
                const editingItem = editInPlace.getEditingItem();
                editInPlace.updateOptions({
                    onBeforeEndEdit: (item: Model, willSave: boolean, isAdd: boolean) => {
                        onBeforeEndEditCalled = true;
                        assert.equal(item, editingItem);
                        assert.isFalse(isAdd);
                    },
                    onAfterEndEdit: (item, isAdd) => {
                        onAfterEndEditCalled = true;
                        assert.equal(item, editingItem);
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
