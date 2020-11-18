import ISuggest from "Controls/interface/ISuggest";

type ISuggest = ISuggest & {
      readonly _options: {
      /**
       * @name Controls/_suggest/ISuggest#displayProperty
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
       * @name Controls/_suggest/ISuggest#displayProperty
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
      displayProperty: string;
   };
}
/**
 * Интерфейс для Input.Suggest.
 *
 * @interface Controls/_suggest/ISuggest
 * @mixes Controls/interface/ISuggest
 * @public
 * @author Герасимов А.М.
 */

/*
 * Interface for Input.Suggest.
 *
 * @interface Controls/_suggest/ISuggest
 * @public
 * @author Gerasimov A.M.
 */
export default ISuggest;
