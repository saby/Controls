import {assert} from 'chai';
import {CollectionEditor, ERROR_MSG} from 'Controls/_editInPlace/CollectionEditor';
import {Collection, CollectionItem} from 'Controls/display';
import {RecordSet} from 'Types/collection';
import {Model} from 'Types/entity';

describe('Controls/_editInPlace/CollectionEditor', () => {
    let items: RecordSet<{ id: number, title: string }>;
    let collection: Collection<Model>;
    let collectionEditor: CollectionEditor;
    let newItem: Model<{ id: number, title: string }>;

    beforeEach(() => {
        items = new RecordSet<{ id: number, title: string }>({
            keyProperty: 'id',
            rawData: [
                {id: 1, title: 'First'},
                {id: 2, title: 'Second'},
                {id: 3, title: 'Third'}
            ]
        });

        newItem = new Model<{ id: number, title: string }>({
            keyProperty: 'id',
            rawData: {id: 4, title: 'Fourth'}
        });

        collection = new Collection({
            keyProperty: 'id',
            collection: items
        });

        collectionEditor = new CollectionEditor({collection});
    });

    describe('updateOptions', () => {
        it('should use old collection if new is undefined', () => {
            collectionEditor.updateOptions({});
            //@ts-ignore
            const currentCollection = collectionEditor._options.collection;
            assert.equal(currentCollection, collection);
        });

        it('should use new collection if it is defined', () => {
            const newCollection = new Collection({
                keyProperty: 'id',
                collection: items
            });

            collectionEditor.updateOptions({collection: newCollection});
            //@ts-ignore
            const currentCollection = collectionEditor._options.collection;
            assert.equal(currentCollection, newCollection);
        });

        it('should throw error and use old collection if new has source not type of Types/collection:RecordSet', () => {
            const newCollection = new Collection({
                keyProperty: 'id',
                collection: items
            });

            newCollection.getCollection()['[Types/_collection/RecordSet]'] = false;

            assert.throws(() => {
                collectionEditor.updateOptions({collection: newCollection});
            }, ERROR_MSG.SOURCE_COLLECTION_MUST_BE_RECORDSET);

            //@ts-ignore
            const currentCollection = collectionEditor._options.collection;
            assert.equal(currentCollection, collection);
        });
    });

    describe('edit', () => {
        it('correct', () => {
            // Нет редактирования
            assert.notExists(collectionEditor.getEditingItem());
            assert.isFalse(collection.isEditing());

            // Запуск редактирования первой записи
            collectionEditor.edit(items.at(0));

            // Редактирование успешно запустилось
            assert.equal(collectionEditor.getEditingItem().contents.getKey(), 1);

            // Коллекция в режиме редактирования
            assert.isTrue(collection.isEditing());
            assert.isTrue(collection.find((el) => el.isEditing()) instanceof CollectionItem);
        });

        it('should throw error if trying to begin new edit before end current', () => {
            // Нет редактирования
            assert.notExists(collectionEditor.getEditingItem());
            assert.isFalse(collection.isEditing());

            // Запуск редактирования первой записи
            collectionEditor.edit(items.at(0));
            assert.equal(collectionEditor.getEditingItem().contents.getKey(), 1);

            // Запуск редактирования второй записи должен привести к исключению
            assert.throws(() => {
                collectionEditor.edit(items.at(1));
            }, ERROR_MSG.EDITING_IS_ALREADY_RUNNING);

            // Осталось редактирование первой записи
            assert.equal(collectionEditor.getEditingItem().contents.getKey(), 1);
        });

        it('should throw error if trying to begin edit of item that doesn\'t exist in collection', () => {
            // Нет запущенного редактирования
            assert.notExists(collectionEditor.getEditingItem());
            assert.isFalse(collection.isEditing());

            // Попытка начать редактирование несуществующей записи должна привести к исключению
            assert.throws(() => {
                collectionEditor.edit(newItem);
            }, ERROR_MSG.ITEM_FOR_EDITING_MISSED_IN_COLLECTION);

            // Нет запущенного редактирования
            assert.notExists(collectionEditor.getEditingItem());
            assert.isFalse(collection.isEditing());
        });
    });

    describe('add', () => {
        it('correct', () => {
            // Нет редактирования
            assert.notExists(collectionEditor.getEditingItem());
            assert.isFalse(collection.isEditing());

            // Запуск редактирования первой записи
            collectionEditor.add(newItem);

            // Редактирование успешно запустилось
            assert.isTrue(collection.isEditing());
            assert.equal(collectionEditor.getEditingItem().contents.getKey(), 4);
        });

        it('should throw error if trying to begin new edit before end current editing', () => {
            // Нет редактирования
            assert.notExists(collectionEditor.getEditingItem());
            assert.isFalse(collection.isEditing());

            // Запуск редактирования первой записи
            collectionEditor.edit(items.at(0));
            assert.isTrue(collection.isEditing());
            assert.equal(collectionEditor.getEditingItem().contents.getKey(), 1);

            // Запуск добавления новой записи должен привести к исключению
            assert.throws(() => {
                collectionEditor.add(newItem);
            }, ERROR_MSG.EDITING_IS_ALREADY_RUNNING);

            // Осталось редактирование первой записи
            assert.equal(collectionEditor.getEditingItem().contents.getKey(), 1);
        });

        // it('should throw error if trying to begin edit of item that already exists in collection', () => {
        //     // Нет запущенного редактирования
        //     assert.notExists(collectionEditor.getEditingItem());
        //     assert.isFalse(collection.isEditing());
        //
        //     // Попытка начать добавление существующей записи должна привести к исключению
        //     assert.throws(() => {
        //         collectionEditor.add(items.at(0));
        //     }, ERROR_MSG.ADD_ITEM_KEY_DUPLICATED + ' Duplicated key: 1.');
        //
        //     // Нет запущенного редактирования
        //     assert.notExists(collectionEditor.getEditingItem());
        //     assert.isFalse(collection.isEditing());
        // });

        // describe('should set temporary adding item key if it was not set', () => {
        //     // values of typed fields and its transformed expected values. [empty, transformed].
        //     const variants: Record<string, Array<[null | undefined | number | string, number | string]>> = {
        //         integer: [
        //             [null, Number.MIN_VALUE],
        //             [undefined, Number.MIN_VALUE],
        //             [100, 100]
        //         ],
        //         string: [
        //             [null, 'ADDING_ITEM_EMPTY_KEY'],
        //             [undefined, 'ADDING_ITEM_EMPTY_KEY'],
        //             ['str', 'str']
        //         ]
        //     };
        //
        //     for(const keyPropertyType in variants) {
        //         describe(keyPropertyType, () => {
        //             variants[keyPropertyType].forEach((pair) => {
        //                 const emptyKey = pair[0];
        //                 const transformedKey = pair[1];
        //
        //                 it(`key transformed from ${emptyKey} to ${transformedKey} on adding`, () => {
        //                     // Нет запущенного редактирования
        //                     assert.notExists(collectionEditor.getEditingItem());
        //                     assert.isFalse(collection.isEditing());
        //
        //                     // Запуск добавления записи с пустым ключом.
        //                     collectionEditor.add(new Model({
        //                         keyProperty: 'id',
        //                         rawData: { id: emptyKey, title: 'Fourth' },
        //                         format: [
        //                             { name: 'id', type: keyPropertyType },
        //                             { name: 'title', type: 'string' }
        //                         ]
        //                     }));
        //
        //                     // Добавление запустилось, записи установлен временный ключ.
        //                     assert.isTrue(collection.isEditing());
        //                     assert.equal(collectionEditor.getEditingItem().contents.getKey(), transformedKey);
        //                 });
        //             });
        //         });
        //     }
        // });

        // it('should set temporary adding item key if it is undefined', () => {
        //     // Нет запущенного редактирования
        //     assert.notExists(collectionEditor.getEditingItem());
        //     assert.isFalse(collection.isEditing());
        //
        //     newItem.set('id', undefined);
        //
        //     // Запуск добавления записи с пустым ключом.
        //     collectionEditor.add(newItem);
        //
        //     // Добавление запустилось, записи установлен временный ключ.
        //     assert.isTrue(collection.isEditing());
        //     assert.equal(collectionEditor.getEditingItem().contents.getKey(), 'ADDING_ITEM_EMPTY_KEY');
        // });
        //
        // it('should set temporary adding item key if it is null', () => {
        //     // Нет запущенного редактирования
        //     assert.notExists(collectionEditor.getEditingItem());
        //     assert.isFalse(collection.isEditing());
        //
        //     newItem.set('id', null);
        //
        //     // Запуск добавления записи с пустым ключом.
        //     collectionEditor.add(newItem);
        //
        //     // Добавление запустилось, записи установлен временный ключ.
        //     assert.isTrue(collection.isEditing());
        //     assert.equal(collectionEditor.getEditingItem().contents.getKey(), 'ADDING_ITEM_EMPTY_KEY');
        // });

        describe('addPosition', () => {
            const addPositionAssociations = [
                ['anyInvalid', 'bottom', 3],
                ['default', 'bottom', 3],
                ['top', 'top', 0],
                ['bottom', 'bottom', 3],
                [undefined, 'bottom', 3]
            ];

            addPositionAssociations.forEach(
                ([intoMethodValue, expectedValue, addingItemIndex]: [string | undefined, string, number]) => {

                it(`should set add position as '${expectedValue}' if passed into method '${intoMethodValue}' as add position`, () => {
                    // Нет запущенного редактирования
                    assert.notExists(collectionEditor.getEditingItem());
                    assert.isFalse(collection.isEditing());

                    // Запуск добавления записи с в указанную позицию.
                    // @ts-ignore
                    collectionEditor.add(newItem, intoMethodValue);

                    // Добавление запустилось
                    assert.equal(collectionEditor.getEditingItem().contents.getKey(), newItem.getKey());
                    assert.isTrue(collection.isEditing());

                    // Позиция добавления у элемента коллекции должна быть верная (expectedValue).
                    assert.equal(
                        collection.getItemBySourceKey(newItem.getKey()).addPosition,
                        expectedValue,
                        'Wrong value of addPosition at collection item.'
                    );

                    // Запись отображается в верной позиции
                    assert.equal(collection.at(addingItemIndex).contents, collectionEditor.getEditingItem().contents);
                });

            });
        });
    });

    describe('commit', () => {
        it('correct commit editing', () => {
            // Нет редактирования
            assert.notExists(collectionEditor.getEditingItem());
            assert.isFalse(collection.isEditing());

            // Запуск редактирования первой записи
            collectionEditor.edit(items.at(0));

            // Редактирование успешно запустилось
            assert.equal(collectionEditor.getEditingItem().contents.getKey(), 1);
            assert.isTrue(collection.isEditing());

            // Редактируем поля записи
            const editingItem = collectionEditor.getEditingItem().contents;
            editingItem.set('title', 'First edited');
            assert.isTrue(editingItem.isChanged(), 'Editing item has no changes.');

            // Завершаем редактирование с применением изменений
            collectionEditor.commit();

            // Редактирование завершилось
            assert.notExists(collectionEditor.getEditingItem());

            // Изменения применились
            assert.equal(editingItem.get('title'), 'First edited');
            assert.isFalse(editingItem.isChanged());
            assert.isFalse(items.isChanged());
        });

        it('correct commit adding', () => {
            // Нет редактирования
            assert.notExists(collectionEditor.getEditingItem());
            assert.isFalse(collection.isEditing());

            // В коллекции 3 элемента
            const itemsCountBeforeAdd = collection.getCount();

            // Запуск редактирования первой записи
            collectionEditor.add(newItem);

            // Редактирование успешно запустилось
            assert.isTrue(collection.isEditing());
            assert.equal(collectionEditor.getEditingItem().contents.getKey(), newItem.getKey());

            // Запись отображается
            assert.equal(collection.getCount(), itemsCountBeforeAdd + 1);

            // Редактируем поля записи
            const addingItem = collectionEditor.getEditingItem().contents;
            addingItem.set('title', 'Fourth adding');
            assert.isTrue(addingItem.isChanged(), 'New item has no changes.');

            // Завершаем редактирование с применением изменений
            collectionEditor.commit();

            // Редактирование завершилось
            assert.notExists(collectionEditor.getEditingItem());

            // Изменения применились, но запись не добавилась.
            // Контролл не имеет ответственности добавлять запись в источник, только в проекцию.
            assert.equal(collection.getCount(), itemsCountBeforeAdd);

            assert.equal(addingItem.get('title'), 'Fourth adding');
            assert.isFalse(addingItem.isChanged());
            assert.isFalse(addingItem.isChanged());
        });

        it('should throw error if trying to commit without running editing', () => {
            // Нет запущенного редактирования
            assert.notExists(collectionEditor.getEditingItem());
            assert.isFalse(collection.isEditing());

            // Завершение редактирования должно привести к исключению
            assert.throws(() => {
                collectionEditor.commit();
            }, ERROR_MSG.HAS_NO_EDITING);
        });

    });

    describe('cancel', () => {
        it('correct cancel adding', () => {
            // Нет редактирования
            assert.notExists(collectionEditor.getEditingItem());
            assert.isFalse(collection.isEditing());

            // В коллекции 3 элемента
            const itemsCountBeforeAdd = collection.getCount();

            // Запуск редактирования первой записи
            collectionEditor.add(newItem);

            // Редактирование успешно запустилось
            assert.equal(collectionEditor.getEditingItem().contents.getKey(), newItem.getKey());
            assert.isTrue(collection.isEditing());

            // Редактируем поля записи
            const addingItem = collectionEditor.getEditingItem().contents;
            addingItem.set('title', 'Fourth adding');
            assert.isTrue(addingItem.isChanged(), 'Adding item has no changes.');

            // Завершаем добавление с применением изменений
            collectionEditor.cancel();

            // Добавление завершилось
            assert.notExists(collectionEditor.getEditingItem());
            assert.isFalse(collection.isEditing());

            // Изменения не применились, добавляемой записи нет
            assert.equal(items.getCount(), itemsCountBeforeAdd);
            assert.isFalse(items.isChanged());
        });

        it('should throw error if trying to cancel without running editing', () => {
            // Нет запущенного редактирования
            assert.notExists(collectionEditor.getEditingItem());
            assert.isFalse(collection.isEditing());

            // Завершение редактирования должно привести к исключению
            assert.throws(() => {
                collectionEditor.cancel();
            }, ERROR_MSG.HAS_NO_EDITING);
        });
    });
});
