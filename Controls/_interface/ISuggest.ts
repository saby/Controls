import {
   ISearch,
   INavigation,
   IBorderStyle,
   IFontColorStyle,
   IFontSize,
   ISource,
   IValidationStatus, IFilter
} from 'Controls/interface';
import {IStickyPopupOptions} from 'Controls/popup';
import {IBase, ITag, IText, IValue} from 'Controls/input';
import {IControlOptions} from 'UI/Base';

export interface ISuggestOptions extends IControlOptions, ISearch, INavigation,
   IBase, IBorderStyle, IFontColorStyle, IFontSize, ISource, ITag, IText, IValidationStatus,
   IValue, IFilter {
   displayProperty: string;
   autoDropDown: boolean;
   emptyTemplate: IEmptyTemplateProp | null;
   footerTemplate: ISuggestFooterTemplate;
   historyId: string;
   suggestPopupOptions: IStickyPopupOptions;
   suggestTemplate: ISuggestTemplateProp | null;
}

/**
 * Интерфейс для автодополнения.
 *
 * @interface Controls/_interface/ISuggest
 * @public
 * @author Герасимов А.М.
 */

/*
 * Interface for auto-completion.
 *
 * @interface Controls/_interface/ISuggest
 * @public
 * @author Gerasimov A.M.
 */
export default interface ISuggest {
   readonly '[Controls/_interface/ISuggest]': boolean;
}

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
 * @name Controls/_interface/ISuggest#displayProperty
 * @cfg {String} Имя свойства элемента, значение которого отобразится в поле ввода поле выбора записи.
 * @remark
 * @demo Controls-demo/Suggest_new/Input/DisplayProperty/DisplayProperty
 * @example
 * myModule.js
 * <pre>
 *    define('myModule', ['Core/Control', 'wml!myModule', 'Types/source:Memory'], function(Control, template, Memory) {
 *       return Control.extend({
 *          _template: template,
 *          _suggestValue: null,
 *          _source: null,
 *
 *          _beforeMount: function() {
 *             this._source = new Memory({
 *                rawData: [
 *                   {id: 0, city: 'Yaroslavl'},
 *                   {id: 1, city: 'Moscow'}
 *                ]
 *                keyProperty: 'id'
 *             });
 *          },
 *
 *          _choose: function(event, value) {
 *             this._suggestValue = value;
 *          }
 *       });
 *    });
 * </pre>
 * myModule.wml
 * <pre>
 *    <div>
 *       <Controls.suggest:Input displayProperty="city" on:choose="_choose()"/>
 *    </div>
 *    ChosenValue: {{_suggestValue || 'Nothing were chosen'}}
 * </pre>
 */

/*
 * @name Controls/_interface/ISuggest#displayProperty
 * @cfg {String} Name of the item property which content will be displayed.
 * @remark
 * @demo Controls-demo/Suggest_new/Input/DisplayProperty/DisplayProperty
 * @example
 * myModule.js
 * <pre>
 *    define('myModule', ['Core/Control', 'wml!myModule', 'Types/source:Memory'], function(Control, template, Memory) {
 *       return Control.extend({
 *          _template: template,
 *          _suggestValue: null,
 *          _source: null,
 *
 *          _beforeMount: function() {
 *             this._source = new Memory({
 *                rawData: [
 *                   {id: 0, city: 'Yaroslavl'},
 *                   {id: 1, city: 'Moscow'}
 *                ]
 *                keyProperty: 'id'
 *             });
 *          },
 *
 *          _choose: function(event, value) {
 *             this._suggestValue = value;
 *          }
 *       });
 *    });
 * </pre>
 * myModule.wml
 * <pre>
 *    <div>
 *       <Controls.suggest:Input displayProperty="city" on:choose="_choose()"/>
 *    </div>
 *    ChosenValue: {{_suggestValue || 'Nothing were chosen'}}
 * </pre>
 */

