import {Model, Record} from 'Types/entity';
import {DataSet, SbisService, ICrudPlus, Query, QueryOrderSelector} from 'Types/source';
import {Logger} from 'UI/Utils';
import {ISelectionObject} from 'Controls/interface';
import {Confirmation, Dialog, IBasePopupOptions} from 'Controls/popup';
import * as rk from 'i18n!*';

import {IHashMap} from 'Types/declarations';
import {IMoverDialogTemplateOptions} from 'Controls/moverDialog';
import {CrudEntityKey, LOCAL_MOVE_POSITION} from 'Types/source';
import {ISiblingStrategy} from '../interface/ISiblingStrategy';

// @todo https://online.sbis.ru/opendoc.html?guid=2f35304f-4a67-45f4-a4f0-0c928890a6fc
type TSource = SbisService|ICrudPlus;
type TFilterObject = IHashMap<any>;

interface IValidationResult {
    message: string;
    isError: boolean;
}

/**
 * Интерфейс опций контроллера.
 * @author Аверкиев П.А.
 * @private
 */
export interface IMoveControllerOptions {
    /**
     * @cfg {TSource} Ресурс, в котором производится перемещение
     */
    source: TSource;
    /**
     * @cfg {String} Имя поля, содержащего идентификатор родительского элемента.
     */
    parentProperty: string;
    /**
     * @cfg {Controls/popup:IBaseOpener} опции диалога перемещения
     */
    popupOptions?: IBasePopupOptions;
    /**
     * @cfg Array<{[columnName: string] Массив сортировок. Необходим при перемещении записей вверх/вниз
     */
    sorting: QueryOrderSelector;
    /**
     * Стратегия поиска соседних записей
     */
    siblingStrategy: ISiblingStrategy;
}

/**
 * Контроллер для перемещения элементов списка.
 *
 * @class Controls/_list/Controllers/MoveController
 *
 * @public
 * @author Аверкиев П.А
 */
export class MoveController {

    // Опции диалога перемещения записей
    protected _popupOptions: IBasePopupOptions;

    // Ресурс данных, в котором производится смена мест
    private _source: TSource;

    // Имя свойства, хранящего ключ родителя в дереве, необходим для _moveInSource
    protected _parentProperty: string;

    // Сортировка при перемещении вверх/вниз
    private _sorting: QueryOrderSelector;

    // Стратегия поиска следующего/предыдущего элемента в списке
    private _siblingStrategy: ISiblingStrategy;

    constructor(options: IMoveControllerOptions) {
        this.updateOptions(options);
    }

    /**
     * Обновляет параметры контроллера
     * @function Controls/_list/Controllers/MoveController#updateOptions
     * @param {Controls/_list/Controllers/MoveController/IMoveControllerOptions} options
     */
    updateOptions(options: IMoveControllerOptions): void {
        this._popupOptions = options.popupOptions;
        this._source = options.source;
        this._parentProperty = options.parentProperty;
        this._sorting = options.sorting;
        this._siblingStrategy = options.siblingStrategy;
    }

    /**
     * Перемещает переданные элементы относительно указанного целевого элемента или в указанную папку.
     * @function Controls/_list/Controllers/MoveController#move
     * @param {Controls/interface:ISelectionObject} selection Элементы для перемещения.
     * @param {TFilterObject} filter Дополнительный фильтр для перемещения в папку через SbisService.
     * @param {Types/source:CrudEntityKey} targetKey Идентификатор целевой записи, относительно которой позиционируются
     * перемещаемые записи или идентификатор папки, в которую происходит перемещение.
     * @param {Types/source:LOCAL_MOVE_POSITION} position Положение перемещения.
     * @returns {Promise} Отложенный результат перемещения.
     * @remark
     * В зависимости от аргумента 'position' элементы могут быть перемещены до, после или на указанный целевой элемент.
     * @see moveUp
     * @see moveDown
     */
    move(selection: ISelectionObject,
         filter: TFilterObject = {},
         targetKey: CrudEntityKey,
         position: LOCAL_MOVE_POSITION): Promise<DataSet | void> {
        return this._moveInSource(selection, filter, targetKey, position);
    }

