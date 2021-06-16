/**
 * Интерфейс для списочных контролов, сохраняющих пользовательскую конфигурацию.
 * @public
 * @author Авраменко А.С.
 */

export interface IPropStorage {
   /**
    * @cfg {String} Уникальный идентификатор, по которому в хранилище данных будет сохранена конфигурация контрола.
    * @remark В {@link /doc/platform/developmentapl/interface-development/controls/list/ списочных контролах}, в том числе {@link Controls/grid:SortingSelector}, такое хранилище используется для сохранения выбранной {@link /doc/platform/developmentapl/interface-development/controls/list/sorting/ сортировки}.
    */
   propStorageId?: string;
}