/**
 * @name Controls/_interface/ISuggest#suggestTemplate
 * @cfg {ISuggestTemplateProp|null} Шаблон автодополнения, который отображает результаты поиска.
 * @remark Корневым контролом автодополнения должен быть Controls/Container/Suggest/List, этому контролу можно передать в контентной опции контрол ({@link Controls/list:View} или {@link Controls/grid:View}), который отобразит список.
 * @remark Вы можете установить ширину окна с автодополнением, добавив собственный класс в suggestTemplate и установив минимальную ширину. По умолчанию ширина автодополнения равна ширине поля ввода.
 * @demo Controls-demo/Suggest_new/SearchInput/SuggestTemplate/SuggestTemplate
 * @editor function
 * @example
 * suggestTemplate.wml
 * <pre>
 *    <Controls.suggestPopup:ListContainer attr:class="myClass">
 *       <Controls.list:View keyProperty="id">
 *          <ws:itemTemplate>
 *             <ws:partial template="Controls/list:ItemTemplate" displayProperty="city"/>
 *          </ws:itemTemplate>
 *       </Controls.list:View>
 *    </Controls.suggestPopup:ListContainer>
 * </pre>
 *
 * suggestTemplate.css
 * <pre>
 *    .myClass {
 *       min-width: 300px;
 *    }
 * </pre>
 *
 * контрол с Input/Suggest:
 * <pre>
 *    <Controls.suggest:Input>
 *       <ws:suggestTemplate templateName="wml!SuggestTemplate">
 *          <ws:templateOptions />
 *       </ws:suggestTemplate>
 *    </Controls.suggest:Input>
 * </pre>
 */

/*
 * @name Controls/interface/ISuggest#suggestTemplate
 * @cfg {ISuggestTemplateProp|null} Template for suggest, that showing search results.
 * @remark Root control of suggest must be {@link Controls/suggestPopup:ListContainer}, for this control you can pass in content option a control (such {@link Controls/list:View} or {@link Controls/grid:View}), that will displaying a list.
 * @remark You can set width of suggestions popup by adding own class on suggestTemplate and set min-width by this class. By default width of the suggest is equal input field width.
 * @demo Controls-demo/Suggest_new/SearchInput/SuggestTemplate/SuggestTemplate
 * @editor function
 * @example
 * suggestTemplate.wml
 * <pre>
 *    <Controls.Container.Suggest.List attr:class="myClass">
 *       <Controls.list:View keyProperty="id">
 *          <ws:itemTemplate>
 *             <ws:partial template="Controls/list:ItemTemplate" displayProperty="city"/>
 *          </ws:itemTemplate>
 *       </Controls.list:View>
 *    </Controls.Container.Suggest.List>
 * </pre>
 *
 * suggestTemplate.css
 * <pre>
 *    .myClass {
 *       min-width: 300px;
 *    }
 * </pre>
 *
 * component with Input/Suggest:
 * <pre>
 *    <Controls.suggest:Input>
 *       <ws:suggestTemplate templateName="wml!SuggestTemplate">
 *          <ws:templateOptions />
 *       </ws:suggestTemplate>
 *    </Controls.suggest:Input>
 * </pre>
 */

/**
 * @name Controls/_interface/ISuggest#emptyTemplate
 * @cfg {IEmptyTemplateProp|null} Шаблон, который будет отображаться в автодополнении, если поисковой запрос не вернул результатов.
 * @remark Если опция имеет значение null, то автодополнение не отобразится, если поисковой запрос не вернул результатов.
 * @demo Controls-demo/Suggest_new/SearchInput/EmptyTemplate/EmptyTemplate
 * @example
 * emptyTemplate.wml:
 * <pre>
 *    <div class="emptyTemplate-class">Sorry, no data today</div>
 * </pre>
 *
 * MySuggest.wml:
 * <pre>
 * <Controls.suggest:Input>
 *    <ws:emptyTemplate templateName="wml!emptyTemplate">
 *       <ws:templateOptions showImage={{_showImage}}/>
 *    </ws:emptyTemplate>
 * </Controls.suggest:Input>
 * </pre>
 */

