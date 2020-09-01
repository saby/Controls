import {Model, Record} from 'Types/entity';
import {BindingMixin, DataSet, ICrudPlus, IData, IRpc} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {Logger} from 'UI/Utils';
import {TKeySelection, TKeysSelection} from 'Controls/interface';
import {Confirmation, Dialog} from 'Controls/popup';
import * as InstanceChecker from 'Core/core-instance';
import * as rk from 'i18n!*';

import {IMoveDialogOptions} from '../interface/IMoveDialogOptions';
import {IMoveControllerOptions, TSource} from '../interface/IMoveControllerOptions';
import {IMoveObject,
    MOVE_POSITION,
    MOVE_TYPE,
    TMoveItem,
    TMoveItems
} from '../interface/IMoveObject';
import * as TreeItemsUtil from "../resources/utils/TreeItemsUtil";

/**
 * Контроллер для перемещения элементов списка в recordSet и dataSource.
 *
 * Полезные ссылки:
 * * <a href="/materials/Controls-demo/app/Controls-demo%2FtreeGrid%2FMover%2FBase%2FIndex">демо-пример</a>
 * * <a href="/doc/platform/developmentapl/interface-development/controls/list-environment/actions/mover/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_list.less">переменные тем оформления</a>
 *
 * @class Controls/_mover/MoveController
 * @control
 * @public
 * @author Аверкиев П.А
 */

/*
 * Controller to move the list items in recordSet and dataSource.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FOperationsPanel%2FDemo">Demo examples</a>.
 * @class Controls/_mover/Controller
 * @control
 * @public
 * @author Аверкиев П.А
 */
export class MoveController {

    protected _dialogOptions: IMoveDialogOptions;

    // пока контроллер не умеет работать с source для перемещения записей относиетльно друг друга
    private _items: RecordSet;

    // Ресурс, в котором производится смена мест
    private _source: TSource;

    // Имя свойства, хранящего ключ записи
    private _keyProperty: string;

    // Имя свойства, хранящего ключ родителя в дереве
    protected _parentProperty: string;

    // Имя свойства, хранящего флаг узла в дереве
    protected _nodeProperty: string;

    // Корень дерева для создания display при поиске ближайших записей
    protected _root: string;

    constructor(options: IMoveControllerOptions) {
        this.update(options);
    }

    /**
     * Обновляет параметры контроллера
     * @function Controls/_list/Controllers/MoveController#moveItems
     * @param {Controls/_list/interface/IMoveControllerOptions} options
     */
    update(options: IMoveControllerOptions): void {
        this._dialogOptions = options.dialog;
        this._items = options.items;
        this._keyProperty = options.keyProperty;
        this._source = options.source;
        this._items = options.items;
        this._source = options.source;
        this._filter = options.filter;
        this._nodeProperty = options.nodeProperty;
        this._parentProperty = options.parentProperty;
        this._root = options.root;
    }

    /**
     * Перемещает переданные элементы относительно указанного целевого элемента.
     * @function Controls/_list/Controllers/MoveController#moveItems
     * @param {Controls/_list/interface/IMoveObject} items Элементы для перемещения.
     * @param {Types/entity:Model|Controls/interface:TKeySelection} target Целевой элемент перемещения.
     * @param {Controls/_list/interface/IMoveObject/MOVE_POSITION.typedef} position Положение перемещения.
     * @param {String} moveType
     * @returns {Promise} Отложенный результат перемещения.
     * @remark
     * В зависимости от аргумента 'position' элементы могут быть перемещены до, после или на указанный целевой элемент.
     * @see moveItemUp
     * @see moveItemDown
     */

    /*
     * Moves the transferred items relative to the specified target item.
     * @function Controls/_list/Controllers/MoveController#moveItems
     * @param {Controls/_list/interface/IMoveObject} items Items to be moved.
     * @param {Types/entity:Model|Controls/interface:TKeySelection} target Target item to move.
     * @param {Controls/_list/interface/IMoveObject/MOVE_POSITION.typedef} position Position to move.
     * @returns {Core/Deferred} Deferred with the result of the move.
     * @remark
     * Depending on the 'position' argument, elements can be moved before, after or on the specified target item.
     * @see moveItemUp
     * @see moveItemDown
     */
    moveItems(items: IMoveObject, target: Model|TKeySelection, position: MOVE_POSITION, moveType?: string): Promise<DataSet|void> {
        if (target === undefined) {
            return Promise.resolve();
        }
        if (items.selectedKeys.length && moveType !== MOVE_TYPE.CUSTOM) {
            return this._moveInSource(items, this._getId(target), position);
        }
        return Promise.resolve();
    }