    /**
     * Перемещает переданный элемент на один пункт вверх.
     * @param {Controls/interface:ISelectionObject} selection Элементы для перемещения.
     * @returns {Promise} Отложенный результат перемещения.
     */
    moveUp(selection: ISelectionObject): Promise<void> {
        const siblingKey = this._getSiblingKey(selection.selected[0], LOCAL_MOVE_POSITION.Before);
        return this.move(selection, {}, siblingKey, LOCAL_MOVE_POSITION.Before) as Promise<void>;
    }

    /**
     * Перемещает переданный элемент на один пункт вниз.
     * @param {Controls/interface:ISelectionObject} selection Элементы для перемещения.
     * @returns {Promise} Отложенный результат перемещения.
     */
    moveDown(selection: ISelectionObject): Promise<void> {
        const siblingKey = this._getSiblingKey(selection.selected[0], LOCAL_MOVE_POSITION.After);
        return this.move(selection, {}, siblingKey, LOCAL_MOVE_POSITION.After) as Promise<void>;
    }

    /**
     * Перемещение переданных элементов с предварительным выбором родительского узла с помощью диалогового окна.
     * @function Controls/_list/Controllers/MoveController#moveWithDialog
     * @param {Controls/interface:ISelectionObject} selection Элементы для перемещения.
     * @param {TFilterObject} filter дополнительный фильтр для перемещения в SbisService.
     * @see moveUp
     * @see moveDown
     * @see move
     */
    moveWithDialog(selection: ISelectionObject, filter: TFilterObject = {}): Promise<DataSet> {
        const validationResult = MoveController._validateBeforeOpenDialog(selection, this._popupOptions);
        if (validationResult.message === undefined) {
            return this._openMoveDialog(selection, filter);
        } else if (!validationResult.isError) {
            Confirmation.openPopup({
                type: 'ok',
                message: rk('Нет записей для обработки команды')
            });
            return Promise.reject();
        }
        Logger.error(validationResult.message);
        return Promise.reject(new Error(validationResult.message));
    }

    /**
     * Открывает диалог перемещения
     * @param {Controls/interface:ISelectionObject} selection Элементы для перемещения.
     * @param {TFilterObject} filter дополнительный фильтр для перемещения в SbisService.
     * @private
     */
    private _openMoveDialog(selection: ISelectionObject, filter?: TFilterObject): Promise<DataSet> {
        const templateOptions: IMoverDialogTemplateOptions = {
            movedItems: selection.selected,
            source: this._source,
            ...(this._popupOptions.templateOptions as IMoverDialogTemplateOptions)
        };

        return new Promise((resolve) => {
            Dialog.openPopup({
                opener: this._popupOptions.opener,
                templateOptions,
                closeOnOutsideClick: true,
                template: this._popupOptions.template,
                eventHandlers: {
                    onResult: (target: Model) => {
                        // null при перемещении записей в корень
                        const targetKey = target === null ? target : target.getKey();
                        resolve(
                            this._moveInSource(selection, filter, targetKey, LOCAL_MOVE_POSITION.On) as Promise<DataSet>
                        );
                    }
                }
            });
        });
    }

    /**
     * Перемещает элементы в ICrudPlus
     * @param {Controls/interface:ISelectionObject} selection Элементы для перемещения.
     * @param {TFilterObject} filter дополнительный фильтр для перемещения в папку в SbisService.
     * @param {Types/source:CrudEntityKey} targetKey Идентификатор целевой записи, относительно которой позиционируются перемещаемые.
     * @param position
     * @private
     */
    private _moveInSource(selection: ISelectionObject,
                          filter: TFilterObject = {},
                          targetKey: CrudEntityKey,
                          position: LOCAL_MOVE_POSITION): Promise<DataSet | void>  {
        const validationResult: IValidationResult = MoveController
            ._validateBeforeMove(this._source, selection, filter, targetKey, position);
        if (validationResult.message !== undefined) {
            if (validationResult.isError) {
                Logger.error(validationResult.message);
                return Promise.reject(new Error(validationResult.message));
            }
            return Promise.reject();
        }
        /**
         * https://online.sbis.ru/opendoc.html?guid=2f35304f-4a67-45f4-a4f0-0c928890a6fc
         * При использовании ICrudPlus.move() мы не можем передать filter и folder_id, т.к. такой контракт
         * не соответствует стандартному контракту SbisService.move(). Поэтому здесь вызывается call
         */
        if ((this._source as SbisService).call && position === LOCAL_MOVE_POSITION.On) {
            const source: SbisService = this._source as SbisService;
            return new Promise((resolve) => {
                import('Controls/operations').then((operations) => {
                    const sourceAdapter = source.getAdapter();
                    const callFilter = {
                        ...filter,
                        selection: operations.selectionToRecord(selection, sourceAdapter)
                    };
                    source.call(source.getBinding().move, {
                        method: source.getBinding().list,
                        filter: Record.fromObject(callFilter, sourceAdapter),
                        folder_id: targetKey
                    }).then((result: DataSet) => {
                        resolve(result);
                    });
                });
            });
        }
        const query = new Query().orderBy(this._sorting);
        return this._source.move(selection.selected, targetKey, {
            position,
            query,
            parentProperty: this._parentProperty
        });
    }

