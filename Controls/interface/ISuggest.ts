/**
 * @typedef {Object} ISuggestTemplateProp
 * @property {String} templateName Имя контрола, который будет отображаться в выпадающем блоке.
 * @property {Object} templateOptions Опции для контрола, который будет отображаться в выпадающем блоке.
 */

/*
 * @typedef {Object} ISuggestTemplateProp
 * @property {String} templateName Control name, that will be displayed list of items in suggest.
 * @property {Object} templateOptions Options for control , which is specified in the templateName field.
 */
export interface ISuggestTemplateProp {
   templateName: string;
   templateOptions: object;
}

/**
 * @typedef {Object} IEmptyTemplateProp
 * @property {String} templateName Имя шаблона пустого автодополнения, которое будет отображаться, когда результат не найден.
 * @property {Object} templateOptions Параметры шаблона, которые указаны в поле templateName.
 */

/*
 * @typedef {Object} IEmptyTemplateProp
 * @property {String} templateName Template name for suggest, which will showing when no result were found.
 * @property {Object} templateOptions Options for template, which is specified in the templateName field.
 */
export interface IEmptyTemplateProp {
   templateName: string;
   templateOptions: object;
}

/**
 * @typedef {Object} ISuggestFooterTemplate
 * @property {String} templateName Имя шаблона, которое будет отображаться в нижней части автодополнения.
 * @property {Object} templateOptions Параметры шаблона, которые указаны в поле templateName.
 */

/*
 * @typedef {Object} ISuggestFooterTemplate
 * @property {String} templateName Name of template, which will showing in bottom of suggest.
 * @property {Object} templateOptions Options for template, which is specified in the templateName field.
 */
export interface ISuggestFooterTemplate {
   templateName: string;
   templateOptions: object;
}

/**
 * Интерфейс для автодополнения.
 * @public
 * @author Герасимов А.М.
 */

/*
 * Interface for auto-completion.
 *
 * @public
 * @author Gerasimov A.M.
 */
