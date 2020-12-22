/* eslint-disable */
define('Controls/interface/IHighlighter', [
], function() {

   /**
    * Интерфейс подсветки. В контроле могут использоваться различные типы маркеров:
    * маркер поиска, маркер валидации и т.д. Подсветка (маркер) используется при отрисовке элементов списка.
    *
    * @interface Controls/interface/IHighlighter
    * @author Авраменко А.С.
    * @public
    */

   /*
    * Highlighting interface. Different types of highlighter can be used in a component:
    * search highlighter, validation highlighter, etc. Highlighter is used when rendering list items.
    *
    * @interface Controls/interface/IHighlighter
    * @public
    * @author Авраменко А.С.
    */

   /**
    * @typedef {Object} Highlighter
    */

   /**
    * @name Controls/interface/IHighlighter#highlighter
    * @cfg {Array.<Highlighter>} Массив параметров подсветки элементов списка.
    */

   /*
    * @name Controls/interface/IHighlighter#highlighter
    * @cfg {Array.<Highlighter>} Array of highlighters.
    */
});
