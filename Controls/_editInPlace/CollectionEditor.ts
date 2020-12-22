import {DestroyableMixin, Model} from 'Types/entity';
import {TKey, TAddPosition} from './Types';
import {mixin} from 'Types/util';
import {IEditableCollection, IEditableCollectionItem, TreeItem} from 'Controls/display';

export const ERROR_MSG = {
    ADDING_ITEM_KEY_WAS_NOT_SET: 'Adding item key was not set. Key is required. You can set the key ' +
        'before edit while prepare adding item or in callbacks: beforeBeginEdit and beforeEndEdit.',
    ADD_ITEM_KEY_DUPLICATED: 'Duplicating keys in editable collection. Adding item has the same key as item which is already exists in collection.',
    ITEM_FOR_EDITING_MISSED_IN_COLLECTION: 'Item passed for editing is missing in collection. You can edit only existing items, to add new use method add(item: Model).',
    COLLECTION_IS_REQUIRED: 'Options ICollectionEditorOptions:collection is required.',
    SOURCE_COLLECTION_MUST_BE_RECORDSET: 'Source collection must be instance of type extended of Types/collection:RecordSet.',
    HAS_NO_EDITING: 'There is no running edit in collection.',
    EDITING_IS_ALREADY_RUNNING: 'Editing is already running. Commit or cancel current before beginning new.',
    NO_FORMAT_FOR_KEY_PROPERTY: 'There is no format for item\'s key property. It is required if trying to add item with empty key. set item\'s key or format of key property.',
    PARENT_OF_ADDING_ITEM_DOES_NOT_EXIST: 'Adding in tree error. The parent of adding item doesn\'t exist. Check if the parentProperty field is filled in correctly and parent is displayed.' +
        'If you want to add item to the root, the parentProperty value of the added item must be "null"'
};

interface ICollectionEditorOptions {
    collection: IEditableCollection;
}

/**
 * Контроллер редактирования коллекции.
 *
 * @private
 * @class Controls/_editInPlace/CollectionEditor
 * @author Родионов Е.А.
 */
export class CollectionEditor extends mixin<DestroyableMixin>(DestroyableMixin) {
    private _options: ICollectionEditorOptions;
    private _editingItem: IEditableCollectionItem = null;

    constructor(options: ICollectionEditorOptions) {
        super();
        this._options = {} as ICollectionEditorOptions;
        this.updateOptions(options);
    }

    /**
     * Возвращает true, если в коллекции есть запущенное редактирование
     * @method
     * @return {Boolean}
     * @public
     */
    isEditing(): boolean {
        return !!this._editingItem;
    }

    /**
     * Получить редактируемый элемент
     * @method
     * @return {IEditableCollectionItem}
     * @public
     */
    getEditingItem(): IEditableCollectionItem | null {
        return this._editingItem;
    }

