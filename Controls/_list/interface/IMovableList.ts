import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {DataSet, CrudEntityKey, LOCAL_MOVE_POSITION} from 'Types/source';
import {ISelectionObject} from 'Controls/interface';
import {IMoverDialogTemplateOptions} from 'Controls/moverDialog';

/**
 * Интерфейс настройки {@link /doc/platform/developmentapl/interface-development/controls/list/actions/mover/#move-items-with-dialog диалогового окна} выбора целевой записи для перемещения.
 * @public
 * @author Аверкиев П.А.
 */
export interface IMoveDialogTemplate {
    /**
     * @cfg {UI/Base:Control<IControlOptions, unknown> | UI/Base:TemplateFunction | String} templateName
     * Имя контрола, который будет отображаться в диалоговом окне выбора целевой записи, для перемещения.
     */
    templateName: Control<IControlOptions, unknown> | TemplateFunction | string,
    /**
     * @cfg {Controls/moverDialog:IMoverDialogTemplateOptions} templateOptions
     * Опции для контрола, который будет отображаться в диалоговом окне.
     */
    templateOptions: IMoverDialogTemplateOptions,
}

/**
 * Интерфейс опций контрола View, который обладает возможностью перемещения записей.
 * @public
 * @author Аверкиев П.А.
 */
export interface IMovableOptions {
    moveDialogTemplate?: IMoveDialogTemplate
}

/**
 * Интерфейс контрола View, который обладает возможностью перемещения записей.
 * @public
 * @author Аверкиев П.А.
 */
export interface IMovableList {
    /**
     * Перемещает указанные записи в указанную позицию position, которая может принимать значения after/before/on. Перемещение происходит только в источнике.
     * @method
     * @public
     * @param selection
     * @param targetKey
     * @param position
     */
    moveItems(selection: ISelectionObject, targetKey: CrudEntityKey, position: LOCAL_MOVE_POSITION): Promise<DataSet>;

    /**
     * Перемещает выбранную запись на одну позицию вверх. Перемещение происходит только в источнике.
     * @method
     * @public
     * @param selectedKey Ключ записи для перемещения
     * @param reverse Если true, то перемещает в обратном направлении
     */
    moveItemUp(selectedKey: CrudEntityKey, reverse?: boolean): Promise<void>;

    /**
     * Перемещает выбранную запись на одну позицию вниз. Перемещение происходит только в источнике.
     * @method
     * @public
     * @param selectedKey Ключ записи для перемещения
     * @param reverse Если true, то перемещает в обратном направлении
     */
    moveItemDown(selectedKey: CrudEntityKey, reverse?: boolean): Promise<void>;

    /**
     * Перемещает указанные элементы при помощи диалога MoveDialog, и возвращает результат moveItems().
     * @method
     * @public
     * @param selection
     */
    moveItemsWithDialog(selection: ISelectionObject): Promise<DataSet>;
}
