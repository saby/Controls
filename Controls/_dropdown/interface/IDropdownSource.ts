import {ICrudPlus} from 'Types/source';

export interface IDropdownSourceOptions {
    source?: ICrudPlus;
}

/**
 * Интерфейс для источника данных, который возвращает данные в формате, необходимом для контролов {@link Controls/dropdown:Input} и {@link Controls/dropdown:Button}.
 *
 * @interface Controls/_dropdown/interface/IDropdownSource
 * @public
 * @author Золотова Э.Е.
 */
export default interface IDropdownSource {
    readonly '[Controls/_dropdown/interface/IDropdownSource]': boolean;
}

/**
 * @typedef {Object} Item
 * @property {Boolean} [item.readOnly] Определяет, может ли пользователь изменить значение контрола. {@link UI/_base/Control#readOnly Подробнее}
 * @property {String} [item.iconStyle] Определяет цвет иконки элемента.{@link Controls/_interface/IIconStyle#iconStyle Подробнее}
 * @property {String} [item.icon] Определяет иконку элемента. {@link Controls/_interface/IIcon#icon Подробнее}
 * @property {String} [item.title] Определеяет текст элемента.
 * @property {String} [item.tooltip] Определеяет текст всплывающей подсказки, появляющейся при наведении на элемент, если он отличается от title.
 * @property {String} [item.pinned] Определеяет является ли пункт закрепленным.
 * Пункт будет отображен на той же позиции, на которой он находится в загруженном рекордсете. В меню с множественным выбором клик по такому пункту сбрасывает выделение.
 *
 */

/**
 * @typedef {Object} SourceCfg
 * @property {Item} [SourceCfg.item] Формат исходной записи.
 */

/*
 * @typedef {Object} SourceCfg
 * @property {Item} [SourceCfg.item] Format of source record.
 */

/**
 * @name Controls/_dropdown/interface/IDropdownSource#source
 * @cfg {SourceCfg} Объект, который реализует интерфейс {@link Types/source:ICrud ICrud}, необходимый для работы с источником данных.
 * @default undefined
 * @remark
 * Запись может иметь следующие {@link Controls/_dropdown/interface/IDropdownSource#Item свойства}.
 * @demo Controls-demo/dropdown_new/Button/Source/Index
 * @example
 * Записи будут отображены из источника _source.
 * <pre>
 *    <Controls.dropdown:Button
 *              keyProperty="key"
 *              source="{{_source}}"
 *              caption="Create"
 *              viewMode="link"
 *              iconSize="m" />
 * </pre>
 * <pre>
 *    _source: new source.Memory({
 *        keyProperty: 'key',
 *        data: [
 *          {
 *             key: '1',
 *             icon: 'icon-EmptyMessage',
 *             iconStyle: 'info',
 *             title: 'Message'
 *          },
 *          {
 *             key: '2',
 *             icon: 'icon-TFTask',
 *             title: 'Task'
 *          },
 *          {
 *             key: '3',
 *             title: 'Report',
 *          },
 *          {
 *              key: '4',
 *              title: 'News',
 *              readOnly: true
 *          }
 *        ]
 *    })
 * </pre>
 */