    private _validateOptions(options: Partial<ICollectionEditorOptions>): boolean | never {
        if (!options.collection) {
            throw Error(ERROR_MSG.COLLECTION_IS_REQUIRED);
        }
        if (this._options.collection === options.collection) {
            return false;
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
        if (this._editingItem) {
            throw Error(ERROR_MSG.EDITING_IS_ALREADY_RUNNING);
        }

        this._editingItem = this._options.collection.getItemBySourceKey(item.getKey());
        if (!this._editingItem) {
            this._throwEditingItemMissingError(item);
        }

        this._editingItem.setEditing(true, item);
        this._options.collection.setEditing(true);
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
        if (this._editingItem) {
            throw Error(ERROR_MSG.EDITING_IS_ALREADY_RUNNING);
        }

        // Вещественный ключ не должен дублироваться в коллекции.
        const addingItemKey = item.getKey();
        if (addingItemKey && this._options.collection.getItemBySourceKey(addingItemKey)) {
            throw Error(`${ERROR_MSG.ADD_ITEM_KEY_DUPLICATED} Duplicated key: ${addingItemKey}.`);
        }

        this._editingItem = this._options.collection.createItem({
            contents: item,
            isAdd: true,
            addPosition: addPosition === 'top' ? 'top' : 'bottom'
        });

        // У каждого элемента дерева есть родитель. Если его нет, значит конфигурация добавляемого элемента
        // ошибочна. Добавление записи не сможет начаться, если родительская запись отсутствует в дереве.
        // Родительский элемент может быть корнем, как null, так и реальной записью.
        // Таким образом, нужно проверить, что ключ корня задан в допустимом формате, а запись с таким ключом
        // либо присутствует в коллекции, либо является ее корнем.
        if (this._editingItem instanceof TreeItem) {
            const parentKey = item.get(this._options.collection.getParentProperty());
            const collectionRootKey = this._options.collection.getRoot().getContents();
            if (
                !this._isValidRootType(parentKey) || !(
                    this._options.collection.getItemBySourceKey(parentKey) ||
                    collectionRootKey === parentKey
                )
            ) {
                throw Error(
                    `There is no item with key={${parentKey}} in list. ${ERROR_MSG.PARENT_OF_ADDING_ITEM_DOES_NOT_EXIST}`
                );
            }
        }

        this._editingItem.setEditing(true, item);
        this._options.collection.setAddingItem(this._editingItem);
        this._options.collection.setEditing(true);
    }

    /**
     * Завершить редактирование элемента и сохранить изменения.
     * @method
     * @void
     * @public
     */
    commit(): void {
        if (!this._editingItem) {
            throw Error(ERROR_MSG.HAS_NO_EDITING);
        }

        // Попытка сохранить добавляемую запись, которой не был установлен настоящий ключ приведет к ошибке.
        // При сохранении, добавляемая запись должна иметь настоящий и уникальный ключ, а не временный.
        // Временный ключ выдается добавляемой записи с отсутствующим ключом, т.к.
        // допустимо запускать добавление такой записи, в отличае от сохранения.
        this._editingItem.acceptChanges();

        this._options.collection.resetAddingItem();
        this._editingItem.setEditing(false, null);
        this._options.collection.setEditing(false);
        this._editingItem = null;
    }

    /**
     * Завершить редактирование элемента и отменить изменения.
     * @method
     * @void
     * @public
     */
    cancel(): void {
        if (!this._editingItem) {
            throw Error(ERROR_MSG.HAS_NO_EDITING);
        }

        this._options.collection.resetAddingItem();
        this._editingItem.setEditing(false, null);
        this._options.collection.setEditing(false);
        this._editingItem = null;
    }

    /**
     * Получить следующий элемент коллекции, для которого доступно редактирование.
     * @method
     * @return {CollectionItem.<Types/entity:Model>|undefined}
     * @public
     */
    getNextEditableItem(): IEditableCollectionItem {
        return this._getNextEditableItem('after');
    }

    /**
     * Получить предыдущий элемент коллекции, для которого доступно редактирование.
     * @method
     * @return {CollectionItem.<Types/entity:Model>|undefined}
     * @public
     */
    getPrevEditableItem(): IEditableCollectionItem {
        return this._getNextEditableItem('before');
    }

    private _getNextEditableItem(direction: 'before' | 'after'): IEditableCollectionItem {
        let next: IEditableCollectionItem;
        const collection = this._options.collection;

        if (!this._editingItem) {
            next = collection.getFirst();
        } else {
            next = direction === 'after' ? collection.getNext(this._editingItem) :
                collection.getPrevious(this._editingItem);
        }

        while (next && !next['[Controls/_display/IEditableCollectionItem]']) {
            next = direction === 'after' ? collection.getNext(next) : collection.getPrevious(next);
        }

        return next;
    }

    private _isValidRootType(root: unknown): boolean {
        return root === null || typeof root !== 'undefined';
    }

    private _throwEditingItemMissingError(item: Model): never {
        const keys = '[\n\t' + this._options.collection.getItems()
            .filter((i) => i['[Controls/_display/IEditableCollectionItem]'])
            .map((i) => i.contents.getKey())
            .join(',\n\t') + '\n]';

        throw Error(`${ERROR_MSG.ITEM_FOR_EDITING_MISSED_IN_COLLECTION}\nEditingItemKey: {${item.getKey()}},\nCollectionKeys: ${keys}`);
    }

    destroy(): void {
        super.destroy();
        this._options = null;
        this._editingItem = null;
    }
}
