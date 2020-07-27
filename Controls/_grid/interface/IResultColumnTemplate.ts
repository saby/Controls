import {TFontWeight} from 'Controls/_interface/IFontWeight';

/**
 * Шаблон, который по умолчанию используется для отображения ячеек итогов в контроле {@link Controls/grid:View Таблица}.
 * 
 * @class Controls/grid:ResultColumnTemplate
 * @author Авраменко А.С.
 * @example
 * В следующем примере показано, как изменить параметры шаблона.
 * <pre class="brush: html; highlight: [6,7,8,9,10,11]">
 * <Controls.grid:View>
 *    <ws:columns>
 *       <ws:Array>
 *          <ws:Object displayProperty="Name">
 *             <ws:resultsTemplate>
 *                <ws:partial template="Controls/grid:ResultColumnTemplate">
 *                    <div title="{{resultsTemplate.results.get('Name')}}">
 *                       {{resultsTemplate.results.get('Name')}}
 *                    </div>
 *                </ws:partial>
 *             </ws:resultsTemplate>
 *          </ws:Object>
 *       </ws:Array>
 *    </ws:columns>
 * </Controls.grid:View>
 * </pre>
 * @public
 */
export default interface IResultColumnTemplateOptions {

    /**
     * @name Controls/_grid/interface/IResultColumnTemplate#contentTemplate
     * @cfg {String|Function} Пользовательский шаблон для отображения содержимого ячейки итогов.
     * @remark
     * В области видимости шаблона доступен объект **results** - итогов, которые были переданы в метаданных RecordSet.
     * Результаты должны быть переданы в виде {@link Types/entity/Model}.
     * Если шаблон ячейки итогов или контентная опция не заданы, будут выведены итоги из метаданных по ключу, соответствующему displayProperty для данной колонки.
     * @example
     * **Пример 1.** Переопределение шаблона итогов и конфигурация контрола в одном WML-файле.
     * <pre class="brush: html; highlight: [6,7,8,9,10]">
     * <Controls.grid:View>
     *    <ws:columns>
     *       <ws:Array>
     *          <ws:Object displayProperty="Name">
     *             <ws:resultsTemplate>
     *                <ws:partial template="Controls/grid:ResultColumnTemplate">
     *                    <div title="{{resultsTemplate.results.get('Name')}}">
     *                       {{resultsTemplate.results.get('Name')}}
     *                    </div>
     *                </ws:partial>
     *             </ws:resultsTemplate>
     *          </ws:Object>
     *       </ws:Array>
     *    </ws:columns>
     * </Controls.grid:View>
     * </pre>
     *
     * **Пример 2.** Контрол и шаблоны сконфигурированы в отдельных WML-файлах.
     * <pre class="brush: html; highlight: [6,7,8]">
     * <!-- file1.wml -->
     * <Controls.grid:View>
     *    <ws:columns>
     *       <ws:Array>
     *          <ws:Object displayProperty="Name">
     *             <ws:resultsTemplate>
     *                <ws:partial template="wml!file2" scope="{{resultsTemplate}}"/>
     *             </ws:resultsTemplate>
     *          </ws:Object>
     *       </ws:Array>
     *    </ws:columns>
     * </Controls.grid:View>
     * </pre>
     *
     * <pre class="brush: html;">
     * <!-- file2.wml -->
     * <ws:partial template="Controls/grid:ResultColumnTemplate">
     *     <div title="{{resultsTemplate.results.get('Name')}}">
     *        {{results.get('Name')}}
     *     </div>
     * </ws:partial>
     * </pre>
     * 
     * **Пример 3.** Переопределение стандартных параметров отображения результатов.
     * <pre class="brush: html; highlight: [5,6,7]">
     * <Controls.grid:View>
     *    <ws:columns>
     *       <ws:Array>
     *          <ws:Object displayProperty="Name">
     *             <ws:resultsTemplate>
     *                <ws:partial template="Controls/grid:ResultColumnTemplate" fontWeight="default" fontColorStyle="unaccented"/>
     *             </ws:resultsTemplate>
     *          </ws:Object>
     *       </ws:Array>
     *    </ws:columns>
     * </Controls.grid:View>
     * </pre>
     * 
     * **Пример 4.** Конфигурация ячейки для выравнивания контента по копейкам. На шаблон добавлен CSS-класс "controls-Grid&#95;&#95;cell&#95;spacing&#95;money".
     * <pre class="brush: html; highlight: [5,6,7]">
     * <Controls.grid:View>
     *    <ws:columns>
     *       <ws:Array>
     *          <ws:Object displayProperty="Name">
     *             <ws:resultsTemplate>
     *                <ws:partial template="Controls/grid:ResultColumnTemplate" attr:class="controls-Grid__cell_spacing_money" />
     *             </ws:resultsTemplate>
     *          </ws:Object>
     *       </ws:Array>
     *    </ws:columns>
     * </Controls.grid:View>
     * </pre>
     */
    content?: string;

    /**
     * @typedef {String} TFontWeight
     * @variant bold
     * @variant default
     */

    /**
     * @name Controls/_grid/interface/IResultColumnTemplate#fontWeight
     * @cfg {TFontWeight} Начертание шрифта.
     * @default bold
     */
    fontWeight?: TFontWeight;


    /**
     * @typedef {String} FontColorStyle
     * @variant secondary
     * @variant success
     * @variant danger
     * @variant readonly
     * @variant unaccented
     */

    /**
     * @name Controls/_grid/interface/IResultColumnTemplate#fontColorStyle
     * @cfg {FontColorStyle} Стиль цвета текста результатов.
     * @default secondary
     * @remark
     * Стиль цвета текста задается константой из стандартного набора цветов, который определен для текущей темы оформления.
     * @example
     * Шаблон ячейки результатов со стилем шрифта "success".
     * <pre class="brush: html">
     * <ws:partial template="Controls/grid:ResultColumnTemplate" scope="{{_options}}" fontColorStyle="success" />
     * </pre>
     */
    fontColorStyle?: string;
}