interface ISuggest {
   readonly _options: {
      /**
       * @cfg {ISuggestTemplateProp|null} Шаблон автодополнения, который отображает результаты поиска.
       * @remark Корневым контролом автодополнения должен быть Controls/Container/Suggest/List, этому контролу можно передать в контентной опции контрол ({@link Controls/list:View} или {@link Controls/grid:View}), который отобразит список.
       * @remark Вы можете установить ширину окна с автодополнением, добавив собственный класс в suggestTemplate и установив минимальную ширину. По умолчанию ширина автодополнения равна ширине поля ввода.
       * @demo Controls-demo/Suggest_new/SearchInput/SuggestTemplate/SuggestTemplate
       * @editor function
       * @example
       * <pre class="bruhs: html">
       * <!-- suggestTemplate.wml -->
       * <Controls.suggestPopup:ListContainer attr:class="myClass">
       *    <Controls.list:View keyProperty="id">
       *       <ws:itemTemplate>
       *          <ws:partial template="Controls/list:ItemTemplate" displayProperty="city"/>
       *       </ws:itemTemplate>
       *    </Controls.list:View>
       * </Controls.suggestPopup:ListContainer>
       * </pre>
       * 
       * <pre class="bruhs: css">
       * .myClass {
       *    min-width: 300px;
       * }
       * </pre>
       * <pre class="bruhs: css">
       * <!-- WML -->
       * <Controls.suggest:Input>
       *    <ws:suggestTemplate templateName="wml!SuggestTemplate">
       *       <ws:templateOptions />
       *    </ws:suggestTemplate>
       * </Controls.suggest:Input>
       * </pre>
       */

      /*
       * @cfg {ISuggestTemplateProp|null} Template for suggest, that showing search results.
       * @remark Root control of suggest must be {@link Controls/suggestPopup:ListContainer}, for this control you can pass in content option a control (such {@link Controls/list:View} or {@link Controls/grid:View}), that will displaying a list.
       * @remark You can set width of suggestions popup by adding own class on suggestTemplate and set min-width by this class. By default width of the suggest is equal input field width.
       * @demo Controls-demo/Suggest_new/SearchInput/SuggestTemplate/SuggestTemplate
       * @editor function
       * @example
       * <pre class="bruhs: html">
       * <!-- suggestTemplate.wml -->
       * <Controls.suggestPopup:ListContainer attr:class="myClass">
       *    <Controls.list:View keyProperty="id">
       *       <ws:itemTemplate>
       *          <ws:partial template="Controls/list:ItemTemplate" displayProperty="city"/>
       *       </ws:itemTemplate>
       *    </Controls.list:View>
       * </Controls.suggestPopup:ListContainer>
       * </pre>
       * 
       * <pre class="bruhs: css">
       * .myClass {
       *    min-width: 300px;
       * }
       * </pre>
       * <pre class="bruhs: css">
       * <!-- WML -->
       * <Controls.suggest:Input>
       *    <ws:suggestTemplate templateName="wml!SuggestTemplate">
       *       <ws:templateOptions />
       *    </ws:suggestTemplate>
       * </Controls.suggest:Input>
       * </pre>
       */
      suggestTemplate: ISuggestTemplateProp | null;

      /**
       * @cfg {IEmptyTemplateProp|null} Шаблон, который будет отображаться в автодополнении, если поисковой запрос не вернул результатов.
       * @remark Если опция имеет значение null, то автодополнение не отобразится, если поисковой запрос не вернул результатов.
       * @demo Controls-demo/Suggest_new/SearchInput/EmptyTemplate/EmptyTemplate
       * @example
       * <pre class="brush: html">
       * <!-- emptyTemplate.wml -->
       *    <div class="emptyTemplate-class">Sorry, no data today</div>
       * </pre>
       *
       * <pre class="brush: html">
       * <!-- MySuggest.wml -->
       * <Controls.suggest:Input>
       *    <ws:emptyTemplate templateName="wml!emptyTemplate">
       *       <ws:templateOptions showImage={{_showImage}}/>
       *    </ws:emptyTemplate>
       * </Controls.suggest:Input>
       * </pre>
       */

      /*
       * @cfg {IEmptyTemplateProp|null} Template for suggest when no results were found.
       * @remark If option set to null, empty suggest won't appear.
       * @demo Controls-demo/Suggest_new/SearchInput/EmptyTemplate/EmptyTemplate
       * @example
       * <pre class="brush: html">
       * <!-- emptyTemplate.wml -->
       *    <div class="emptyTemplate-class">Sorry, no data today</div>
       * </pre>
       *
       * <pre class="brush: html">
       * <!-- MySuggest.wml -->
       * <Controls.suggest:Input>
       *    <ws:emptyTemplate templateName="wml!emptyTemplate">
       *       <ws:templateOptions showImage={{_showImage}}/>
       *    </ws:emptyTemplate>
       * </Controls.suggest:Input>
       * </pre>
       */
      emptyTemplate: IEmptyTemplateProp | null;

      /**
       * @cfg {ISuggestFooterTemplate} Шаблон подвала автодополнения.
       * @demo Controls-demo/Suggest_new/SearchInput/FooterTemplate/FooterTemplate
       * @example
       * <pre class="brush: html">
       * <!-- myFooter.wml -->
       * <span on:click="_showTasksClick()">show tasks</span>
       * </pre>
       *
       * <pre class="brush: js">
       * // myFooter.js
       * define('myFooter', ['Core/Control'], function(Control) {
       *    return Control.extend({
       *       _showTasksClick: function() {
       *          stackOpener.open();
       *       }
       *    });
       * });
       * </pre>
       *
       * <pre class="brush: html">
       * <!-- mySuggest.wml -->
       * <Controls.suggest:Input>
       *    <ws:footerTemplate templateName="myFooter">
       * </Controls.suggest:Input>
       * </pre>
       * @remark
       * Если вам требуется просто поменять текст для кнопки "Показать всё", которая отображается в подвале автодополнения,
       * необходимо использова стандартный шаблон подвала {@link Controls/suggestPopup:FooterTemplate}
       */

      /*
       * @cfg {ISuggestFooterTemplate} Footer template of suggest.
       * @demo Controls-demo/Suggest_new/SearchInput/FooterTemplate/FooterTemplate
       * @example
       * <pre class="brush: html">
       * <!-- myFooter.wml -->
       * <span on:click="_showTasksClick()">show tasks</span>
       * </pre>
       *
       * <pre class="brush: js">
       * // myFooter.js
       * define('myFooter', ['Core/Control'], function(Control) {
       *    return Control.extend({
       *       _showTasksClick: function() {
       *          stackOpener.open();
       *       }
       *    });
       * });
       * </pre>
       *
       * <pre class="brush: html">
       * <!-- mySuggest.wml -->
       * <Controls.suggest:Input>
       *    <ws:footerTemplate templateName="myFooter">
       * </Controls.suggest:Input>
       * </pre>
       */
      footerTemplate: ISuggestFooterTemplate;

      /**
       * @cfg {String} Уникальный идентификатор для сохранения истории выбора записей из автодополнения.
       * @remark Если элементы были ранее выбраны, автодополнение с этими элементами будет отображаться после того, как на поле ввода перейдет фокус.
       * @example
       * <pre class="brush: html">
       * <!-- WML -->
       * <Controls.suggest:Input historyId="myHistoryId"/>
       * </pre>
       */

      /*
       * @cfg {String} Unique id to save input history.
       * @remark If items were previously selected, suggest with this items will be displayed after input get focused.
       * @example
       * <pre class="brush: html">
       * <!-- WML -->
       * <Controls.suggest:Input historyId="myHistoryId"/>
       * </pre>
       */
      historyId: string;

      /**
       * @cfg {Boolean} Отобразить автодополнение, когда на поле ввода перейдет фокус.
       * @example
       * В этом примере автодополнение будет показано после фокусировки на поле ввода.
       * <pre class="brush: html">
       * <!-- WML -->
       * <Controls.suggest:Input autoDropDown="{{true}}" />
       * </pre>
       */

      /*
       * @cfg {Boolean} Show suggest when the input get focused.
       * @example
       * In this example suggest will shown after input get focused.
       * <pre class="brush: html">
       * <!-- WML -->
       * <Controls.suggest:Input autoDropDown="{{true}}" />
       * </pre>
       */
      autoDropDown: boolean;

      /**
       * @cfg {Controls/popup:IStickyPopupOptions} Конфигурация всплывающего блока автодополнения.
       * @example
       * В этом примере автодополнение будет открыто вверх.
       * <pre class="brush: js">
       * // myModule.js
       * define('myModule', ['Core/Control', 'wml!myModule', 'Types/source:Memory'], function(Control, template, Memory) {
       *    return Control.extend({
       *       _template: template,
       *       _suggestPopupOptions: null,
       *       _beforeMount: function() {
       *          this._suggestPopupOptions = {
       *             direction : {
       *                vertical: 'bottom',
       *                horizontal: 'right'
       *             },
       *             targetPoint: {
       *                vertical: 'top',
       *                horizontal: 'left'
       *             }
       *          }
       *       });
       *    });
       * }
       * </pre>
       * 
       * <pre class="brush: html">
       * <!-- myModule.wml -->
       * <div>
       *    <Controls.suggest:Input suggestPopupOptions="{{_suggestPopupOptions}}"/>
       * </div>
       * </pre>
       */

      /*
       * @cfg {Controls/popup:IStickyPopupOptions} Suggest popup configuration.
       * @example
       * In this example, suggest will open up.
       * <pre class="brush: js">
       * // myModule.js
       * define('myModule', ['Core/Control', 'wml!myModule', 'Types/source:Memory'], function(Control, template, Memory) {
       *    return Control.extend({
       *       _template: template,
       *       _suggestPopupOptions: null,
       *       _beforeMount: function() {
       *          this._suggestPopupOptions = {
       *             direction : {
       *                vertical: 'bottom',
       *                horizontal: 'right'
       *             },
       *             targetPoint: {
       *                vertical: 'top',
       *                horizontal: 'left'
       *             }
       *          }
       *       });
       *    });
       * }
       * </pre>
       * 
       * <pre class="brush: html">
       * <!-- myModule.wml -->
       * <div>
       *    <Controls.suggest:Input suggestPopupOptions="{{_suggestPopupOptions}}"/>
       * </div>
       * </pre>
       */
      suggestPopupOptions: object;

      /**
       * @cfg {Function} Callback вызывающийся после того, как загружены данные.
       * @param {RecordSet} Загруженные данные.
       */
      dataLoadCallback: Function;
   };
}

export default ISuggest;
