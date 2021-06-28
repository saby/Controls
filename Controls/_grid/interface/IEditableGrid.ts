import {IEditableList, IEditingConfig} from 'Controls/list';

/**
 * @typedef {Enum} TEditingMode
 * @description Допустимые значения для свойства {@link IGridEditingConfig mode}.
 * @variant row Редактирование всей строки.
 * @variant cell Редактирование отдельных ячеек.
 */
type TEditingMode = 'row' | 'cell';

/**
 * Интерфейс объекта-конфигурации {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирования/добавления по месту}.
 * @interface  Controls/_grid/interface/IEditableGrid#IGridEditingConfig
 * @extends Controls/_list/interface/IEditableList#IEditingConfig
 */
export interface IGridEditingConfig extends IEditingConfig {
    /**
     * @cfg {TEditingMode} Режим редактирования таблицы.
     * @default row
     */
    mode?: TEditingMode;
}

/**
 * Интерфейс для {@link /doc/platform/developmentapl/interface-development/controls/list/ таблиц} с возможностью {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирования/добавления по месту}.
 *
 * @public
 * @author Авраменко А.С.
 * @see Controls/editableArea:View
 * @remark
 * Разница между этим интерфейсом и {@link Controls/editableArea:View Controls/editableArea:View} заключается в том, что первый используется в списках, а второй - вне их (например, на вкладках).
 */
export interface IEditableGrid extends IEditableList {
    _options: {
        editingConfig: IGridEditingConfig;
    };
}
