import { ICrud } from 'Types/source';
import { IHashMap } from 'Types/declarations';
import { ISelectionObject } from 'Controls/interface';
import { Confirmation } from 'Controls/popup';
import { Logger } from 'UI/Utils';
import * as rk from 'i18n!*';
import { getItemsBySelection } from '../resources/utils/getItemsBySelection';

// @todo https://online.sbis.ru/opendoc.html?guid=2f35304f-4a67-45f4-a4f0-0c928890a6fc
type TFilterObject = IHashMap<any>;

/**
 * Интерфейс опций контроллера
 * @interface Controls/_list/interface/IRemoveController
 * @public
 * @author Аверкиев П.А.
 */
export interface IRemoveControllerOptions {
    /**
     * @name Controls/_list/interface/IRemoveController#source
     * @cfg {TSource} Источник данных, в котором производится удаление
     */
    source: ICrud;
}

/**
 * Контроллер для удаления элементов списка в dataSource.
 *
 * @public
 * @author Аверкиев П.А.
 */
export class RemoveController {
    private _source: ICrud;

    constructor(options: IRemoveControllerOptions) {
        this.updateOptions(options);
    }

    /**
     * Обновляет поля контроллера
     * @function Controls/_list/Controllers/RemoveController#updateOptions
     */
    updateOptions(options: IRemoveControllerOptions): void {
        this._source = options.source;
    }

    /**
     * Удаляет элементы из источника данных без подтверждения
     * @function Controls/_list/Controllers/RemoveController#remove
     * @param {Controls/interface:ISelectionObject} selection Массив элементов для удаления.
     * @param {TFilterObject} filter дополнительный фильтр записей при использовании Excluded.
     * @returns {Promise}
     */
    remove(selection: ISelectionObject, filter: TFilterObject = {}): Promise<void> {
        return this._removeFromSource(selection, filter);
    }

    /**
     * Удаляет элементы из источника данных c подтверждением удаления
     * @function Controls/_list/Controllers/RemoveController#removeWithConfirmation
     * @param {Controls/interface:ISelectionObject} selection Массив элементов для удаления.
     * @param {TFilterObject} filter дополнительный фильтр записей при использовании Excluded.
     * @returns {Promise}
     */
    removeWithConfirmation(selection: ISelectionObject, filter: TFilterObject = {}): Promise<void> {
        return Confirmation.openPopup({
            type: 'yesno',
            style: 'danger',
            message: rk('Удалить выбранные записи?')
        }).then((result) => result ? this._removeFromSource(selection, filter) : Promise.reject());
    }

    private _removeFromSource(selection: ISelectionObject, filter: TFilterObject = {}): Promise<void> {
        const error: string = RemoveController._validateBeforeRemove(this._source, selection);
        if (error) {
            Logger.error(error);
            return Promise.reject(new Error(error));
        }

        // TODO
        //  не можем избавиться от getItemsBySelection по крайней мере до тех пор, пока не будет везде внедрён
        //  DeleteSelected https://online.sbis.ru/opendoc.html?guid=9ddef508-29e2-4acf-ac76-7afe03509c4c
        return getItemsBySelection(selection, this._source, null, filter)
            .then((selection) => this._source.destroy(selection));
    }

    private static _validateBeforeRemove(source: ICrud, selection: ISelectionObject): string {
        let error;
        if (!source) {
            error = 'RemoveController: Source is not set';
        }
        if (!selection || (!selection.selected && !selection.excluded)) {
            error = 'RemoveController: Selection type must be Controls/interface:ISelectionObject';
        }
        return error;
    }
}
