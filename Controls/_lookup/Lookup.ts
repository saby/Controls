import Control = require('Core/Control');
import template = require('wml!Controls/_lookup/Lookup/Lookup');

/**
 * Поле ввода с автодополнением и возможностью выбора значений из справочника.
 * Выбранные значения отображаются в виде текста с кнопкой удаления внутри поля ввода.
 * 
 * @remark
 * Поддерживает автовысоту в зависимости от выбранных значений {@link multiLine},
 * одиночный и множественный выбор {@link multiSelect}.
 * 
 * Полезные ссылки:
 * * <a href="">демо-пример</a>
 * * <a href="/doc/platform/developmentapl/interface-development/controls/directory/lookup/">руководство разработчика</a>
 * * <a href="/materials/Controls-demo/app/Controls-demo%2FLookup%2FIndex">переменные тем оформления</a>
 * 
 *
 * @class Controls/_lookup/Lookup
 * @extends Core/Control
 * @mixes Controls/_interface/ILookup
 * @mixes Controls/interface/ISelectedCollection
 * @mixes Controls/_interface/ISelectorDialog
 * @mixes Controls/interface/ISuggest
 * @mixes Controls/_interface/ISearch
 * @mixes Controls/_interface/ISource
 * @mixes Controls/_interface/IFilter
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/_interface/IMultiSelectable
 * @mixes Controls/_interface/ITextValue
 * @mixes Controls/_interface/ISorting
 * @mixes Controls/_input/interface/IBase
 * @mixes Controls/_input/interface/IText
 * @mixes Controls/_interface/IHeight
 * @mixes Controls/_interface/IFontSize
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/interface/IInputTag
 * @mixes Controls/interface/IInputField
 * @mixes Controls/interface/IInputStyle
 * @control
 * @public
 * @author Герасимов А.М.
 * @demo Controls-demo/Input/Lookup/LookupPropertyGrid
 */
/*
 * “Lookup:Input” is an input field with auto-completion and the ability to select a value from the directory.
 * Сan be displayed in single-line and multi-line mode.
 * Supports single and multiple selection.
 * Here you can see <a href="/materials/Controls-demo/app/Controls-demo%2FLookup%2FIndex">demo-example</a>.
 * If you use the link to open the directory inside the tooltip of the input field, you will need {@link Controls/lookup:Link}.
 * If you want to make a dynamic placeholder of the input field, which will vary depending on the selected collection, use {@link Controls/lookup:PlaceholderChooser}.
 * If you need a choice of several directories, one value from each, then {@link Controls / lookup: MultipleInput} is suitable for you.
 *
 * @class Controls/_lookup/Lookup
 * @extends Core/Control
 * @mixes Controls/_interface/ILookup
 * @mixes Controls/interface/ISelectedCollection
 * @mixes Controls/interface/ISelectorDialog
 * @mixes Controls/interface/ISuggest
 * @mixes Controls/_interface/ISearch
 * @mixes Controls/_interface/ISource
 * @mixes Controls/_interface/IFilter
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/_interface/IMultiSelectable
 * @mixes Controls/_interface/ITextValue
 * @mixes Controls/_interface/ISorting
 * @mixes Controls/_input/interface/IBase
 * @mixes Controls/_input/interface/IText
 * @mixes Controls/_interface/IHeight
 * @mixes Controls/_interface/IFontSize
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/interface/IInputTag
 * @mixes Controls/interface/IInputField
 * @mixes Controls/interface/IInputStyle
 * @control
 * @public
 * @author Герасимов А.М.
 * @demo Controls-demo/Input/Lookup/LookupPropertyGrid
 */

/**
 * @name Controls/_lookup/Lookup#multiLine
 * @cfg {Boolean} Определяет, включать ли режим автовысоты при выборе записей,
 * когда включён этот режим, поле связи может отображаться в несколько строк.
 * @default false
 * @remark
 * Когда поле связи находится в многострочном режиме, то высота определяется автоматически по выбранным записям. Количество отображаемых записей устанавливается опцией {@link Controls/interface/ISelectedCollection#maxVisibleItems}.
 * Актуально только при multiSelect: true.
 *
 * @example
 * WML:
 * <pre>
 *    <Controls.lookup:Input
 *       source="{{_source}}"
 *       keyProperty="id"
 *       searchParam="title"
 *       multiSelect="{{true}}"
 *       multiLine="{{true}}">
 *    </Controls.lookup:Input>
 * </pre>
 *
 * @see Controls/interface/ISelectedCollection#maxVisibleItems
 * @see Controls/interface/ISelectedCollection#multiSelect
 */
/*
 * @name Controls/_lookup/Lookup#multiLine
 * @cfg {Boolean} Determines then Lookup can be displayed in multi line mode.
 * @default false
 * @remark
 *
 When the communication field is in multi-line mode, the height is automatically determined by the selected records. The number of records displayed is set by the {@link Controls/interface/ISelectedCollection#maxVisibleItems} option.
 * Only relevant with multiSelect: true.
 *
 * @example
 * WML:
 * <pre>
 *    <Controls.lookup:Input
 *       source="{{_source}}"
 *       keyProperty="id"
 *       searchParam="title"
 *       multiSelect="{{true}}"
 *       multiLine="{{true}}">
 *    </Controls.lookup:Input>
 * </pre>
 *
 * @see Controls/interface/ISelectedCollection#maxVisibleItems
 * @see Controls/interface/ISelectedCollection#multiSelect
 */

/**
 * @name Controls/_lookup/Lookup#comment
 * @cfg {String} Текст, который отображается в {@link placeholder подсказке} поля ввода, если в поле связи выбрано значение.
 * @remark
 * Если указана опция comment, то для поля связи будет включён режим,
 * в котором после выбора записи, поле ввода будет продолжать отображаться.
 * Актуально только в режиме единичного выбора.
 * Введённый комментарий можно получить из опции value поля связи.
 * @example
 * WML:
 * <pre>
 *     <Controls.lookup:Input
 *             comment='Введите комментарий'
 *             displayProperty='name'
 *             keyProperty='id'
 *             multiSelect='{{false}}'
 *             source='{{_source}}'
 *             bind:value='_value'
 *             bind:selectedKeys='_selectedKeys'/>
 * </pre>
 *
 * JS:
 * <pre>
 *     import {Memory} from 'Types/source';
 *
 *     protected _beforeMount() {
 *        this._source = new Memory({
 *            keyProperty: 'id'
 *            data: [
 *               { id: 1, name: 'Sasha' },
 *               { id: 2, name: 'Mark' },
 *               { id: 3, name: 'Jasmin' },
 *               { id: 4, name: 'Doggy' }
 *            ]
 *        });
 *        this._selectedKeys = [];
 *     }
 * </pre>
 * @link placeholder
 */
/*
 * @name Controls/_lookup/Lookup#comment
 * @cfg {String} The text that is displayed in the empty comment box.
 * @remark
 * Actual only in the mode of single choice.
 * If the value is not specified, the comment field will not be displayed.
 */

var Lookup = Control.extend({
   _template: template,

   showSelector: function (popupOptions) {
      return this._children.controller.showSelector(popupOptions);
   }
});

export = Lookup;

