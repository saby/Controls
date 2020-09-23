import {Model, DestroyableMixin} from 'Types/entity';
import {Logger} from 'UI/Utils';
import {CONSTANTS, TEditableCollectionItem} from './Types';
import {CollectionEditor} from './CollectionEditor';
import {mixin} from 'Types/util';
import {Collection} from 'Controls/display';

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
    collection: Collection<Model>;

    /**
     * @name Controls/_editInPlace/IEditInPlaceOptions#onBeforeBeginEdit
     * @cfg {TBeforeBeginEditCallback} Функция обратного вызова перед запуском редактирования.
     */
    onBeforeBeginEdit?: TBeforeBeginEditCallback;

    /**
     * @name Controls/_editInPlace/IEditInPlaceOptions#onAfterBeginEdit
     * @cfg {Function} Функция обратного вызова после запуска редактирования.
     * @param {Types/entity:Model} item Запись для которой запускается редактирование.
     * @param {Boolean} isAdd Флаг, принимает значение true, если запись добавляется.
     * @void
     */
    onAfterBeginEdit?: (item: Model, isAdd: boolean) => void;

    /**
     * @name Controls/_editInPlace/IEditInPlaceOptions#onBeforeEndEdit
     * @cfg {TBeforeEndEditCallback} Функция обратного вызова перед завершением редактирования.
     */
    onBeforeEndEdit?: TBeforeEndEditCallback;

    /**
     * @name Controls/_editInPlace/IEditInPlaceOptions#onAfterEndEdit
     * @cfg {Function} Функция обратного вызова после завершением редактирования.
     * @param {Types/entity:Model} item Редактируемая запись.
     * @param {Boolean} isAdd Флаг, принимает значение true, если запись добавлялась.
     * @void
     */
    onAfterEndEdit?: (item: Model, isAdd: boolean) => void;
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
    private _options: IEditInPlaceOptions;
    private _collectionEditor: CollectionEditor;
    private _operationsPromises: {
        begin?: TAsyncOperationResult;
        end?: TAsyncOperationResult;
    } = {};

    constructor(options: IEditInPlaceOptions) {
        super();
        this.updateOptions(options);
    }

    /**
     * Обновить опции контроллера.
     * @method
     * @param {Partial.<Controls/_editInPlace/IEditInPlaceOptions>} newOptions Новые опции.
     * @void
     *
     * @public
     * @remark Все поля в новых опциях не являются обязательными, таким образом, есть возможность выборочного обновления.
     */
    updateOptions(newOptions: Partial<IEditInPlaceOptions>): void {
        const oldOptions: Partial<IEditInPlaceOptions> = this._options || {};
        const hasCollection = !!newOptions.collection || !!oldOptions.collection;

        if (!hasCollection) {
            Logger.error(ERROR_MSG.COLLECTION_IS_NOT_DEFINED, this);
        }
        const getOptionValue = (optionName: keyof IEditInPlaceOptions) =>
            newOptions.hasOwnProperty(optionName) ? newOptions[optionName] : oldOptions[optionName];

        this._options = {
            collection: getOptionValue('collection'),
            onBeforeBeginEdit: getOptionValue('onBeforeBeginEdit'),
            onAfterBeginEdit: getOptionValue('onAfterBeginEdit'),
            onBeforeEndEdit: getOptionValue('onBeforeEndEdit'),
            onAfterEndEdit: getOptionValue('onAfterEndEdit')
        } as IEditInPlaceOptions;

        if (!this._collectionEditor) {
            this._collectionEditor = new CollectionEditor(this._options);
        } else {
            this._collectionEditor.updateOptions(this._options);
        }
    }

    /**
     * Получить редактируемый элемент
     * @method
     * @return {Types/entity:Model|undefined}
     * @public
     */
    getEditingItem(): Model | undefined {
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
    commit(): TAsyncOperationResult {
        return this._endEdit(true);
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
    getNextEditableItem(): TEditableCollectionItem {
        return this._collectionEditor.getNextEditableItem();
    }

    /**
     * Получить предыдущий элемент коллекции, для которого доступно редактирование.
     * @method
     * @return {CollectionItem.<Types/entity:Model>|undefined}
     * @public
     */
    getPrevEditableItem(): TEditableCollectionItem {
        return this._collectionEditor.getPrevEditableItem();
    }

    // tslint:disable-next-line:max-line-length
    private _endPreviousAndBeginEdit(item: Model | undefined, isAdd: boolean, addPosition?: 'top' | 'bottom'): TAsyncOperationResult {
        const editingItem = this.getEditingItem();

        if (editingItem && item && editingItem.getKey() === item.getKey()) {
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
        if (this.getEditingItem()) {
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
                model = result.item;
            } else if (item && item instanceof Model) {
                model = item;
            } else {
                Logger.error(ERROR_MSG.ITEM_MISSED, this);
                return {canceled: true};
            }
            this._collectionEditor[isAdd ? 'add' : 'edit'](model, addPosition);
            if (this._options.onAfterBeginEdit) {
                this._options.onAfterBeginEdit(this._collectionEditor.getEditingItem(), isAdd);
            }
        }).finally(() => {
            this._operationsPromises.begin = null;
        }) as TAsyncOperationResult;

        return this._operationsPromises.begin;
    }

    // TODO: Должен возвращать один промис, если вызвали несколько раз подряд
    private _endEdit(commit: boolean): TAsyncOperationResult {
        const editingItem = this.getEditingItem();

        if (!editingItem) {
            return Promise.resolve();
        }

        if (this._operationsPromises.end) {
            return this._operationsPromises.end;
        }

        const isAdd = this._options.collection.getItemBySourceKey(this.getEditingItem().getKey()).isAdd;

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
            this._options?.onAfterEndEdit(editingItem, isAdd);
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
