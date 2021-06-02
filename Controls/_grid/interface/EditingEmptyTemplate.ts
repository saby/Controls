import {TemplateFunction} from 'UI/Base';

/**
 * @typedef {String} IEmptyColumnColumns
 * @description Объект конфигурации колонок (см. {@link columns}).
 * @property {TemplateFunction} template Шаблон колонки пустого представления.
 * @property {Number} startIndex Индекс начала колонки в таблице.
 * @property {Number} stopIndex Индекс конца колонки в таблице.
 */
interface IEmptyColumnColumns {
    template?: TemplateFunction;
    startIndex?: number;
    stopIndex?: number;
}

/**
 * Шаблон, который используется для отображения {@link Controls/grid:View таблицы} без элементов с возможностью добавления.
 *
 * @class Controls/_grid/interface/EditingEmptyTemplate
 * @author Авраменко А.С.
 * @public
 * 
 * @see Controls/list:EditingTemplate
 * @see Controls/list:BaseEditingTemplate
 * @see Controls/list:MoneyEditingTemplate
 * @see Controls/list:NumberEditingTemplate
 *
 * @example
 * В следующем примере показано, как изменить параметры шаблона.
 * В таблице 5 колонок. В пустом представлении поле ввода отображается во второй строке, а надпись растянута на следующие 2 колонки.
 * <pre class="brush: html; highlight: [12-33]">
 * <!-- WML -->
 * <Controls.grid:View source="{{_viewSource}}">
 *     <ws:columns>
 *         <ws:Array>
 *             <ws:Object ... />
 *             <ws:Object ... />
 *             <ws:Object ... />
 *             <ws:Object ... />
 *             <ws:Object ... />
 *         </ws:Array>
 *     </ws:columns>
 *     <ws:emptyTemplate>
 *       <ws:partial template="Controls/grid:EditingEmptyTemplate">
 *           <ws:columns>
 *               <ws:Array>
 *                   <ws:Object startIndex="{{ 2 }}">
 *                       <ws:template>
 *                           <ws:partial template="Controls/list:BaseEditingTemplate" enabled="{{ true }}">
 *                               <ws:viewTemplate>
 *                                   <div on:click="_beginAdd()">Введите наименование, штрих-код или артикул</div>
 *                               </ws:viewTemplate>
 *                           </ws:partial>
 *                       </ws:template>
 *                   </ws:Object>
 *                   <ws:Object endIndex="{{ 5 }}">
 *                       <ws:template>
 *                           <div>или выберите из каталога</div>
 *                       </ws:template>
 *                   </ws:Object>
 *               </ws:Array>
 *           </ws:columns>
 *       </ws:partial>
 *     </ws:emptyTemplate>
 * </Controls.list:View>
 * </pre>
 * 
 * @demo Controls-demo/grid/EmptyGrid/Editing/Index
 * 
 * @remark
 * Колонки могут быть растянуты и спозиционированы в таблице с помощью опций <b>startIndex</b> и <b>stopIndex</b>.
 * По-умолчанию колонки не растягиваются и идут по порядку, недостающее пространство будет автоматически дополнено.
 * Таким образом, не обязательно конфигурировать все колонки, ровно как и конфигурировать пустые колонки слева, если требуется
 * отображать колонки не с начала.
 * 
 */
export default interface IEditingEmptyTemplateOptions {
    /**
     * @typedef {String} Controls/_grid/interface/EditingEmptyTemplate/Spacing
     * @descrition Допустимые значения для опций {@link topSpacing} и {@link bottomSpacing}.
     * @variant xs Минимальный отступ.
     * @variant s Маленький отступ.
     * @variant m Средний отступ.
     * @variant l Большой отступ.
     * @variant xl Очень большой оступ.
     * @variant xxl Максимальный отступ.
     */

    /**
     * @cfg {Controls/_grid/interface/EditingEmptyTemplate/Spacing.typedef|null} Отступ между верхней границей и шаблоном contentTemplate.
     * @remark
     * В значении null отступ отсутствует.
     * Каждому значению опции соответствует размер в px. Он зависит от {@link /doc/platform/developmentapl/interface-development/themes/ темы оформления} приложения.
     * @default l
     */
    topSpacing?: string;
    /**
     * @cfg {Controls/_grid/interface/EditingEmptyTemplate/Spacing.typedef|null} Отступ между нижней границей и шаблоном contentTemplate.
     * @remark
     * В значении null отступ отсутствует.
     * Каждому значению опции соответствует размер в px. Он зависит от {@link /doc/platform/developmentapl/interface-development/themes/ темы оформления} приложения.
     * @default l
     */
    bottomSpacing?: string;
    /**
     * @cfg {Array.<Controls/_grid/interface/EditingEmptyTemplate/IEmptyColumnColumns.typedef>} Конфигурация колонок пустой таблицы.
     */
    columns?: IEmptyColumnColumns[];
}
