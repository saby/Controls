import Control = require('Core/Control');
import template = require('wml!Controls/_filterPopup/Panel/Lookup/Lookup');
import tmplNotify = require('Controls/Utils/tmplNotify');
import {Logger} from 'UI/Utils';
import 'Controls/lookup';

/**
 * Метка с полем связи. Пока коллекция пуста - поле связи скрыто.
 * 
 * @remark
 * Если вы используете внутри подсказки поля ввода ссылку на открытие справочника - вам понадобиться {@link Controls/lookup:Link}.
 * Если вы хотите сделать динамичную подсказку поля ввода, которая будет меняться в зависимости от выбранной коллекции, используйте {@link Controls/lookup:PlaceholderChooser}.
 * Если хотите расположить поле связи с кнопкой-ссылкой в одну строку, необходимо на корневой элемет навесить класс 'ws-flexbox'.
 *
 * Полезные ссылки:
 * * <a href="/materials/Controls-demo/app/Controls-demo%2FLookup%2FIndex">демо-пример</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_filterPopup.less">переменные тем оформления</a>
 * 
 * @class Controls/_filterPopup/Panel/Lookup
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
 *
 */
/*
 * Label with a Lookup. While the collection is empty - the Lookup is hidden.
 * Here you can see <a href="/materials/Controls-demo/app/Controls-demo%2FLookup%2FIndex">demo-example</a>.
 * If you use the link to open the directory inside the tooltip of the input field, you will need {@link Controls/lookup:Link}.
 * If you want to make a dynamic placeholder of the input field, which will vary depending on the selected collection, use {@link Controls/lookup:PlaceholderChooser}.
 *
 * @class Controls/_filterPopup/Panel/Lookup
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
 * @author Kapustin I.A.
 */

/**
 * @name Controls/_filterPopup/Panel/Lookup#caption
 * @cfg {String} Caption
 */

/**
 * @name Controls/_filterPopup/Panel/Lookup#emptyText
 * @cfg {String} Текст ссылки, который отображается до первого выбора записи в контролле.
 */

   /**
    * @name Controls/_filterPopup/Panel/Lookup#lookupTemplateName
    * @cfg {String} Имя контрола с тем же интерфейсом, что и Lookup.
    * @default Controls/_lookup/Lookup
    * @example
    * <pre>
    *   <Controls.filterPopup:Lookup lookupTempalteName="namePace/Lookup"/>
    * </pre>
    */

   /*
    * @name Controls/_filterPopup/Panel/Lookup#lookupTemplateName
    * @cfg {String} Name of the control with same interface as Lookup.
    * @default Controls/_lookup/Lookup
    * @example
    * <pre>
    *   <Controls.filterPopup:Lookup lookupTempalteName="namePace/Lookup"/>
    * </pre>
    */

/**
 * @name Controls/_filterPopup/Panel/Lookup#lookupTemplateName
 * @cfg {String} Name of the control with same interface as Lookup.
 * @default Controls/_lookup/Lookup
 * @example
 * <pre>
 *   <Controls.filterPopup:Lookup lookupTempalteName="namePace/Lookup"/>
 * </pre>
 */

/**
 * @name Controls/_filterPopup/Panel/Lookup#lookupClassName
 * @cfg {String} Класс, который вешается на корневой элемент шаблона lookupTemplateName
 * @example
 * На корневой элемент шаблона "namePace/Lookup" навешивается класс "myClass"
 * <pre>
 *   <Controls.filterPopup:Lookup lookupTempalteName="namePace/Lookup" lookupClassName="myClass"/>
 * </pre>
 */



var _private = {
   getLookup: function(self) {
      if (typeof self._options.lookupTemplateName === 'string') {
         return self._children.lookup;
      } else {
          Logger.error('Option "Controls/_filterPopup/Panel/Lookup:lookupTemplateName" only supports string type', self);
      }
   },

   getCaption: function(self, options) {
      var caption = options.caption;

      if (options.emptyText && !self._passed && !options.selectedKeys.length) {
         caption = options.emptyText;
      }

      return caption;
   }
};

var Lookup = Control.extend({
   _template: template,
   _notifyHandler: tmplNotify,
   _passed: false,
   _caption: '',

   _beforeMount: function(options) {
      this._caption = _private.getCaption(this, options);
   },

   _beforeUpdate: function(newOptions) {
      this._caption = _private.getCaption(this, newOptions);
   },

   _afterUpdate: function(oldOptions) {
      var lookup = _private.getLookup(this);

      // if the first items were selected, call resize for Lookup
      if (!oldOptions.selectedKeys.length && this._options.selectedKeys.length) {
         this._children.controlResize.start();
         lookup && lookup.activate();
      }
   },

   showSelector: function(popupOptions) {
      var lookup = _private.getLookup(this);

      return lookup && lookup.showSelector(popupOptions);
   },

   _selectedKeysChanged: function(event, keys) {
      this._passed = true;
      this._notify('selectedKeysChanged', [keys]);
   },

   // when using Utils/tmplNotify, bubbling event comes with incorrect arguments to the filter panel
   // https://online.sbis.ru/opendoc.html?guid=88fed89c-9f87-440e-8549-aa6f468f7477
   _textValueChanged: function(event, textValue) {
      this._notify('textValueChanged', [textValue]);
   }
});

Lookup._private = _private;
Lookup._theme = ['Controls/filterPopup'];
Lookup.getDefaultOptions = function() {
   return {
      lookupTemplateName: 'Controls/lookup:Input'
   };
};

export = Lookup;

