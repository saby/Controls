import {DestroyableMixin, Model} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import {TEditableCollectionItem, TKey, TAddPosition} from './Types';
import {mixin} from 'Types/util';
import {Collection} from 'Controls/display';

export const ERROR_MSG = {
    ADDING_ITEM_KEY_WAS_NOT_SET: 'Adding item key was not set. Key is required. You can set the key ' +
        'before edit while prepare adding item or in callbacks: beforeBeginEdit and beforeEndEdit.',
    ADD_ITEM_KEY_DUPLICATED: 'Duplicating keys in editable collection. Adding item has the same key as item which is already exists in collection.',
    ITEM_FOR_EDITING_MISSED_IN_COLLECTION: 'Item passed for editing does not exist in source collection.',
    COLLECTION_IS_REQUIRED: 'Options ICollectionEditorOptions:collection is required.',
    SOURCE_COLLECTION_MUST_BE_RECORDSET: 'Source collection must be instance of type extended of Types/collection:RecordSet.',
    HAS_NO_EDITING: 'There is no running edit in collection.',
    EDITING_IS_ALREADY_RUNNING: 'Editing is already running. Commit or cancel current before beginning new.'
};

const ADDING_ITEM_EMPTY_KEY = 'ADDING_ITEM_EMPTY_KEY';

interface ICollectionEditorOptions {
    collection: Collection<Model>;
}

/**
 * Контроллер редактирования коллекции.
 *
 * @mixes Types/_entity/DestroyableMixin
 * @private
 * @class Controls/_editInPlace/CollectionEditor
 * @author Родионов Е.А.
 */
export class CollectionEditor extends mixin<DestroyableMixin>(DestroyableMixin) {
    private _options: ICollectionEditorOptions;
    private _editingKey: TKey;

    constructor(options: ICollectionEditorOptions) {
        super();
        if (this._validateOptions(options)) {
            this._options = options;
        }
    }

    /**
     * Получить редактируемый элемент
     * @method
     * @return {Types/entity:Model|undefined}
     * @public
     */
    getEditingItem(): Model | undefined {
        if (this._editingKey === undefined) {
            return undefined;
        }
        return this._options.collection.getItemBySourceKey(this._editingKey).contents;
    }

    private _validateOptions(options: Partial<ICollectionEditorOptions>): true | never {
        if (!options.collection) {
            throw Error(ERROR_MSG.COLLECTION_IS_REQUIRED);
        }
        if (!options.collection.getCollection()['[Types/_collection/RecordSet]']) {
            throw Error(ERROR_MSG.SOURCE_COLLECTION_MUST_BE_RECORDSET);
        }
        return true;
    }

    /**
     * Обновить опции контроллера.
     * @method
     * @param {Partial.<ICollectionEditorOptions>} newOptions Новые опции.
     * @void
     *
     * @public
     * @remark Все поля в новых опциях не являются обязательными, таким образом, есть возможность выборочного обновления.
     */
    updateOptions(newOptions: Partial<ICollectionEditorOptions>): void {
        const combinedOptions = {...this._options, ...newOptions};
        if (this._validateOptions(combinedOptions)) {
            this._options = combinedOptions;
        }
    }

    /**
     * Запустить редактирование переданного элемента.
     * @method
     * @param {Types/entity:Model} item Элемент для редактирования
     * @void
     * @public
     */
    edit(item: Model): void {
        if (typeof this._editingKey !== 'undefined') {
            throw Error(ERROR_MSG.EDITING_IS_ALREADY_RUNNING);
        }

        const collectionItem = this._options.collection.getItemBySourceKey(item.getKey());
        if (!collectionItem) {
            throw Error(ERROR_MSG.ITEM_FOR_EDITING_MISSED_IN_COLLECTION);
        }

        const editingItem = item.clone();
        this._editingKey = editingItem.getKey();
        collectionItem.setEditing(true, editingItem);
        this._options.collection.setEditing(true);

        // Перед редактированием запись и коллекция уже могут содержать изменения.
        // Эти изменения не должны влиять на логику редактирования по месту (завершение редактирования приводит
        // к сохранению при наличие изменений).
        editingItem.acceptChanges();
        (this._options.collection.getCollection() as unknown as RecordSet).acceptChanges();
    }

