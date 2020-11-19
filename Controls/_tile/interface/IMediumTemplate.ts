/**
 * Упрощенный шаблон отображения элементов в  {@link Controls/tile:View плитке}.
 * @class Controls/_tile/interface/MediumTemplate
 * @mixes Controls/_tile/interface/ItemTemplate
 * @author Михайлов С.Е
 * @see Controls/tile:View
 * @example
 * <pre class="brush: html">
 * <Controls.tile:View>
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/tile:MediumTemplate"
 *                   titleLines="2">
 *       </ws:partial>
 *    </ws:itemTemplate>
 * </Controls.tile:View>
 * </pre>
 * @public
 * @demo Controls-demo/Tile/DifferentItemTemplates/MediumTemplate/Index
 * @remark
 * Шаблон имеет фиксированную высоту. Опция tileHeight не учитывается.
 */

export default interface IMediumTemplate {
    /**
     * @name Controls/_tile/interface/MediumTemplate#imageSize
     * @cfg {Number} Количество строк в описании.
     * @default 1
     */
    titleLines?: number;
}
