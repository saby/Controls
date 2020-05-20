import Control = require('Core/Control');
import template = require('wml!Controls/_suggestPopup/Dialog');
import {SearchContextField, FilterContextField} from 'Controls/context';
import {_scrollContext as ScrollData} from 'Controls/scroll';

import 'Controls/popupTemplate';

      /**
       * Контрол-контейнер, который обеспечивает связь поля ввода и списка внутри выпадающего блока.
       * @example
       * JavaScript
       * <pre class="brush: js">
       * define('myControl/SuggestList',
       *    [
       *       'UI/Base',
       *       'wml!myControl/SuggestList'
       *    ], function(Base, template) {
       *       'use strict';
       *         
       *       return Base.Control.extend({
       *          _template: template
       *       });
       *    }
       * );
       * </pre>
       * WML
       * <pre class="brush: html">
       * <Controls.suggestPopup:ListContainer>
       *    <Controls.list:View
       *       displayProperty="title"
       *       keyProperty="id"
       *       attr:class="demo-SuggestList"/>
       * </Controls.suggestPopup:ListContainer>
       * </pre>
       * @class Controls/_suggestPopup/List
       * @extends Controls/Control
       * @author Герасимов А.М.
       * @control
       * @public
       */

      /*
       * Dialog for list in Suggest component.
       * @class Controls/_suggestPopup/List
       * @extends Controls/Control
       * @author Герасимов Александр
       * @control
       * @public
       */

      var List = Control.extend({

         _template: template,
         _resizeTimeout: null,

         _beforeMount: function() {
            this._scrollData = new ScrollData({pagingVisible: false});

            //TODO временное решение, контекст должен долетать от Application'a, удалить, как будет сделано (Шипин делает)
            //https://online.sbis.ru/opendoc.html?guid=91b2abcb-ca15-46ea-8cdb-7b1f51074c65
            this._searchData = new SearchContextField(null);
         },

         _getChildContext: function() {
            return {
               searchLayoutField: this._searchData,
               ScrollData: this._scrollData,
               filterLayoutField: new FilterContextField({filter: this._options.filter})
            };
         },

         _beforeUnmount: function() {
            clearTimeout(this._resizeTimeout);
            this._resizeTimeout = null;
         },

         _itemClick: function(event, item) {
            this._notify('sendResult', [item], { bubbling: true });
            this._notify('close', [], { bubbling: true });
         }

      });
      List._theme = ['Controls/suggest', 'Controls/suggestPopup'];
      export = List;


