import {Model, DestroyableMixin} from 'Types/entity';
import {Logger} from 'UI/Utils';
import {CONSTANTS} from './Types';
import {CollectionEditor} from './CollectionEditor';
import {RecordSet} from 'Types/collection';
import {mixin} from 'Types/util';
import {IEditableCollection, IEditableCollectionItem} from 'Controls/display';

const ERROR_MSG = {
    COLLECTION_IS_NOT_DEFINED: 'IEditInPlaceOptions.collection is not defined. Option is required. It must be installed at least once.',
    BEFORE_BEGIN_EDIT_FAILED: 'Error in callback IEditInPlaceOptions.onBeforeBeginEdit. All errors should be handled.',
    BEFORE_END_EDIT_FAILED: 'Error in callback IEditInPlaceOptions.onBeforeEndEdit. All errors should be handled.',
    ITEM_MISSED: 'Item for editing was not given. It must be given in arguments method or as a result of callback before begin edit(sync or async).'
};

/**
 * @typedef {Promise.<void | { canceled: true }>} TAsyncOperationResult
 * @description Тип возвращаемого значения из операций редактирования по месту.
 */
type TAsyncOperationResult = Promise<void | { canceled: true }>;

/**
 * @typedef {void|CONSTANTS.CANCEL|Promise.<void|{CONSTANTS.CANCEL}>} TBeforeCallbackBaseResult
 * @description Базовый тип, который можно вернуть из любой функций обратного вызова до начала операции редактирования по месту.
 */
type TBeforeCallbackBaseResult = void | CONSTANTS.CANCEL | Promise<void | CONSTANTS.CANCEL>;

/**
 * @typedef {Function} TBeforeBeginEditCallback
 * @description Функция обратного вызова перед запуском редактирования.
 * @param {Object} options Набор опций для запуска редактирования. Доступные свойства: item {Types/entity:Model} - запись для которой запускается редактирование.
 * @param {Boolean} isAdd Флаг, принимает значение true, если запись добавляется
 */
type TBeforeBeginEditCallback = (options: { item?: Model }, isAdd: boolean) =>
    TBeforeCallbackBaseResult | { item?: Model } | Promise<{ item?: Model }>;

/**
 * @typedef {Function} TBeforeEndEditCallback
 * @description Функция обратного вызова перед завершением редактирования
 * @param {Types/entity:Model} item Редактируемая запись для которой запускается завершение редактирования.
 * @param willSave Флаг, принимает значение true, если ожидается, что запись будет сохранена.
 * @param isAdd Флаг, принимает значение true, если запись добавляется
 */
type TBeforeEndEditCallback = (item: Model, willSave: boolean, isAdd: boolean) => TBeforeCallbackBaseResult;

/**
 * Интерфейс опций контроллера редактирования по месту.
 * @interface Controls/_editInPlace/IEditInPlaceOptions
 * @public
 * @author Родионов Е.А.
 */
/*
 * Interface of edit in place controller options.
 * @interface Controls/_editInPlace/IEditInPlaceOptions
 * @public
 * @author Rodionov E/
 */
interface IEditInPlaceOptions {
    /**
     * @name Controls/_editInPlace/IEditInPlaceOptions#collection
     * @cfg {Collection.<Types/entity:Model>} Коллекция элементов.
     */
    collection: IEditableCollection;
}

/**
 * @interface Controls/_editInPlace/IEditInPlaceCallbacks
 * @private
 * @author Родионов Е.А.
 */
interface IEditInPlaceCallbacks {
    /**
     * @name Controls/_editInPlace/IEditInPlaceCallbacks#onBeforeBeginEdit
     * @cfg {TBeforeBeginEditCallback} Функция обратного вызова перед запуском редактирования.
     */
    onBeforeBeginEdit?: TBeforeBeginEditCallback;

    /**
     * @name Controls/_editInPlace/IEditInPlaceCallbacks#onAfterBeginEdit
     * @cfg {Function} Функция обратного вызова после запуска редактирования.
     * @param {IEditableCollectionItem} item Запись для которой запускается редактирование.
     * @param {Boolean} isAdd Флаг, принимает значение true, если запись добавляется.
     * @void
     */
    onAfterBeginEdit?: (item: IEditableCollectionItem, isAdd: boolean) => void;

    /**
     * @name Controls/_editInPlace/IEditInPlaceCallbacks#onBeforeEndEdit
     * @cfg {TBeforeEndEditCallback} Функция обратного вызова перед завершением редактирования.
     */
    onBeforeEndEdit?: TBeforeEndEditCallback;

    /**
     * @name Controls/_editInPlace/IEditInPlaceCallbacks#onAfterEndEdit
     * @cfg {Function} Функция обратного вызова после завершением редактирования.
     * @param {IEditableCollectionItem} item Редактируемая запись.
     * @param {Boolean} isAdd Флаг, принимает значение true, если запись добавлялась.
     * @void
     */
    onAfterEndEdit?: (item: IEditableCollectionItem, isAdd: boolean) => void;
}

