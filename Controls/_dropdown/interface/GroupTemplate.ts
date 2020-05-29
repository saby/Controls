/**
 * Шаблон отображения заголовка группы.
 * 
 * @remark
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_dropdown.less">переменные тем оформления</a>
 * 
 * @class Controls/dropdown:GroupTemplate
 * @public
 * @author Герасимов А.М.
 * @example
 * Меню с отображением заголовка группы 'Select'.
 * <pre class="brush: html">
 * <Controls.dropdown:Button
 *    keyProperty="id"
 *    source="{{_source)}}"
 *    groupProperty="group">
 *    <ws:groupTemplate>
 *      <ws:partial template="Controls/dropdown:GroupTemplate" showText="{{true}}"/>
 *    </ws:groupTemplate>
 *    </Controls.dropdown:Button>
 * </pre>
 * <pre class="brush: js">
 *    _source: null,
 *    _beforeMount: function() {
 *        this._source = new source.Memory ({
 *           data: [
 *                   { key: 1, title: 'Project', group: 'Select' },
 *                   { key: 2, title: 'Work plan', group: 'Select' },
 *                   { key: 3, title: 'Task', group: 'Select' },
 *               ],
 *           keyProperty: 'key'
 *        });
 *   }
 * </pre>
 */

/**
 * @typedef {String} TextAlign
 * @variant left Текст выравнивается по левой стороне.
 * @variant right Текст выравнивается по правой стороне.
 */

/**
 * @name Controls/dropdown:GroupTemplate#showText
 * @cfg {Boolean} Определяет, отображается ли название группы.
 * @default false
 */

/**
 * @name Controls/dropdown:GroupTemplate#showText
 * @cfg {TextAlign} Выравнивание заголовка группы по горизонтали.
 * @default undefined
 */

/**
 * @name Controls/dropdown:GroupTemplate#contentTemplate
 * @cfg {String|Function|undefined} Устанавливает пользовательский шаблон, описывающий содержимое элемента.
 * @default undefined
 */
