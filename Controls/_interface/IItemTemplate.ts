import {TemplateFunction} from 'UI/Base';

export interface IItemTemplateOptions {
    /**
     * @name Controls/_interface/IItemTemplate#itemTemplateProperty
     * @cfg {String} Имя свойства, содержащего ссылку на шаблон элемента. Если значение свойства не передано, то для отрисовки используется itemTemplate.
     */
    itemTemplateProperty?: string;
    /**
     * @name Controls/_interface/IItemTemplate#itemTemplate
     * @cfg {TemplateFunction} Шаблон элемента списка.
     * @remark
     * По умолчанию используется шаблон "Controls/list:ItemTemplate".
     *
     * Базовый шаблон itemTemplate поддерживает следующие параметры:
     * - contentTemplate {Function} — Шаблон содержимого элемента;
     * - highlightOnHover {Boolean} — Выделять элемент при наведении на него курсора мыши.
     * - checkboxReadOnly {Boolean} — Флаг, позволяющий установить у checkbox в multiSelect режим "только для чтения".
     * - cursor {TCursor} — Устанавливает вид {@link https://developer.mozilla.org/ru/docs/Web/CSS/cursor курсора мыши} при наведении на строку.
     *
     * В области видимости шаблона доступен объект itemData, позволяющий получить доступ к данным рендеринга (например, элемент, ключ и т.д.).
     *
     * Подробнее о работе с шаблоном читайте в <a href="/doc/platform/developmentapl/interface-development/controls/list/list/item/">руководстве разработчика</a>.
     * @example
     * <pre class="brush: html">
     * <!-- WML -->
     * <Controls.list:View>
     *    <ws:itemTemplate>
     *       <ws:partial template="Controls/list:ItemTemplate" scope="{{itemTemplate}}">
     *          <ws:contentTemplate>
     *             <span>{{contentTemplate.itemData.item.description}}</span>
     *          </ws:contentTemplate>
     *       </ws:partial>
     *    </ws:itemTemplate>
     * </Controls.list:View>
     * </pre>
     */
    itemTemplate?: TemplateFunction;
}

/**
 * Интерфейс для контролов с возможностью настройки отображения элементов.
 * @private
 * @author Герасимов А.М.
 */
interface IItemTemplate {
    readonly '[Controls/_interface/IItemTemplate]': boolean;
}

export default IItemTemplate;
