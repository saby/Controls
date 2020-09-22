import {Model} from 'Types/entity';

import {Collection, CollectionItem} from 'Controls/display';
import {
    TOperationPromise,
    TKey,
    TBeforeBeginEditCallback,
    TBeforeEndEditCallback
} from './Types';

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
export interface IEditInPlaceOptions {
    /**
     * @name Controls/_editInPlace/interface/IEditInPlaceOptions#collection
     * @cfg {Collection.<Model>} Коллекция элементов.
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
 * @typedef {String} TAddPosition
 * @description Позиция в коллекции добавляемого элемента. Позиция определяется относительно определенного набора данных.
 * Если элемент добавляется в группу, то набором будут все элементы группы.
 * Если элемент добавляется в родителя, то набором будут все дочерние элементы родителя.
 * Если элемент добавляется в корень, то набором будут все элементы коллекции.
 * @variant top Добавить элемент в начало набора данных.
 * @variant bottom  Добавить элемент в конец набора данных.
 */
type TAddPosition = 'top' | 'bottom';

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
export interface IEditInPlace {
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
     * Получить следующий элемент коллекции, для которого доступно редактирование.
     * @method
     * @return {CollectionItem.<Model>|undefined}
     * @public
     */
    getNextEditableItem(): CollectionItem<Model> | undefined;

    /**
     * Получить предыдущий элемент коллекции, для которого доступно редактирование.
     * @method
     * @return {CollectionItem.<Model>|undefined}
     * @public
     */
    getPrevEditableItem(): CollectionItem<Model> | undefined;
}
