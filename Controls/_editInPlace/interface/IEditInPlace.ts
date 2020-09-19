import {Model} from 'Types/entity';
import {Collection, CollectionItem} from 'Controls/display';
import {TKey, CONSTANTS, TAddPosition} from '../Types';

/**
 * Интерфейс опций контроллера редактирования по месту.
 * @interface Controls/_editInPlace/interface/IEditInPlaceOptions
 * @public
 * @author Родионов Е.А.
 */
/*
 * Interface of edit in place controller options.
 * @interface Controls/_editInPlace/interface/IEditInPlaceOptions
 * @public
 * @author Родионов Е.А.
 */
interface IEditInPlaceOptions {
    /**
     * @name Controls/_editInPlace/interface/IEditInPlaceOptions#collection
     * @cfg {Collection.<Types/entity:Model>} Коллекция элементов.
     */
    collection: Collection<Model>;

    /**
     * @name Controls/_editInPlace/interface/IEditInPlaceOptions#onBeforeBeginEdit
     * @cfg {TBeforeBeginEditCallback} Функция обратного вызова перед запуском редактирования.
     */
    onBeforeBeginEdit?: TBeforeBeginEditCallback;

    /**
     * @name Controls/_editInPlace/interface/IEditInPlaceOptions#onAfterBeginEdit
     * @cfg {Function} Функция обратного вызова после запуска редактирования.
     * @param {Types/entity:Model} item Запись для которой запускается редактирование.
     * @param {Boolean} isAdd Флаг, принимает значение true, если запись добавляется.
     * @void
     */
    onAfterBeginEdit?: (item: Model, isAdd: boolean) => void;

    /**
     * @name Controls/_editInPlace/interface/IEditInPlaceOptions#onBeforeEndEdit
     * @cfg {TBeforeEndEditCallback} Функция обратного вызова перед завершением редактирования.
     */
    onBeforeEndEdit?: TBeforeEndEditCallback;

    /**
     * @name Controls/_editInPlace/interface/IEditInPlaceOptions#onAfterEndEdit
     * @cfg {Function} Функция обратного вызова после завершением редактирования.
     * @param {Types/entity:Model} item Редактируемая запись.
     * @param {Boolean} isAdd Флаг, принимает значение true, если запись добавлялась.
     * @void
     */
    onAfterEndEdit?: (item: Model, isAdd: boolean) => void;
}

/**
 * @typedef {Promise.<void | { canceled: true }>} TOperationPromise
 * @description Тип возвращаемого значения из операций редактирования по месту.
 */
type TOperationPromise = Promise<void | { canceled: true }>;

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
 * Интерфейс контроллера редактирования по месту.
 * @interface Controls/_editInPlace/interface/IEditInPlace
 * @public
 * @author Родионов Е.А.
 */
/*
 * Interface of edit in place controller.
 * @interface Controls/_editInPlace/interface/IEditInPlace
 * @public
 * @author Родионов Е.А.
 */
interface IEditInPlace {
    /**
     * Обновить опции контроллера.
     * @method
     * @param {Partial.<IEditInPlaceOptions>} options Новые опции.
     * @void
     *
     * @public
     * @remark Все поля в новых опциях не являются обязательными, таким образом, есть возможность выборочного обновления.
     */
    updateOptions(options: Partial<IEditInPlaceOptions>): void;

    /**
     * Запустить редактирование переданного элемента. Если элемент не передан, ожидается что он будет возвращен из функции обратного вызова IEditInPlaceOptions.onBeforeBeginEdit.
     * @method
     * @param {Types/entity:Model|undefined} item Элемент для редактирования
     * @return {TOperationPromise}
     *
     * @public
     * @async
     *
     * @remark Запуск редактирования может быть отменен. Для этого из функции обратного вызова IEditInPlaceOptions.onBeforeBeginEdit необхобимо вернуть константу отмены.
     */
    edit(item?: Model): TOperationPromise;

    /**
     * Начинать добавление переданного элемента. Если элемент не передан, ожидается что он будет возвращен из функции обратного вызова IEditInPlaceOptions.onBeforeBeginEdit.
     * @method
     * @param {Types/entity:Model|undefined} item Элемент для добавления
     * @param {TAddPosition} addPosition позиция добавляемого элемента
     * @return {TOperationPromise}
     *
     * @public
     * @async
     *
     * @see IEditInPlaceOptions.onBeforeBeginEdit
     * @see IEditInPlaceOptions.onAfterBeginEdit
     *
     * @remark Запуск добавления может быть отменен. Для этого из функции обратного вызова IEditInPlaceOptions.onBeforeBeginEdit необхобимо вернуть константу отмены.
     */
    add(item: Model | undefined, addPosition: 'top' | 'bottom'): TOperationPromise;

    /**
     * Завершить редактирование элемента и сохранить изменения.
     * @method
     * @return {TOperationPromise}
     *
     * @public
     * @async
     *
     * @see IEditInPlaceOptions.onBeforeEndEdit
     * @see IEditInPlaceOptions.onAfterEndEdit
     *
     * @remark Завершение редактирования может быть отменено. Для этого из функции обратного вызова IEditInPlaceOptions.onBeforeEndEdit необхобимо вернуть константу отмены.
     */
    commit(): TOperationPromise;

    /**
     * Завершить редактирование элемента и отменить изменения.
     * @method
     * @return {TOperationPromise}
     *
     * @public
     * @async
     *
     * @see IEditInPlaceOptions.onBeforeEndEdit
     * @see IEditInPlaceOptions.onAfterEndEdit
     *
     * @remark Завершение редактирования может быть отменено. Для этого из функции обратного вызова IEditInPlaceOptions.onBeforeEndEdit необхобимо вернуть константу отмены.
     */
    cancel(): TOperationPromise;

    /**
     * Получить ключ редактируемого элемента
     * @method
     * @return {TKey|Undefined}
     * @public
     */
    getEditingKey(): TKey;

    /**
     * Получить редактируемый элемент
     * @method
     * @return {Types/entity:Model|undefined}
     * @public
     */
    getEditingItem(): Model | undefined;

    /**
     * Получить следующий элемент коллекции, для которого доступно редактирование.
     * @method
     * @return {CollectionItem.<Types/entity:Model>|undefined}
     * @public
     */
    getNextEditableItem(): CollectionItem<Model> | undefined;

    /**
     * Получить предыдущий элемент коллекции, для которого доступно редактирование.
     * @method
     * @return {CollectionItem.<Types/entity:Model>|undefined}
     * @public
     */
    getPrevEditableItem(): CollectionItem<Model> | undefined;
}

export {
    IEditInPlace,
    IEditInPlaceOptions,
    TOperationPromise as TAsyncOperationResult
};
