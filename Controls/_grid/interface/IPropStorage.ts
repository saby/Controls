/**
 * Интерфейс для списочных контролов, сохраняющих пользовательскую конфигурацию.
 * @interface Controls/_grid/interface/IPropStorage
 * @public
 * @author Авраменко А.С.
 */

export interface IPropStorage {
   /**
    * @name Controls/_grid/interface/IPropStorage#propStorageId 
    * @cfg {String} Уникальный идентификатор, по которому в хранилище данных будет сохранена конфигурация контрола.
    * @remark В списочных контролах такое хранилище используется для сохранения выбранной сортировки.
    * Подробнее о настройке сортировки читайте {@link Controls/list:ISorting#sorting здесь}.
    */
   propStorageId?: string;
}