    /**
     * Перемещает один элемент вверх.
     * @function Controls/_list/Controllers/MoveController#moveItemUp
     * @param {Controls/_list/interface/IMoveObject/TMoveItem.typedef} item Элемент перемещения.
     * @returns {Promise} Отложенный результат перемещения.
     * @see moveItemDown
     * @see moveItems
     */

    /*
     * Move one item up.
     * @function Controls/_list/Controllers/MoveController#moveItemUp
     * @param {Controls/_list/interface/IMoveObject/TMoveItem.typedef} The item to be moved.
     * @returns {Promise} Deferred with the result of the move.
     * @see moveItemDown
     * @see moveItems
     */
    moveItemUp(item: TMoveItem): Promise<DataSet|void> {
        return this._moveItemToSiblingPosition(item, MOVE_POSITION.before);
    }

    /**
     * Перемещает один элемент вниз.
     * @function Controls/_list/Controllers/MoveController#moveItemDown
     * @param {Controls/_list/interface/IMoveObject/TMoveItem.typedef} item Элемент перемещения.
     * @returns {Promise} Отложенный результат перемещения.
     * @see moveItemUp
     * @see moveItems
     */

    /*
     * Move one item down.
     * @function Controls/_list/Controllers/MoveController#moveItemDown
     * @param {Controls/_list/interface/IMoveObject/TMoveItem.typedef} item The item to be moved.
     * @returns {Promise} Deferred with the result of the move.
     * @see moveItemUp
     * @see moveItems
     */
    moveItemDown(item: TMoveItem): Promise<DataSet|void> {
        return this._moveItemToSiblingPosition(item, MOVE_POSITION.after);
    }

    /**
     * Перемещение переданных элементов с предварительным выбором родительского узла с помощью диалогового окна.
     * @function Controls/_list/Controllers/MoveController#moveItemsWithDialog
     * @param {Controls/_list/interface/IMoveObject} items Элементы для перемещения.
     * @remark
     * Компонент, указанный в опции {Controls/_list/interface/IMoveDialogOptions#template dialog.template}, будет использоваться в качестве шаблона для диалога перемещения.
     * Для того, чтобы получить управление над результатом перемещения, необходимо использовать опцию
     * {Controls/_list/interface/IMoveDialogOptions#template dialog.onResultHandler}
     * @see moveItemUp
     * @see moveItemDown
     * @see moveItems
     */

    /*
     * Move the transferred items with the pre-selection of the parent node using the dialog.
     * @function Controls/_list/Controllers/MoveController#moveItemsWithDialog
     * @param {Controls/_list/interface/IMoveObject} items Items to be moved.
     * @remark
     * The component specified in the {Controls/_list/interface/IMoveDialogOptions#template dialog.template} option will be used as a template for the move dialog.
     * To get control over the result of moving, please use {Controls/_list/interface/IMoveDialogOptions#template dialog.onResultHandler} option
     * @see moveItemUp
     * @see moveItemDown
     * @see moveItems
     */
    moveItemsWithDialog(items: IMoveObject): Promise<string> {
        if (this._dialogOptions.template) {
            if (MoveController.validate(items)) {
                return this.openMoveDialog(items, items.selectedKeys)
            }
        } else {
            Logger.warn('Mover: MoveDialogTemplate option is undefined', this);
        }
        return Promise.resolve(undefined);
    }

    /**
     * Получает элемент к которому мы перемещаем текущий элемент
     * Метод сделан публичным для совместимости с HOC
     * @param item текущий элемент
     * @param position позиция (направление перемещения)
     * @private
     */
    getSiblingItem(item: TMoveItem, position: MOVE_POSITION): Model {
        //В древовидной структуре, нужно получить следующий(предыдущий) с учетом иерархии.
        //В рекордсете между двумя соседними папками, могут лежат дочерние записи одной из папок,
        //а нам необходимо получить соседнюю запись на том же уровне вложенности, что и текущая запись.
        //Поэтому воспользуемся проекцией, которая предоставляет необходимы функционал.
        //Для плоского списка можно получить следующий(предыдущий) элемент просто по индексу в рекордсете.
        if (this._parentProperty) {
            const display = TreeItemsUtil.getDefaultDisplayTree(this._items, {
                keyProperty: this._keyProperty,
                parentProperty: this._parentProperty,
                nodeProperty: this._nodeProperty
            }, {});
            if (this._root) {
                display.setRoot(this._root)
            }
            const collectionItem = display.getItemBySourceItem(this._getModel(item));
            let siblingItem;
            if (position === MOVE_POSITION.before) {
                siblingItem = display.getPrevious(collectionItem);
            } else {
                siblingItem = display.getNext(collectionItem);
            }
            return siblingItem ? siblingItem.getContents() : null;
        }
        let itemIndex = this._items.getIndex(this._getModel(item));
        return this._items.at(position === MOVE_POSITION.before ? --itemIndex : ++itemIndex);
    }

