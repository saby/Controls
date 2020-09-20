import {DestroyableMixin, Model} from 'Types/entity';
import {ICollectionEditor, ICollectionEditorOptions} from '../interfaces/ICollectionEditor';
import {TKey, TEditableCollectionItem} from '../interfaces/Types';
import {mixin} from 'Types/util';

const ERROR_MSG = {
    ADDING_ITEM_KEY_WAS_NOT_SET: 'Duplicating keys in editable collection. Adding item has the same key as item which is already exists in collection. ' +
        'Maybe you forgot to set a key to previous added item (the requirement of unique keys needs for correct collection operation). ' +
        'In this case you you can set key before edit while prepare adding item, in beforeBeginEdit callback or beforeEndEdit callback.',

    ADD_ITEM_KEY_DUPLICATED: 'Duplicating keys in editable collection. Adding item has the same key as item which is already exists in collection.',
    EDITING_ITEM_MISSED_IN_COLLECTION: ''
};

const ADDING_ITEM_EMPTY_KEY = 'ADD_ITEM_EMPTY_KEY';

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

    updateOptions(options: Partial<ICollectionEditorOptions>): void {
        const oldOptions: Partial<ICollectionEditorOptions> = this._options || {};
        this._options = {collection: options.collection || oldOptions.collection};
    }

    edit(item: Model): void {
        const contents = item.clone();
        this._editingKey = contents.getKey();

        const collectionItem = this._options.collection.getItemBySourceKey(this._editingKey);
        if (!collectionItem) {
            throw Error(ERROR_MSG.EDITING_ITEM_MISSED_IN_COLLECTION);
        }

        collectionItem.contents.acceptChanges();
        contents.acceptChanges();

        collectionItem.setEditing(true, contents);
        this._options.collection.setEditing(true);
        this._options.collection.getCollection().acceptChanges();
    }

    add(item: Model, addPosition: 'top' | 'bottom' = 'bottom'): void {
        const contents = item.clone();

        // Раньше это разруливалось постфиксами в шаблоне, что не есть норма.
        // Источник не всегда возвращает запись с установленным id, может вернуть undefined, а это уже нормально.
        // Для одной, добавляемой записи мы обязаны поддержать корректную работу редактировани с пустым ключом, но пользователь
        // обязан при сохранении наделить ее уникальным ключом, иначе мы упадем с читаемой ошибкой.
        // таким образом мы не запрещаем редактирование добавляемой записи с пустым ключом, но запрещаем добавление в коллекцию.
        if (contents.getKey() === undefined) {
            contents.set(contents.getKeyProperty(), ADDING_ITEM_EMPTY_KEY);
        }

        this._validateAddingItem(contents);
        this._editingKey = contents.getKey();

        const collectionItem = this._options.collection.createItem({contents});
        collectionItem.contents.acceptChanges();
        contents.acceptChanges();

        collectionItem.setEditing(true, contents);
        this._options.collection.setEditing(true);

        collectionItem.isAdd = true;
        collectionItem.addPosition = addPosition;
        this._options.collection.setAddingItem(collectionItem);

        this._options.collection.getCollection().acceptChanges();
    }

    commit(): void {
        if (this._editingKey === undefined) {
            return;
        }
        const collectionItem = this._options.collection.getItemBySourceKey(this._editingKey);
        collectionItem.acceptEditing();

        this._options.collection.resetAddingItem();
        collectionItem.setEditing(false, null);
        this._options.collection.setEditing(false);
        this._options.collection.getCollection().acceptChanges();

        this._editingKey = undefined;
    }

    cancel(): void {
        if (this._editingKey === undefined) {
            return;
        }
        const collectionItem = this._options.collection.getItemBySourceKey(this._editingKey);
        this._options.collection.resetAddingItem();

        collectionItem.setEditing(false, null);
        this._options.collection.setEditing(false);
        this._options.collection.getCollection().acceptChanges();

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
            next = direction === 'after' ? collection.getNextByKey(this._editingKey) : collection.getPrevByKey(this._editingKey);
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
