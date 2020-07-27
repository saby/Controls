/**
 * Шаблон, который по умолчанию используется для отображения строки итогов в контроле {@link Controls/grid:View Таблица}.
 *  
 * @class Controls/grid:ResultsTemplate
 * @author Авраменко А.С.
 * @see Controls/grid:View#resultsTemplate
 * @see Controls/grid:View#resultsPosition
 * @remark
 * Дополнительно о работе с шаблоном читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/grid/results/ здесь}.
 * @example
 * <pre class="brush: html; highlight: [3,4,5,6,7,8,9]">
 * <Controls.grid:View>
 *    <ws:resultsTemplate>
 *       <ws:partial template="Controls/grid:ResultsTemplate">
 *          <ws:contentTemplate>
 *             <div style="color: #313E78;">
 *                Итого: 2 страны с населением более миллиарда человек.
 *             </div>
 *          </ws:contentTemplate>
 *       </ws:partial>
 *    </ws:resultsTemplate>
 * </Controls.grid:View>
 * </pre>
 * @public
 */

export default interface IResultsTemplateOptions {
   /**
    * @name Controls/grid:ResultsTemplate#contentTemplate
    * @cfg {String|Function} Пользовательский шаблон, описывающий содержимое строки итогов. 
    * @default undefined
    */
   contentTemplate?: string;
}