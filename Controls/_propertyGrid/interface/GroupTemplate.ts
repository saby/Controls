/**
 * Шаблон, который по умолчанию используется для отображения группы в {@link Controls/propertyGrid:PropertyGrid редакторе свойств}.
 * 
 * @class Controls/propertyGrid:GroupTemplate
 * @author Герасимов А.М.
 * @public
 * @see Controls/propertyGrid
 * @see Controls/propertyGrid:PropertyGrid
 *
 *
 * @example
 * WML:
 * <pre class="brush: html">
 * <Controls.propertyGrid:PropertyGrid>
 *    <ws:groupTemplate>
 *       <ws:partial template="Controls/propertyGrid:GroupTemplate"
 *          expanderVisible="{{true}}"
 *          scope="{{groupTemplate}}">
 *          <ws:contentTemplate>
 *             <span class="myGroupTitle">ИНТЕРВАЛЫ И ОТСТУПЫ</span>
 *             <ws:if data="{{!contentTemplate.itemData.isGroupExpanded}}">
 *                 <div class="myGroupIndicator">Без отступов</div>
 *             </ws:if>
 *          </ws:contentTemplate>
 *       </ws:partial>
 *    </ws:groupTemplate>
 * </Controls.propertyGrid:PropertyGrid>
 * </pre>
 */

/**
 * @name Controls/propertyGrid:GroupTemplate#contentTemplate
 * @cfg {String|Function|undefined} Пользовательский шаблон, описывающий заголовок группы.
 * @example
 * <pre class="brush: html">
 * <Controls.propertyGrid:PropertyGrid>
 *    <ws:groupTemplate>
 *       <ws:partial template="Controls/propertyGrid:GroupTemplate"
 *          scope="{{groupTemplate}}">
 *          <ws:contentTemplate>
 *             <span class="myGroupTitle">{{contentTemplate.itemData.item.groupTitle}}</span>
 *             <ws:if data="{{!contentTemplate.itemData.isGroupExpanded}}">
 *                 <div class="myGroupIndicator">Без отступов</div>
 *             </ws:if>
 *          </ws:contentTemplate>
 *       </ws:partial>
 *    </ws:groupTemplate>
 * </Controls.propertyGrid:PropertyGrid>
 * </pre>
 * @demo Controls-demo/PropertyGridNew/Group/Template/Index
 */

/**
 * @name Controls/propertyGrid:GroupTemplate#expanderVisible
 * @cfg {Boolean} Когда опция установлена в значение true, кнопка-экспандер будет отображена.
 * @default false
 * @remark
 * Кнопка-экспандер позволяет сворачивать/разворачивать группу.
 * @example
 * <pre class="brush: html">
 * <Controls.propertyGrid:PropertyGrid>
 *    <ws:groupTemplate>
 *       <ws:partial template="Controls/propertyGrid:GroupTemplate"
 *          scope="{{groupTemplate}}">
 *          expanderVisible="{{true}}"
 *          <ws:contentTemplate>
 *             <span class="myGroupTitle">{{contentTemplate.itemData.item.groupTitle}}</span>
 *             <ws:if data="{{!contentTemplate.itemData.isGroupExpanded}}">
 *                 <div class="myGroupIndicator">Без отступов</div>
 *             </ws:if>
 *          </ws:contentTemplate>
 *       </ws:partial>
 *    </ws:groupTemplate>
 * </Controls.propertyGrid:PropertyGrid>
 * </pre>
 * @demo Controls-demo/PropertyGridNew/Group/Expander/Index
 */

export default interface IGroupTemplateOptions {
    contentTemplate?: string;
    expanderVisible?: boolean;
}

