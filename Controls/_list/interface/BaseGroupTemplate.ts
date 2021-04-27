export default interface IBaseGroupTemplateOptions {
   expanderAlign?: string;
   separatorVisibility?: boolean;
   expanderVisible?: boolean;
   textAlign?: string;
   rightTemplate?: string;
   contentTemplate?: string;
   fontSize?: string;
   iconSize?: string;
   textVisible?: boolean;
}

/**
 * Интерфейс для шаблона отображения заголовка {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/ группы} в {@link /doc/platform/developmentapl/interface-development/controls/list/ списке}.
 * @interface Controls/_list/interface/IBaseGroupTemplate
 * @author Авраменко А.С.
 * @public
 */
/**
 * @typedef {String} Controls/_list/interface/IBaseGroupTemplate/ExpanderAlign
 * @description Допустимые значения для опции {@link expanderAlign}.
 * @variant left Слева от названия группы.
 * @variant right Справа от названия группы.
 */

/**
 * @name Controls/_list/interface/IBaseGroupTemplate#expanderAlign
 * @cfg {Controls/_list/interface/IBaseGroupTemplate/ExpanderAlign.typedef} Горизонтальное позиционирование {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/ кнопки-экспандера} относительно текста заголовка группы.
 * @default left
 * @demo Controls-demo/list_new/Grouped/CaptionAlign/Right/Index В следующем примере для кнопки-экспандера установлено позиционирование справа от текста залоговка группы.
 * @see expanderVisible
 * @see iconSize
 */
/**
 * @name Controls/_list/interface/IBaseGroupTemplate#expanderVisible
 * @cfg {Boolean} Видимость {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/ кнопки-экспандера}.
 * @default true
 * @demo Controls-demo/list_new/Grouped/WithoutExpander/Index В следующем примере кнопка-экспандр скрыта.
 * @remark
 * Когда опция установлена в значение false, кнопка-экспандер будет скрыта.
 * @see expanderAlign
 * @see iconSize
 */
/**
 * @name Controls/_list/interface/IBaseGroupTemplate#separatorVisibility
 * @cfg {Boolean} Видимость {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/ горизонтальной линии}.
 * @remark
 * Когда опция установлена в значение false, горизонтальная линия-разделитель будет скрыта.
 * @default true
 * @demo Controls-demo/list_new/Grouped/WithoutSeparator/Left/Index В следующем примере горизонтальная линия скрыта.
 */
/**
 * @typedef {String} Controls/_list/interface/IBaseGroupTemplate/TextAlign
 * @description Допустимые значения для опции {@link textAlign}.
 * @variant right По правому краю.
 * @variant left По левому краю.
 * @variant center По центру.
 */

/**
 * @name Controls/_list/interface/IBaseGroupTemplate#textAlign
 * @cfg {Controls/_list/interface/IBaseGroupTemplate/TextAlign.typedef} Выравнивание {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/visual/text/ текста заголовка группы}.
 * @default center
 * @demo Controls-demo/list_new/Grouped/CaptionAlign/Right/Index В следующем примере для текста заголовка группы задано выравнивание по правому краю.
 * @see contentTemplate
 * @see fontSize
 */

/**
 * @name Controls/_list/interface/IBaseGroupTemplate#textVisible
 * @cfg {Boolean} Видимость {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/visual/text/ текста заголовка группы}.
 * @default true
 * @demo Controls-demo/list_new/Grouped/TextVisible/Index В следующем примере текст заголовка группы скрыт.
 * @remark
 * Позволяет скрыть в заголовке группы текст вместе с кнопкой-экспандером. При использовании игнорируются {@link textAlign} и {@link expanderVisible}
 * @see textAlign
 * @see expanderVisible
 */

/**
 * @name Controls/_list/interface/IBaseGroupTemplate#rightTemplate
 * @cfg {String|Function|undefined} Пользовательский шаблон, отображаемый в правой части заголовка группы.
 * @default undefined
 * @demo Controls-demo/list_new/Grouped/RightTemplate/Index
 * @remark
 * В области видимости шаблона доступна переменная **itemData** со следующими свойствами:
 *
 * * item — идентификатор отрисовываемой группы, полученный из {@link Controls/interface/IGroupedGrid#groupProperty groupProperty}.
 * * {@link Types/collection:RecordSet#metaData metaData} — метаданные рекордсета, который загружен для таблицы.
 *
 * @example
 * В следующих примерах показано, как изменять опции шаблона для контрола {@link Controls/list:View}, однако то же самое справедливо и для других {@link /doc/platform/developmentapl/interface-development/controls/list/ списочных контролов}.
 *
 *
 * **Пример 1.** Контрол и шаблон groupTemplate настроены в одном WML-файле.
 * <pre class="brush: html">
 * <!-- file1.wml -->
 * <Controls.list:View>
 *    <ws:groupTemplate>
 *       <ws:partial template="Controls/list:GroupTemplate" scope="{{groupTemplate}}">
 *          <ws:rightTemplate>
 *             {{ rightTemplate.itemData.metaData.groupResults[rightTemplate.item.contents] }}
 *          </ws:rightTemplate>
 *       </ws:partial>
 *    </ws:groupTemplate>
 * </Controls.list:View>
 * </pre>
 *
 * **Пример 2.** Контрол и шаблон groupTemplate настроены в отдельных WML-файлах.
 * <pre class="brush: html">
 * <!-- file1.wml -->
 * <Controls.list:View>
 *    <ws:groupTemplate>
 *       <ws:partial template="wml!file2" scope="{{groupTemplate}}"/>
 *    </ws:groupTemplate>
 * </Controls.list:View>
 * </pre>
 *
 * <pre class="brush: html">
 * <!-- file2.wml -->
 * <ws:partial template="Controls/list:GroupTemplate">
 *    <ws:rightTemplate>
 *       {{ rightTemplate.itemData.metaData.groupResults[rightTemplate.item.contents] }}
 *    </ws:rightTemplate>
 * </ws:partial>
 * </pre>
 *
 * **Пример 3.** Контрол и шаблон rightTemplate настроены в отдельных WML-файлах.
 *
 * <pre class="brush: html">
 * <!-- file1.wml -->
 * <Controls.list:View>
 *    <ws:groupTemplate>
 *       <ws:partial template="Controls/list:GroupTemplate">
 *          <ws:rightTemplate>
 *             <ws:partial template="wml!file2" scope="{{rightTemplate}}"/>
 *          </ws:rightTemplate>
 *       </ws:partial>
 *    </ws:groupTemplate>
 * </Controls.list:View>
 * </pre>
 *
 * <pre class="brush: html">
 * <!-- file2.wml -->
 * {{ rightTemplate.itemData.metaData.groupResults[rightTemplate.item.contents] }}
 * </pre>
 */
