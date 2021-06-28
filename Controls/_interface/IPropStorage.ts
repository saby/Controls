export interface IPropStorageOptions {
    propStorageId?: string;
}

/**
 * Интерфейс для контролов, сохраняющих пользовательскую конфигурацию.
 * @public
 * @author Красильников А.С.
 */

export default interface IPropStorage {
    readonly '[Controls/_interface/IPropStorage]': boolean;
}

/**
 * @name Controls/_interface/IPropStorage#propStorageId
 * @cfg {String} Уникальный идентификатор, по которому будут сохраняться параметры контрола в хранилище данных.
 * @remark
 * Какой параметр будет сохраняться в хранилище данных — зависит от конкретного контрола.
 * Например, для {@link Controls/masterDetail:Base} в сохраняется ширина контрола, чтобы после перезагрузки веб-страницы её можно было восстановить.
 */