/**
 * Контроллер редактирования по месту.
 *
 * @mixes Types/_entity/DestroyableMixin
 * @public
 * @class Controls/_editInPlace/Controller
 * @author Родионов Е.А.
 */

/*
 * Edit in place controller.
 *
 * @mixes Types/_entity/DestroyableMixin
 * @public
 * @class Controls/_editInPlace/Controller
 * @author Rodionov E.A.
 */
export class Controller extends mixin<DestroyableMixin>(DestroyableMixin) {
    private _options: IEditInPlaceOptions & IEditInPlaceCallbacks;
    private _collectionEditor: CollectionEditor;
    private _operationsPromises: {
        begin?: TAsyncOperationResult;
        end?: TAsyncOperationResult;
    } = {};

    constructor(options: IEditInPlaceOptions & IEditInPlaceCallbacks) {
        super();
        if (this._validateOptions(options)) {
            this._options = options;
            this._collectionEditor = new CollectionEditor(this._options);
        }
    }

    /**
     * Обновить опции контроллера.
     * @method
     * @param {Controls/_editInPlace/IEditInPlaceOptions} newOptions Новые опции.
     * @void
     *
     * @public
     * @remark Все поля в новых опциях не являются обязательными, таким образом, есть возможность выборочного обновления.
     */
    updateOptions(newOptions: IEditInPlaceOptions): void {
        const combinedOptions = {...this._options, ...newOptions};
        if (this._validateOptions(combinedOptions)) {
            this._collectionEditor.updateOptions(this._options);
            this._options = combinedOptions;
        }
    }

    private _validateOptions(options: IEditInPlaceOptions): boolean {
        if (!options.collection) {
            Logger.error(ERROR_MSG.COLLECTION_IS_NOT_DEFINED, this);
            return false;
        }
        return true;
    }

    /**
     * Возвращает true, если в коллекции есть запущенное редактирование
     * @method
     * @return {Boolean}
     * @public
     */
    isEditing(): boolean {
        return this._collectionEditor.isEditing();
    }

    /**
     * Получить редактируемый элемент
     * @method
     * @return {IEditableCollectionItem}
     * @public
     */
    private _getEditingItem(): IEditableCollectionItem | undefined {
        return this._collectionEditor.getEditingItem();
    }

    /**
     * Начинать добавление переданного элемента. Если элемент не передан, ожидается что он будет возвращен из функции обратного вызова IEditInPlaceOptions.onBeforeBeginEdit.
     * @method
     * @param {Types/entity:Model|undefined} item Элемент для добавления
     * @param {TAddPosition} addPosition позиция добавляемого элемента
     * @return {TAsyncOperationResult}
     *
     * @public
     * @async
     *
     * @see Controls/_editInPlace/IEditInPlaceOptions#onBeforeBeginEdit
     * @see Controls/_editInPlace/IEditInPlaceOptions#onAfterBeginEdit
     *
     * @remark Запуск добавления может быть отменен. Для этого из функции обратного вызова IEditInPlaceOptions.onBeforeBeginEdit необхобимо вернуть константу отмены.
     */
    add(item?: Model | undefined, addPosition: 'top' | 'bottom' = 'bottom'): TAsyncOperationResult {
        return this._endPreviousAndBeginEdit(item, true, addPosition);
    }

    /**
     * Запустить редактирование переданного элемента. Если элемент не передан, ожидается что он будет возвращен из функции обратного вызова IEditInPlaceOptions.onBeforeBeginEdit.
     * @method
     * @param {Types/entity:Model|undefined} item Элемент для редактирования
     * @return {TAsyncOperationResult}
     *
     * @public
     * @async
     *
     * @remark Запуск редактирования может быть отменен. Для этого из функции обратного вызова IEditInPlaceOptions.onBeforeBeginEdit необхобимо вернуть константу отмены.
     */
    edit(item?: Model): TAsyncOperationResult {
        return this._endPreviousAndBeginEdit(item, false);
    }

    /**
     * Завершить редактирование элемента и сохранить изменения.
     * @method
     * @return {TAsyncOperationResult}
     *
     * @public
     * @async
     *
     * @see Controls/_editInPlace/IEditInPlaceOptions#onBeforeEndEdit
     * @see Controls/_editInPlace/IEditInPlaceOptions#onAfterEndEdit
     *
     * @remark Завершение редактирования может быть отменено. Для этого из функции обратного вызова IEditInPlaceOptions.onBeforeEndEdit необхобимо вернуть константу отмены.
     */
    commit(strategy: 'hasChanges' | 'all' = 'all'): TAsyncOperationResult {
        return this._endEdit(true, strategy);
    }

    /**
     * Завершить редактирование элемента и отменить изменения.
     * @method
     * @return {TAsyncOperationResult}
     *
     * @public
     * @async
     *
     * @see Controls/_editInPlace/IEditInPlaceOptions#onBeforeEndEdit
     * @see Controls/_editInPlace/IEditInPlaceOptions#onAfterEndEdit
     *
     * @remark Завершение редактирования может быть отменено. Для этого из функции обратного вызова IEditInPlaceOptions.onBeforeEndEdit необхобимо вернуть константу отмены.
     */
    cancel(): TAsyncOperationResult {
        return this._endEdit(false);
    }