    private _getSiblingKey(selectedKey: CrudEntityKey, position: LOCAL_MOVE_POSITION): CrudEntityKey {
        let siblingItem;
        if (position === LOCAL_MOVE_POSITION.Before) {
            siblingItem = this._siblingStrategy.getPrevByKey(selectedKey);
        } else {
            siblingItem = this._siblingStrategy.getNextByKey(selectedKey);
        }
        const siblingKey = siblingItem && siblingItem.getKey();
        return siblingKey !== undefined ? siblingKey : null;
    }

    /**
     * Перемещает элементы в ICrudPlus
     * @param {TSource} source Ресурс данных
     * @param {Controls/interface:ISelectionObject} selection Элементы для перемещения.
     * @param {TFilterObject} filter дополнительный фильтр для перемещения в папку в SbisService.
     * @param {Types/source:CrudEntityKey} targetKey Идентификатор целевой записи, относительно которой позиционируются перемещаемые.
     * @param position
     * @private
     */
    private static _validateBeforeMove(
        source: TSource,
        selection: ISelectionObject,
        filter: TFilterObject,
        targetKey: CrudEntityKey,
        position: LOCAL_MOVE_POSITION): IValidationResult {
        const result: IValidationResult = {
            message: undefined,
            isError: true
        };
        if (!source) {
            result.message = 'MoveController: Source is not set';
        }
        if (!selection || (!selection.selected && !selection.excluded)) {
            result.message = 'MoveController: Selection type must be Controls/interface:ISelectionObject';
        }
        if (typeof filter !== 'object') {
            result.message = 'MoveController: Filter must be plain object';
        }
        if (targetKey === undefined) {
            result.message = 'MoveController: Target key is undefined';
        }
        if (targetKey === null && position !== LOCAL_MOVE_POSITION.On) {
            result.message = null;
            result.isError = false;
        }
        if ([LOCAL_MOVE_POSITION.On, LOCAL_MOVE_POSITION.After, LOCAL_MOVE_POSITION.Before].indexOf(position) === -1) {
            result.message = 'MoveController: position must correspond with Types/source:LOCAL_MOVE_POSITION type';
        }
        return result;
    }

    /**
     * Производит проверку переданного объекта с идентификаторами элементов для перемещения.
     * Если список идентификаторов пуст, возвращает false и выводит окно с текстом, иначе возвращает true.
     * @function
     * @name Controls/_list/Controllers/MoveController#_validateBeforeOpenDialog
     * @private
     */
    private static _validateBeforeOpenDialog(selection: ISelectionObject,
                                             popupOptions: IBasePopupOptions): IValidationResult {
        const result: IValidationResult = {
            message: undefined,
            isError: false
        };
        if (!popupOptions.template) {
            result.message = 'MoveController: MoveDialogTemplate option is undefined';
            result.isError = true;
        } else if (!selection || (!selection.selected && !selection.excluded)) {
            result.message = 'MoveController: Selection type must be Controls/interface:ISelectionObject';
            result.isError = true;
        } else if (selection.selected && !selection.selected.length) {
            result.message = rk('Нет записей для обработки команды');
        }
        return result;
    }
}
