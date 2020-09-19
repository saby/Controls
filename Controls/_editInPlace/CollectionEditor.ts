import {DestroyableMixin, Model} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import {ICollectionEditor, ICollectionEditorOptions} from './interface/ICollectionEditor';
import {TEditableCollectionItem, TKey} from './Types';
import {mixin} from 'Types/util';

const ERROR_MSG = {
    ADDING_ITEM_KEY_WAS_NOT_SET: 'Duplicating keys in editable collection. Adding item has the same key as item which is already exists in collection. ' +
        'Maybe you forgot to set a key to previous added item (the requirement of unique keys needs for correct collection operation). ' +
        'In this case you you can set key before edit while prepare adding item, in beforeBeginEdit callback or beforeEndEdit callback.',
    ADD_ITEM_KEY_DUPLICATED: 'Duplicating keys in editable collection. Adding item has the same key as item which is already exists in collection.',
    EDITING_ITEM_MISSED_IN_COLLECTION: 'Item wanna be edit does not exist in source collection.',
    SOURCE_COLLECTION_MUST_BE_RECORDSET: 'Source collection must be instance of type extended of Types/collection:RecordSet.',
    HAS_NO_EDITING: 'There is no running edit in collection.'
};

const ADDING_ITEM_EMPTY_KEY = 'ADD_ITEM_EMPTY_KEY';

/**
 * Контроллера редактирования коллекции.
 *
 * @mixes Controls/_editInPlace/interface/ICollectionEditor
 * @private
 * @class Controls/_editInPlace/CollectionEditor
 * @author Родионов Е.А.
 */
/*
 * Collection editor controller.
 *
 * @mixes Controls/_editInPlace/interface/ICollectionEditor
 * @private
 * @class Controls/_editInPlace/CollectionEditor
 * @author Rodionov E.
 */
export class CollectionEditor extends mixin<DestroyableMixin>(DestroyableMixin) implements ICollectionEditor {
    private _options: ICollectionEditorOptions;
    private _editingKey: TKey;

    constructor(options: ICollectionEditorOptions) {
        super();
        this.updateOptions(options);
    }

    getEditingKey(): TKey {
        return this._editingKey;
    }

    getEditingItem(): Model | undefined {
        if (this._editingKey === undefined) {
            return undefined;
        }
        return this._options.collection.getItemBySourceKey(this._editingKey).contents;
    }

    updateOptions(options: Partial<ICollectionEditorOptions>): void {
        const oldOptions: Partial<ICollectionEditorOptions> = this._options || {};
        this._options = {collection: options.collection || oldOptions.collection};
        if (!this._options.collection.getCollection()['[Types/_collection/RecordSet]']) {
            throw Error(ERROR_MSG.SOURCE_COLLECTION_MUST_BE_RECORDSET);
        }
    }

    edit(item: Model): void {
        this._editingKey = item.getKey();

        const collectionItem = this._options.collection.getItemBySourceKey(this._editingKey);
        if (!collectionItem) {
            throw Error(ERROR_MSG.EDITING_ITEM_MISSED_IN_COLLECTION);
        }

        collectionItem.acceptChanges();
        item.acceptChanges();
        collectionItem.setEditing(true, item);

        this._options.collection.setEditing(true);
        (this._options.collection.getCollection() as unknown as RecordSet).acceptChanges();
    }

    add(item: Model, addPosition: 'top' | 'bottom' = 'bottom'): void {
        // Раньше это разруливалось постфиксами в шаблоне, что не есть норма.
        // Источник не всегда возвращает запись с установленным id, может вернуть undefined, а это уже нормально.
        // Для одной, добавляемой записи мы обязаны поддержать корректную работу редактировани с пустым ключом,
        // но пользователь обязан при сохранении наделить ее уникальным ключом, иначе мы упадем с читаемой ошибкой.
        // таким образом мы не запрещаем редактирование добавляемой записи с пустым ключом,
        // но запрещаем добавление в коллекцию.
        if (item.getKey() === undefined) {
            item.set(item.getKeyProperty(), ADDING_ITEM_EMPTY_KEY);
        }

        this._validateAddingItem(item);
        this._editingKey = item.getKey();

        const collectionItem = this._options.collection.createItem({contents: item});

        collectionItem.acceptChanges();
        item.acceptChanges();
        collectionItem.setEditing(true, item);

        collectionItem.isAdd = true;
        collectionItem.addPosition = addPosition;
        this._options.collection.setAddingItem(collectionItem);

        this._options.collection.setEditing(true);
        (this._options.collection.getCollection() as unknown as RecordSet).acceptChanges();
    }

    commit(): void {
        if (this._editingKey === undefined) {
            return;
        }
        const collectionItem = this._options.collection.getItemBySourceKey(this._editingKey);
        collectionItem.acceptChanges();

        this._options.collection.resetAddingItem();
        collectionItem.setEditing(false, null);
        this._options.collection.setEditing(false);
        (this._options.collection.getCollection() as unknown as RecordSet).acceptChanges();

        this._editingKey = undefined;
    }

    cancel(): void {
        if (this._editingKey === undefined) {
            return;
        }
        const collectionItem = this._options.collection.getItemBySourceKey(this._editingKey);
        if (!collectionItem) {
            throw Error(ERROR_MSG.HAS_NO_EDITING);
        }
        this._options.collection.resetAddingItem();

        collectionItem.setEditing(false, null);
        this._options.collection.setEditing(false);
        (this._options.collection.getCollection() as unknown as RecordSet).acceptChanges();

        this._editingKey = undefined;
    }

    getNextEditableItem(): TEditableCollectionItem {
        return this._getNextEditableItem('after');
    }

    getPrevEditableItem(): TEditableCollectionItem {
        return this._getNextEditableItem('before');
    }

    private _getNextEditableItem(direction: 'before' | 'after'): TEditableCollectionItem {
        let next: TEditableCollectionItem;
        const collection = this._options.collection;

        if (this._editingKey === undefined) {
            next = collection.getFirst();
        } else {
            next = direction === 'after' ? collection.getNextByKey(this._editingKey) :
                collection.getPrevByKey(this._editingKey);
        }

        while (next && !next['[Controls/_display/IEditableCollectionItem]']) {
            next = direction === 'after' ? collection.getNext(next) : collection.getPrevious(next);
        }

        return next;
    }

    private _validateAddingItem(item: Model): void | never {
        const addingKey = item.getKey();
        const collectionItem = this._options.collection.getItemBySourceKey(addingKey);
        if (collectionItem) {
            if (addingKey === ADDING_ITEM_EMPTY_KEY) {
                throw Error(ERROR_MSG.ADDING_ITEM_KEY_WAS_NOT_SET);
            } else {
                throw Error(`${ERROR_MSG.ADD_ITEM_KEY_DUPLICATED} Duplicated key: ${addingKey}.`);
            }
        }
    }

    destroy(): void {
        super.destroy();
        this._options = null;
        this._editingKey = undefined;
    }
}