    /**
     * Получить следующий элемент коллекции, для которого доступно редактирование.
     * @method
     * @return {CollectionItem.<Types/entity:Model>|undefined}
     * @public
     */
    getNextEditableItem(): IEditableCollectionItem {
        return this._collectionEditor.getNextEditableItem();
    }

    /**
     * Получить предыдущий элемент коллекции, для которого доступно редактирование.
     * @method
     * @return {CollectionItem.<Types/entity:Model>|undefined}
     * @public
     */
    getPrevEditableItem(): IEditableCollectionItem {
        return this._collectionEditor.getPrevEditableItem();
    }

    // tslint:disable-next-line:max-line-length
    private _endPreviousAndBeginEdit(item: Model | undefined, isAdd: boolean, addPosition?: 'top' | 'bottom'): TAsyncOperationResult {
        const editingItem = this._getEditingItem()?.contents;

        if (editingItem && item && editingItem.isEqual(item)) {
            return Promise.resolve();
        } else if (editingItem) {
            return this._endEdit(editingItem.isChanged()).then((result) => {
                if (result && result.canceled) {
                    return result;
                }
                return this._beginEdit(item, isAdd, addPosition);
            });
        } else {
            return this._beginEdit(item, isAdd, addPosition);
        }
    }

    // TODO: Должен возвращать один промис, если вызвали несколько раз подряд
    private _beginEdit(item: Model | undefined, isAdd: boolean, addPosition?: 'top' | 'bottom'): TAsyncOperationResult {
        if (this._getEditingItem()) {
            return Promise.resolve({canceled: true});
        }

        if (this._operationsPromises.begin) {
            return this._operationsPromises.begin;
        }

        this._operationsPromises.begin = new Promise((resolve) => {
            if (this._options.onBeforeBeginEdit) {
                resolve(this._options.onBeforeBeginEdit({item}, isAdd));
            } else {
                resolve();
            }
        }).catch((err) => {
            Logger.error(ERROR_MSG.BEFORE_BEGIN_EDIT_FAILED, this, err);
            return CONSTANTS.CANCEL;
        }).then((result?: { item: Model } | CONSTANTS.CANCEL) => {
            if (result === CONSTANTS.CANCEL) {
                return {canceled: true};
            }
            let model;
            if ((result && result.item) instanceof Model) {
                model = result.item.clone();
            } else if (item && item instanceof Model) {
                model = item.clone();
            } else {
                Logger.error(ERROR_MSG.ITEM_MISSED, this);
                return {canceled: true};
            }
            this._collectionEditor[isAdd ? 'add' : 'edit'](model, addPosition);

            // Перед редактированием запись и коллекция уже могут содержать изменения.
            // Эти изменения не должны влиять на логику редактирования по месту (завершение редактирования приводит
            // к сохранению при наличие изменений).
            model.acceptChanges();
            (this._options.collection.getCollection() as unknown as RecordSet).acceptChanges();

            if (this._options.onAfterBeginEdit) {
                this._options.onAfterBeginEdit(this._getEditingItem(), isAdd);
            }
        }).finally(() => {
            this._operationsPromises.begin = null;
        }) as TAsyncOperationResult;

        return this._operationsPromises.begin;
    }

    // TODO: Должен возвращать один промис, если вызвали несколько раз подряд
    private _endEdit(commit: boolean, commitStrategy: 'hasChanges' | 'all' = 'all'): TAsyncOperationResult {
        const editingCollectionItem = this._getEditingItem();

        if (!editingCollectionItem) {
            return Promise.resolve();
        }

        if (this._operationsPromises.end) {
            return this._operationsPromises.end;
        }

        const editingItem = editingCollectionItem.contents;
        const isAdd = editingCollectionItem.isAdd;

        if (commit && commitStrategy === 'hasChanges' && !editingItem.isChanged()) {
            return Promise.resolve(this._collectionEditor.cancel());
        }

        this._operationsPromises.end = new Promise((resolve) => {
            if (this._options.onBeforeEndEdit) {
                resolve(this._options.onBeforeEndEdit(editingItem, commit, isAdd));
            } else {
                resolve();
            }
        }).catch((err) => {
            Logger.error(ERROR_MSG.BEFORE_END_EDIT_FAILED, this, err);
            return CONSTANTS.CANCEL;
        }).then((result) => {
            if (result === CONSTANTS.CANCEL) {
                return {canceled: true};
            }
            this._collectionEditor[commit ? 'commit' : 'cancel']();
            (this._options.collection.getCollection() as unknown as RecordSet).acceptChanges();
            this._options?.onAfterEndEdit(editingCollectionItem, isAdd);
        }).finally(() => {
            this._operationsPromises.end = null;
        }) as TAsyncOperationResult;

        return this._operationsPromises.end;
    }

    destroy(): void {
        super.destroy();
        this._collectionEditor = null;
        this._options = null;
    }
}
