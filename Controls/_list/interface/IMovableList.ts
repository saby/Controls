import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {CrudEntityKey, LOCAL_MOVE_POSITION} from 'Types/source';
import {ISelectionObject} from 'Controls/interface';
import {IMoverDialogTemplateOptions} from 'Controls/moverDialog';

/**
 * Интерфейс настройки диалогового окна выбора целевой записи для перемещения.
 * @public
 * @author Аверкиев П.А.
 */
export interface IMoveDialogTemplate {
    /**
     * @cfg {UI/Base:Control<IControlOptions, unknown> | UI/Base:TemplateFunction | String} templateName
     * Имя контрола, который будет отображаться в диалоговом окне выбора целевой записи для перемещения.
     */
    templateName: Control<IControlOptions, unknown> | TemplateFunction | string,
    /**
     * @cfg {Controls/moverDialog:IMoverDialogTemplateOptions} templateOptions
     * Опции для контрола, который будет отображаться в диалоговом окне.
     */
    templateOptions: IMoverDialogTemplateOptions,
}

/**
 * Интерфейс опций контрола View, который обладает возможностью перемещения записей
 * @public
 * @author Аверкиев П.А.
 */
export interface IMovableOptions {
    /**
     * @cfg {IMoveDialogTemplate} moveDialogTemplate Шаблон диалогового окна выбора целевой записи для перемещения.
     * Рекомендуется использовать стандартный шаблон {@link Controls/moverDialog:Template}.
     * @see Controls/moverDialog:Template
     */
    moveDialogTemplate?: IMoveDialogTemplate
}

/**
 * Интерфейс контрола View, который обладает возможностью перемещения записей
 * @public
 * @author Аверкиев П.А.
 */
export interface IMovableList {
    /**
     * Перемещает указанные записи в source относительно target в указанную позицию (after/before/on)
     * и возвращает результат перемещения
     * @method
     * @public
     * @param selection
     * @param targetKey
     * @param position
     */
    moveItems(selection: ISelectionObject, targetKey: CrudEntityKey, position: LOCAL_MOVE_POSITION): Promise<void>;

    /**
     * Перемещаетодин элемент вверх и возвращает результат перемещения
     * @method
     * @public
     * @param selectedKey
     */
    moveItemUp(selectedKey: CrudEntityKey): Promise<void>;

    /**
     * Перемещает один элемент вниз и возвращает результат перемещения
     * @method
     * @public
     * @param selectedKey
     */
    moveItemDown(selectedKey: CrudEntityKey): Promise<void>;

    /**
     * Перемещает указанные элементы при помощи диалога MoveDialog, и возвращает результат moveItems().
     * @method
     * @public
     * @param selection
     */
    moveItemsWithDialog(selection: ISelectionObject): Promise<void>;
}
