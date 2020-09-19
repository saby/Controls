import {Model} from 'Types/entity';
import {Collection, CollectionItem} from 'Controls/display';
import {TKey} from '../Types';

/**
 * Интерфейс опций контроллера редактирования коллекции.
 * @interface Controls/_editInPlace/interface/ICollectionEditorOptions
 * @public
 * @author Родионов Е.А.
 */
/*
 * Interface of collection editor controller options.
 * @interface Controls/_editInPlace/interface/ICollectionEditorOptions
 * @public
 * @author Родионов Е.А.
 */
export interface ICollectionEditorOptions {
    /**
     * @name Controls/_editInPlace/interface/ICollectionEditorOptions#collection
     * @cfg {Collection.<Types/entity:Model>} Коллекция элементов.
     */
    collection: Collection<Model>;
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
 * Интерфейс контроллера редактирования коллекции.
 * @interface Controls/_editInPlace/interface/ICollectionEditor
 * @public
 * @author Родионов Е.А.
 */
/*
 * Interface of collection editor controller.
 * @interface Controls/_editInPlace/interface/ICollectionEditor
 * @public
 * @author Родионов Е.А.
 */
export interface ICollectionEditor {
    /**
     * Обновить опции контроллера.
     * @method
     * @param {Partial.<ICollectionEditorOptions>} options Новые опции.
     * @void
     *
     * @public
     * @remark Все поля в новых опциях не являются обязательными, таким образом, есть возможность выборочного обновления.
     */
    updateOptions(options: Partial<ICollectionEditorOptions>): void;

    /**
     * Запустить редактирование переданного элемента.
     * @method
     * @param {Types/entity:Model} item Элемент для редактирования
     * @void
     * @public
     */
    edit(item: Model): void;

    /**
     * Начинать добавление переданного элемента.
     * @method
     * @param {Types/entity:Model} item Элемент для добавления
     * @param {TAddPosition} addPosition позиция добавляемого элемента
     * @void
     * @public
     */
    add(item: Model, addPosition: 'top' | 'bottom'): void;

    /**
     * Завершить редактирование элемента и сохранить изменения.
     * @method
     * @void
     * @public
     */
    commit(): void;

    /**
     * Завершить редактирование элемента и отменить изменения.
     * @method
     * @void
     * @public
     */
    cancel(): void;

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
