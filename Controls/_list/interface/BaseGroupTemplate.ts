/**
 * Интерфейс для шаблона отображения разделителя {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/grouping/ группы} в {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/ списочном контроле}. 
 * @interface Controls/list:BaseGroupTemplate
 * @author Авраменко А.С.
 * @public
 */
export default interface IBaseGroupTemplateOptions {
   /**
    * @typedef {String} ExpanderAlign
    * @description Расположение кнопки-экспандера относительно заголовка группы.
    * @variant left Слева от заголовка группы.
    * @variant right Справа от заголовка группы.
    */

   /**
    * @name Controls/list:BaseGroupTemplate#expanderAlign
    * @cfg {ExpanderAlign} Устанавливает расположение кнопки-экспандера относительно заголовка группы.
    * @default left
    * @remark
    * Кнопка-экспандер позволяет сворачивать/разворачивать группу.
    * @see expanderVisible
    */
   expanderAlign?: string;
   /**
    * @name Controls/list:BaseGroupTemplate#separatorVisibility
    * @cfg {Boolean} Когда опция установлена в значение false, горизонтальная линия-разделитель будет скрыта.
    * @default true
    */
   separatorVisibility?: boolean;
   /**
    * @name Controls/list:BaseGroupTemplate#expanderVisible
    * @cfg {Boolean} Когда опция установлена в значение false, кнопка-экспандер группы будет скрыта.
    * @default true
    * @remark
    * Кнопка-экспандер позволяет сворачивать/разворачивать группу.
    * @see expanderAlign
    */
   expanderVisible?: boolean;
   /**
    * @typedef {String} TextAlign
    * @description Горизонтальное выравнивание заголовка группы.
    * @variant right По правому краю.
    * @variant left По левому краю.
    */

   /**
    * @name Controls/list:BaseGroupTemplate#textAlign
    * @cfg {TextAlign|undefined} Устанавливает горизонтальное выравнивание заголовка группы. 
    * @default undefined 
    * @remark
    * В значении undefined заголовок выравнивается по центру.
    */
   textAlign?: string;
   /**
    * @name Controls/list:BaseGroupTemplate#rightTemplate
    * @cfg {String|Function|undefined} Устанавливает пользовательский шаблон, отображаемый на горизонтальной линии-разделителе в правой части.
    * @default undefined
    * @remark
    * В области видимости шаблона доступна переменная **itemData** со следующими свойствами:
    * 
    * * {@link String|Number item} — идентификатор отрисовываемой группы, полученный из {@link Controls/interface/IGroupedGrid#groupProperty groupProperty}.
    * * {@link Types/collection:RecordSet#metaData metaData} — метаданные рекордсета, который загружен для таблицы.
    * 
    * @example
    * В следующих примерах показано, как изменять опции шаблона для контрола {@link Controls/list:View}, однако то же самое справедливо и для других {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/ списочных контролов}.
    * 
    * 
    * **Пример 1.** Контрол и шаблон groupTemplate настроены в одном WML-файле.
    * <pre class="brush: html">
    * <!-- file1.wml -->
    * <Controls.list:View>
    *    <ws:groupTemplate>
    *       <ws:partial template="Controls/list:GroupTemplate" scope="{{groupTemplate}}">
    *          <ws:rightTemplate>
    *             {{ rightTemplate.itemData.metaData.groupResults[rightTemplate.itemData.item] }}
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
    *       {{ rightTemplate.itemData.metaData.groupResults[rightTemplate.itemData.item] }}
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
    * {{ rightTemplate.itemData.metaData.groupResults[rightTemplate.itemData.item] }}
    * </pre>
    */
   rightTemplate?: string;
   /**
    * @name Controls/list:BaseGroupTemplate#contentTemplate
    * @cfg {String|Function|undefined} Устанавливает пользовательский шаблон, описывающий заголовок группы.
    * @remark
    * В области видимости шаблона доступна переменная **itemData** со следующими свойствами:
    *
    * * {@link String|Number item} — идентификатор отрисовываемой группы, полученный из {@link Controls/interface/IGroupedGrid#groupProperty groupProperty}.
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
    *             <ws:if data="{{contentTemplate.itemData.item === 'nonexclusive'}}">Неисключительные права</ws:if>
    *             <ws:if data="{{contentTemplate.itemData.item === 'works'}}">Работы</ws:if>
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
    *       <ws:if data="{{contentTemplate.itemData.item === 'nonexclusive'}}">Неисключительные права</ws:if>
    *       <ws:if data="{{contentTemplate.itemData.item === 'works'}}">Работы</ws:if>
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
    * <ws:if data="{{itemData.item === 'nonexclusive'}}">Неисключительные права</ws:if>
    * <ws:if data="{{itemData.item === 'works'}}">Работы</ws:if>
    * </pre>
    * 
    */
   contentTemplate?: string;
}
