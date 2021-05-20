/**
 * Шаблон, который по умолчанию используется для построения {@link /doc/platform/developmentapl/interface-development/controls/list/grid/ladder/ лесенки} в {@link Controls/grid:View таблице}.
 *  
 * @class Controls/_gridOld/interface/LadderWrapper
 * @author Авраменко А.С.
 * @see Controls/grid:View#ladderProperties
 * @see Controls/grid:IGridControl#columns
 * @remark
 * Дополнительно о работе с шаблоном читайте {@link /doc/platform/developmentapl/interface-development/controls/list/grid/ladder/ здесь}.
 * @example
 * <pre class="brush: html; highlight: [7-13]">
 * <!-- WML -->
 * <Controls.grid:View source="{{_viewSource}}" ladderProperties="{{ ['date'] }}">
 *    <ws:columns>
 *       <ws:Array>
 *          <ws:Object width="1fr">
 *             <ws:template>
 *                <ws:partial template="Controls/grid:ColumnTemplate">
 *                   <ws:contentTemplate>
 *                      <ws:partial template="Controls/grid:LadderWrapper" ladderProperty="date">
 *                         {{contentTemplate.item.contents['date']}}
 *                      </ws:partial>
 *                   </ws:contentTemplate>
 *                </ws:partial>
 *             </ws:template>
 *          </ws:Object>
 *       </ws:Array>
 *    </ws:columns>
 * </Controls.grid:View>
 * </pre>
 * @public
 */

export default interface ILadderWrapperOptions {
   /**
    * @name Controls/_gridOld/interface/LadderWrapper#ladderProperty
    * @cfg {Array.<String>|String} Имена полей, для которых будет работать {@link /doc/platform/developmentapl/interface-development/controls/list/grid/ladder/ лесенка}.
    * @default undefined
    */
   [index: number]: string;
}