/*
 * @name Controls/interface/ISuggest#emptyTemplate
 * @cfg {IEmptyTemplateProp|null} Template for suggest when no results were found.
 * @remark If option set to null, empty suggest won't appear.
 * @demo Controls-demo/Suggest_new/SearchInput/EmptyTemplate/EmptyTemplate
 * @example
 * emptyTemplate.wml:
 * <pre>
 *    <div class="emptyTemplate-class">Sorry, no data today</div>
 * </pre>
 *
 * MySuggest.wml:
 * <pre>
 * <Controls.suggest:Input>
 *    <ws:emptyTemplate templateName="wml!emptyTemplate">
 *       <ws:templateOptions showImage={{_showImage}}/>
 *    </ws:emptyTemplate>
 * </Controls.suggest:Input>
 * </pre>
 */

/**
 * @name Controls/_interface/ISuggest#footerTemplate
 * @cfg {ISuggestFooterTemplate} Шаблон подвала автодополнения.
 * @demo Controls-demo/Suggest_new/SearchInput/FooterTemplate/FooterTemplate
 * @example
 * myFooter.wml
 * <pre>
 *    <span on:click="_showTasksClick()">show tasks</span>
 * </pre>
 *
 * myFooter.js
 * <pre>
 *    define('myFooter', ['Core/Control'], function(Control) {
 *       return Control.extend({
 *          _showTasksClick: function() {
 *             stackOpener.open();
 *          }
 *       });
 *    });
 * </pre>
 *
 * mySuggest.wml
 * <pre>
 *    <Controls.suggest:Input>
 *       <ws:footerTemplate templateName="myFooter">
 *    </Controls.suggest:Input>
 * </pre>
 */

/*
 * @name Controls/_interface/ISuggest#footerTemplate
 * @cfg {ISuggestFooterTemplate} Footer template of suggest.
 * @demo Controls-demo/Suggest_new/SearchInput/FooterTemplate/FooterTemplate
 * @example
 * myFooter.wml
 * <pre>
 *    <span on:click="_showTasksClick()">show tasks</span>
 * </pre>
 *
 * myFooter.js
 * <pre>
 *    define('myFooter', ['Core/Control'], function(Control) {
 *       return Control.extend({
 *          _showTasksClick: function() {
 *             stackOpener.open();
 *          }
 *       });
 *    });
 * </pre>
 *
 * mySuggest.wml
 * <pre>
 *    <Controls.suggest:Input>
 *       <ws:footerTemplate templateName="myFooter">
 *    </Controls.suggest:Input>
 * </pre>
 */

/**
 * @name Controls/_interface/ISuggest#historyId
 * @cfg {String} Уникальный идентификатор для сохранения истории выбора записей из автодополнения.
 * @remark Если элементы были ранее выбраны, автодополнение с этими элементами будет отображаться после того, как на поле ввода перейдет фокус.
 * @example
 * <pre>
 *    <Controls.suggest:Input historyId="myHistoryId"/>
 * </pre>
 */

/*
 * @name Controls/_interface/ISuggest#historyId
 * @cfg {String} Unique id to save input history.
 * @remark If items were previously selected, suggest with this items will be displayed after input get focused.
 * @example
 * <pre>
 *    <Controls.suggest:Input historyId="myHistoryId"/>
 * </pre>
 */

/**
 * @name Controls/_interface/ISuggest#autoDropDown
 * @cfg {Boolean} Отобразить автодополнение, когда на поле ввода перейдет фокус.
 * @example
 * В этом примере автодополнение будет показано после фокусировки на поле ввода.
 * <pre>
 *    <Controls.suggest:Input autoDropDown="{{true}}" />
 * </pre>
 */

/*
 * @name Controls/_interface/ISuggest#autoDropDown
 * @cfg {Boolean} Show suggest when the input get focused.
 * @example
 * In this example suggest will shown after input get focused.
 * <pre>
 *    <Controls.suggest:Input autoSuggest={{true}}/>
 * </pre>
 */