/**
 * @name Controls/_list/interface/IBaseGroupTemplate#contentTemplate
 * @cfg {String|Function|undefined} Пользовательский шаблон вместо текста заголовка группы.
 * @default undefined
 * @demo Controls-demo/list_new/Grouped/ContentTemplate/Index
 * @remark
 * В области видимости шаблона доступна переменная **itemData** со следующими свойствами:
 *
 * * item — идентификатор отрисовываемой группы, полученный из {@link Controls/interface/IGroupedGrid#groupProperty groupProperty}.
 * * {@link Types/collection:RecordSet#metaData metaData} — метаданные рекордсета, который загружен для списка.
 *
 * @example
 * В следующих примерах показано, как изменять опции шаблона для контрола {@link Controls/list:View}, однако то же самое справедливо и для других списочных контролов.
 *
 * В примерах №№ 1, 2 и 3 показано, как получить доступ к переменной itemData из области видимости шаблона.
 *
 * **Пример 1.** Контрол и шаблон groupTemplate настроены в одном WML-файле.
 *
 * <pre class="brush: html">
 * <!-- file1.wml -->
 * <Controls.list:View>
 *    <ws:groupTemplate>
 *       <ws:partial template="Controls/list:GroupTemplate" scope="{{groupTemplate}}">
 *          <ws:contentTemplate>
 *             <ws:if data="{{contentTemplate.item.contents === 'nonexclusive'}}">Неисключительные права</ws:if>
 *             <ws:if data="{{contentTemplate.item.contents === 'works'}}">Работы</ws:if>
 *          </ws:contentTemplate>
 *       </ws:partial>
 *    </ws:groupTemplate>
 * </Controls.list:View>
 * </pre>
 *
 * **Пример 2.** Контрол и шаблон groupTemplate настроены в отдельных WML-файлах.
 * <pre class="brush: html">
 * <!-- file1.wml -->
 * <Controls.list:View>
 *    <ws:groupTemplate>
 *       <ws:partial template="wml!file2" scope="{{groupTemplate}}"/>
 *    </ws:groupTemplate>
 * </Controls.list:View>
 * </pre>
 *
 * <pre class="brush: html">
 * <!-- file2.wml -->
 * <ws:partial template="Controls/list:GroupTemplate">
 *    <ws:contentTemplate>
 *       <ws:if data="{{contentTemplate.item.contents === 'nonexclusive'}}">Неисключительные права</ws:if>
 *       <ws:if data="{{contentTemplate.item.contents === 'works'}}">Работы</ws:if>
 *    </ws:contentTemplate>
 * <ws:partial>
 * </pre>
 *
 * **Пример 3.** Контрол и шаблон contentTemplate настроены в отдельных WML-файлах.
 *
 * <pre class="brush: html">
 * <!-- file1.wml -->
 * <Controls.list:View>
 *    <ws:groupTemplate>
 *       <ws:partial template="Controls/list:GroupTemplate">
 *          <ws:contentTemplate>
 *             <ws:partial template="wml!file2" scope="{{contentTemplate}}"/>
 *          </ws:contentTemplate>
 *       </ws:partial>
 *    </ws:groupTemplate>
 * </Controls.list:View>
 * </pre>
 *
 * <pre class="brush: html">
 * <!-- file2.wml -->
 * <ws:if data="{{item.contents === 'nonexclusive'}}">Неисключительные права</ws:if>
 * <ws:if data="{{item.contents === 'works'}}">Работы</ws:if>
 * </pre>
 * @see textAlign
 * @see fontSize
 */
/**
 * @name Controls/_list/interface/IBaseGroupTemplate#fontSize
 * @cfg {String} Размер {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/visual/text/#font-size текста заголовка группы}.
 * @default xs
 * @see textAlign
 * @see contentTemplate
 */
/**
 * @name Controls/_list/interface/IBaseGroupTemplate#iconSize
 * @cfg {String} Размер иконки {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/ кнопки-экспандера}.
 * @default s
 * @see expanderAlign
 * @see expanderVisible
 */
