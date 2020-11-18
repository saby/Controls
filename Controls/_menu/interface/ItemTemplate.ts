/**
 * Шаблон, который по умолчанию используется для отображения элементов в {@link Controls/menu:Control}.
 *
 * @class Controls/_menu/interface/ItemTemplate
 * @author Герасимов А.М.
 * @public
 * @see Controls/menu
 * @see Controls/menu:Control
 * @example
 * WML:
 * <pre>
 *    <Controls.menu:Control
 *          source="{{_source}}"
 *          keyProperty="id"
 *          displayProperty="title">
 *       <ws:itemTemplate>
 *          <ws:partial template="Controls/menu:ItemTemplate">
 *              <ws:additionalTextTemplate>
 *                  <div>{{itemTemplate.itemData.item.get('comment')}}</div>
 *              </ws:additionalTextTemplate>
 *          </ws:partial>
 *       </ws:itemTemplate>
 *    </Controls.menu:Control>
 * </pre>
 */

export default interface IItemTemplateOptions {
    /**
     * @name Controls/_menu/interface/ItemTemplate#contentTemplate
     * @cfg {String|Function|undefined} Устанавливает пользовательский шаблон, описывающий содержимое элемента.
     * @default undefined
     * @demo Controls-demo/Menu/Control/ItemTemplate/ContentTemplate/Index
     * @example
     *
     * В следующих примерах показано, как изменять опции шаблона для контрола {@link Controls/dropdown:Control}.
     *
     * **Пример 1.** Контрол и шаблон настроены в одном WML-файле.
     * <pre class="brush: html">
     * <!-- file1.wml -->
     * <Controls.menu:Control>
     *    <ws:itemTemplate>
     *       <ws:partial template="Controls/menu:ItemTemplate">
     *          <ws:contentTemplate>
     *             {{contentTemplate.item.title}}
     *          </ws:contentTemplate>
     *       </ws:partial>
     *    </ws:itemTemplate>
     * </Controls.menu:Control>
     * </pre>
     *
     * **Пример 2.** Контрол и шаблон itemTemplate настроены в отдельных WML-файлах.
     * <pre class="brush: html">
     * <!-- file1.wml -->
     * <Controls.menu:Control>
     *    <ws:itemTemplate>
     *       <ws:partial template="wml!file2" scope="{{itemTemplate}}"/>
     *    </ws:itemTemplate>
     * </Controls.menu:Control>
     * </pre>
     *
     * <pre class="brush: html">
     * <!-- file2.wml -->
     * <ws:partial template="Controls/menu:ItemTemplate">
     *    <ws:contentTemplate>
     *       {{contentTemplate.item.title}}
     *    </ws:contentTemplate>
     * </ws:partial>
     * </pre>
     *
     * **Пример 3.** Контрол и шаблон contentTemplate настроены в отдельных WML-файлах.
     *
     * <pre class="brush: html">
     * <!-- file1.wml -->
     * <Controls.menu:Control>
     *    <ws:itemTemplate>
     *       <ws:partial template="Controls/menu:ItemTemplate">
     *          <ws:contentTemplate>
     *             <ws:partial template="wml!file2" scope="{{contentTemplate}}"/>
     *          </ws:contentTemplate>
     *       </ws:partial>
     *    </ws:itemTemplate>
     * </Controls.menu:Control>
     * </pre>
     *
     * <pre class="brush: html">
     * <!-- file2.wml -->
     * {{contentTemplate.item.title}}
     * </pre>
     */
    contentTemplate?: string;
    /**
     * @name Controls/_menu/interface/ItemTemplate#additionalTextTemplate
     * @cfg {String|Function|undefined} Устанавливает пользовательский шаблон, который отображается под основным контентом элемента и используется для вывода дополнительного текста (комментария).
     * @default undefined
     * @demo Controls-demo/Menu/Control/ItemTemplate/AdditionalTextTemplate/Index
     * @example
     * <pre class="brush: html; highlight: [9,10,11]">
     * <Controls.menu:Control source="{{_source)}}" keyProperty="id">
     *    <ws:itemTemplate>
     *       <ws:partial template="Controls/menu:ItemTemplate">
     *          <ws:additionalTextTemplate>
     *             <div>{{item.get('comment')}}</div>
     *          </ws:additionalTextTemplate>
     *       </ws:partial>
     *    </ws:itemTemplate>
     * </Controls.menu:Control>
     * </pre>
     * <pre class="brush: js">
     *    this._source = new Memory ({
     *       data: [
     *           { id: 1,
     *             title: 'Discussion',
     *             comment: 'Create a discussion to find out the views of other group members on this issue' },
     *           { id: 2,
     *             title: 'Idea/suggestion',
     *             comment: 'Offer your idea, which others can not only discuss, but also evaluate.
     *             The best ideas will not go unnoticed and will be realized' },
     *           { id: 3,
     *             title: 'Problem',
     *             comment: 'Do you have a problem? Tell about it and experts will help to find its solution' }
     *       ],
     *       keyProperty: 'id'
     *    });
     * </pre>
     */
    additionalTextTemplate?: string;
    multiLine?: boolean;
    /**
     * @name Controls/_menu/interface/ItemTemplate#rightTemplate
     * @cfg {String|Function|undefined} Устанавливает пользовательский шаблон, который отображается справа от основного контента элемента и используется для вывода дополнительного действия (комманды).
     * @default undefined
     * @demo Controls-demo/Menu/Control/ItemTemplate/ItemTemplateProperty/RightTemplate/Index
     * @example
     * <pre class="brush: html; highlight: [9,10,11]">
     * <Controls.menu:Control source="{{_source)}}" keyProperty="id">
     *    <ws:itemTemplate>
     *       <ws:partial template="Controls/menu:ItemTemplate" attr:class="Controls-demo-Menu-Control__itemTemplate">
     *          <ws:rightTemplate>
     *              <ws:if data="{{rightTemplate.item.get('additionalIcon')}}">
     *                  <span class="ControlsDemo-Menu-Control__rightTemplate
     *                               {{rightTemplate.item.get('additionalIcon')}}" ></span>
     *              </ws:if>
     *          </ws:rightTemplate>
     *       </ws:partial>
     *    </ws:itemTemplate>
     * </Controls.menu:Control>
     * </pre>
     * <pre class="brush: js">
     *    this._source = new Memory ({
     *       data: [
     *              {key: '1', title: 'Save', icon: 'icon-Save'},
     *              {key: '2', title: 'Execute', icon: 'icon-Show'},
     *              {key: '3', title: 'Discuss', icon: 'icon-EmptyMessage', additionalIcon: 'icon-VideoCallNull'},
     *              {key: '4', title: 'For control', icon: 'icon-Sent2'}
     *       ],
     *       keyProperty: 'id'
     *    });
     * </pre>
     */
    rightTemplate?: string;
}