/**
 * @event Происходит, когда пользователь выбирает элемент из автодополнения.
 * @name Controls/_interface/ISuggest#choose
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} value Выбранное значение.
 * @demo Controls-demo/Suggest_new/SearchInput/AutoDropDown/AutoDropDown
 * @example
 * myModule.js
 * <pre>
 *    define('myModule', ['Core/Control', 'wml!myModule', 'Types/source:Memory'], function(Control, template, Memory) {
 *       return Control.extend({
 *          _template: template,
 *          _suggestValue: null,
 *          _source: null,
 *
 *          _beforeMount: function() {
 *             this._source = new Memory({
 *                rawData: [
 *                   {id: 0, city: 'Yaroslavl'},
 *                   {id: 1, city: 'Moscow'}
 *                ]
 *                keyProperty: 'id'
 *             });
 *          },
 *
 *          _choose: function(event, value) {
 *             this._suggestValue = value;
 *          }
 *       });
 *    });
 * </pre>
 * myModule.wml
 * <pre>
 *    <div>
 *       <Controls.suggest:Input displayProperty='city' on:choose="_choose()"/>
 *    </div>
 *    ChosenValue: {{_suggestValue || 'Nothing were chosen'}}
 * </pre>
 */

/*
 * @event Occurs when user selects item from suggest.
 * @name Controls/_interface/ISuggest#choose
 * @param {Vdom/Vdom:SyntheticEvent} eventObject The event descriptor.
 * @param {Types/entity:Model} value Selected value.
 * @demo Controls-demo/Suggest_new/SearchInput/AutoDropDown/AutoDropDown
 * @example
 * myModule.js
 * <pre>
 *    define('myModule', ['Core/Control', 'wml!myModule', 'Types/source:Memory'], function(Control, template, Memory) {
 *       return Control.extend({
 *          _template: template,
 *          _suggestValue: null,
 *          _source: null,
 *
 *          _beforeMount: function() {
 *             this._source = new Memory({
 *                rawData: [
 *                   {id: 0, city: 'Yaroslavl'},
 *                   {id: 1, city: 'Moscow'}
 *                ]
 *                keyProperty: 'id'
 *             });
 *          },
 *
 *          _choose: function(event, value) {
 *             this._suggestValue = value;
 *          }
 *       });
 *    });
 * </pre>
 * myModule.wml
 * <pre>
 *    <div>
 *       <Controls.suggest:Input displayProperty='city' on:choose="_choose()"/>
 *    </div>
 *    ChosenValue: {{_suggestValue || 'Nothing were chosen'}}
 * </pre>
 */

/**
 * @name Controls/_interface/ISuggest#suggestPopupOptions
 * @cfg {Controls/popup:IStickyPopupOptions} Конфигурация всплывающего блока автодополнения.
 * @example
 * В этом примере автодополнение будет открыто вверх.
 * myModule.js
 * <pre>
 *    define('myModule', ['Core/Control', 'wml!myModule', 'Types/source:Memory'], function(Control, template, Memory) {
 *       return Control.extend({
 *          _template: template,
 *          _suggestPopupOptions: null,
 *
 *          _beforeMount: function() {
 *             this._suggestPopupOptions = {
 *                 direction : {
 *                   vertical: 'bottom',
 *                   horizontal: 'right'
 *                 },
 *                 targetPoint: {
 *                    vertical: 'top',
 *                    horizontal: 'left'
 *                }
 *             }
 *          });
 *       });
 *    }
 * </pre>
 * myModule.wml
 * <pre>
 *    <div>
 *       <Controls.suggest:Input suggestPopupOptions="{{_suggestPopupOptions}}"/>
 *    </div>
 * </pre>
 */

/*
 * @name Controls/_interface/ISuggest#suggestPopupOptions
 * @cfg {Controls/popup:IStickyPopupOptions} Suggest popup configuration.
 * @example
 * In this example, suggest will open up.
 * myModule.js
 * <pre>
 *    define('myModule', ['Core/Control', 'wml!myModule', 'Types/source:Memory'], function(Control, template, Memory) {
 *       return Control.extend({
 *          _template: template,
 *          _suggestPopupOptions: null,
 *
 *          _beforeMount: function() {
 *             this._suggestPopupOptions = {
 *                 direction : {
 *                   vertical: 'bottom',
 *                   horizontal: 'right'
 *                 },
 *                 targetPoint: {
 *                    vertical: 'top',
 *                    horizontal: 'left'
 *                }
 *             }
 *          });
 *       });
 *    }
 * </pre>
 * myModule.wml
 * <pre>
 *    <div>
 *       <Controls.suggest:Input suggestPopupOptions="{{_suggestPopupOptions}}"/>
 *    </div>
 * </pre>
 */