    /**
     * Начать добавление переданного элемента.
     * @method
     * @param {Types/entity:Model} item Элемент для добавления
     * @param {TAddPosition} addPosition позиция добавляемого элемента
     * @void
     * @public
     */
    add(item: Model, addPosition?: TAddPosition): void {
        if (typeof this._editingKey !== 'undefined') {
            throw Error(ERROR_MSG.EDITING_IS_ALREADY_RUNNING);
        }

        const editingItem = item.clone();

        // Попытка сохранить добавляемую запись, которой не был установлен настоящий ключ приведет к ошибке.
        // При добавлении записи без ключа, ей выдается временный ключ для корректной работы коллекции.
        // Это необходимо, т.к. допускается запуск добавления записи без кдюча, однако сохранить, ее невозможно,
        // пока не установлен настоящий ключ.
        if (editingItem.getKey() === undefined) {
            editingItem.set(editingItem.getKeyProperty(), ADDING_ITEM_EMPTY_KEY);
        }

        this._validateAddingItem(editingItem);
        this._editingKey = editingItem.getKey();

        const collectionItem = this._options.collection.createItem({
            contents: editingItem,
            isAdd: true,
            addPosition: addPosition === 'top' ? 'top' : 'bottom'
        });

        collectionItem.setEditing(true, editingItem);
        this._options.collection.setAddingItem(collectionItem);
        this._options.collection.setEditing(true);

        // Перед редактированием запись и коллекция уже могут содержать изменения.
        // Эти изменения не должны влиять на логику редактирования по месту (завершение редактирования приводит
        // к сохранению при наличие изменений).
        editingItem.acceptChanges();
        (this._options.collection.getCollection() as unknown as RecordSet).acceptChanges();
    }

    /**
     * Завершить редактирование элемента и сохранить изменения.
     * @method
     * @void
     * @public
     */
    commit(): void {
        if (this._editingKey === undefined) {
            throw Error(ERROR_MSG.HAS_NO_EDITING);
        }

        // Попытка сохранить добавляемую запись, которой не был установлен настоящий ключ приведет к ошибке.
        // При сохранении, добавляемая запись должна иметь настоящий и уникальный ключ, а не временный.
        // Временный ключ выдается добавляемой записи с отсутствующим ключом, т.к.
        // допустимо запускать добавление такой записи, в отличае от сохранения.
        const collectionItem = this._options.collection.getItemBySourceKey(this._editingKey);
        if (collectionItem.isAdd && this._editingKey === ADDING_ITEM_EMPTY_KEY) {
            throw Error(ERROR_MSG.ADDING_ITEM_KEY_WAS_NOT_SET);
        }
        collectionItem.acceptChanges();
        this._editingKey = undefined;

        this._options.collection.resetAddingItem();
        collectionItem.setEditing(false, null);
        this._options.collection.setEditing(false);
        (this._options.collection.getCollection() as unknown as RecordSet).acceptChanges();
    }

    /**
     * Завершить редактирование элемента и отменить изменения.
     * @method
     * @void
     * @public
     */
    cancel(): void {
        if (this._editingKey === undefined) {
            throw Error(ERROR_MSG.HAS_NO_EDITING);
        }

        const collectionItem = this._options.collection.getItemBySourceKey(this._editingKey);
        this._editingKey = undefined;

        this._options.collection.resetAddingItem();
        collectionItem.setEditing(false, null);
        this._options.collection.setEditing(false);
        (this._options.collection.getCollection() as unknown as RecordSet).acceptChanges();
    }

    /**
     * Получить следующий элемент коллекции, для которого доступно редактирование.
     * @method
     * @return {CollectionItem.<Types/entity:Model>|undefined}
     * @public
     */
    getNextEditableItem(): TEditableCollectionItem {
        return this._getNextEditableItem('after');
    }

    /**
     * Получить предыдущий элемент коллекции, для которого доступно редактирование.
     * @method
     * @return {CollectionItem.<Types/entity:Model>|undefined}
     * @public
     */
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