    /**
     * Открывает диалог перемещения
     * Метод сделан публичным для совместимости с HOC
     * @param {Controls/_list/interface/IMoveObject/TMoveItem.typedef} items
     * @param {Controls/interface:TKeysSelection} selectedKeys
     * @private
     */
    openMoveDialog(items: TMoveItems, selectedKeys: TKeysSelection): Promise<string> {
        const templateOptions = {
            movedItems: selectedKeys,
            source: this._source,
            keyProperty: this._keyProperty,
            ...this._dialogOptions.templateOptions
        };

        if (!this._dialogOptions.onResultHandler) {
            this._dialogOptions.onResultHandler = this._moveDialogOnResultHandler.bind(this);
        }

        return Dialog.openPopup({
            opener: this._dialogOptions.opener,
            templateOptions,
            closeOnOutsideClick: true,
            template: this._dialogOptions.template,
            eventHandlers: {
                onResult: (target: Model) => (
                    this._dialogOptions.onResultHandler(items, target)
                )
            }
        });
    }

    /**
     * Стандартный обработчик перемещения при помощи диалога
     * @param items
     * @param target
     * @private
     */
    private _moveDialogOnResultHandler(items: TMoveItems, target: Model): Promise<DataSet|void> {
        return this.moveItems(items, target.getKey(), MOVE_POSITION.on);
    }

    /**
     * Перемещает запись к ближайшей позиции
     * @param item
     * @param position
     * @private
     */
    private _moveItemToSiblingPosition (item: TMoveItem, position: MOVE_POSITION): Promise<DataSet|void> {
        const target = this.getSiblingItem(item, position);
        const moveObject: IMoveObject = {
            selectedKeys: [this._getId(item)],
            excludedKeys: undefined,
        }
        return target ? this.moveItems(moveObject, target, position) : Promise.resolve();
    }

    /**
     * Перемещает элементы в ресурсе
     * @param items
     * @param targetId
     * @param position
     * @private
     */
    protected _moveInSource(items: IMoveObject, targetId: TKeySelection, position: MOVE_POSITION): Promise<DataSet|void>  {
        if ((this._source as IRpc).call) {
            return import('Controls/operations').then((operations) => {
                const sourceAdapter = (this._source as IData).getAdapter();
                const callFilter = {
                    selection: operations.selectionToRecord({
                        selected: items.selectedKeys,
                        excluded: items.excludedKeys
                    }, sourceAdapter), ...items.filter
                };
                return (this._source as IRpc).call((this._source as BindingMixin).getBinding().move, {
                    method: (this._source as BindingMixin).getBinding().list,
                    filter: Record.fromObject(callFilter, sourceAdapter),
                    folder_id: targetId
                });
            });
        }
        return (this._source as ICrudPlus).move(items.selectedKeys, targetId, {
            position,
            parentProperty: this._parentProperty
        });
    }

    /**
     * Получает модель по item
     * Item может быть или Model или ключом
     * Еслит ключ, то идёт попытка получить модель из списка _items
     * @param item
     * @private
     */
    private _getModel(item: Model|TKeySelection): Model {
        return InstanceChecker.instanceOfModule(item, 'Types/entity:Model') ? item as Model : this._items.getRecordById(item as TKeySelection);
    }

    /**
     * Получает ключ по item
     * Item может быть или Model или ключом
     * Еслит Model, то идёт попытка получить ключ по _keyProperty
     * @param item
     * @private
     */
    private _getId(item: Model|TKeySelection): TKeySelection {
        return InstanceChecker.instanceOfModule(item, 'Types/entity:Model') ? (item as Model).get(this._keyProperty) : item as TKeySelection;
    }

    /**
     * Производит проверку переданных параметров. Если массив значений пуст, возвращает false и выводит окно с текстом, иначе возвращает true.
     * Метод сделан публичным для совместимости с HOC
     *
     * @function
     * @name Controls/_list/Controllers/MoveController#validate
     * @private
     */
    static validate(items: IMoveObject): boolean {
        let resultValidate: boolean = true;

        if (items.selectedKeys && !items.selectedKeys.length) {
            resultValidate = false;
            Confirmation.openPopup({
                type: 'ok',
                message: rk('Нет записей для обработки команды')
            });
        }

        return resultValidate;
    }
}
