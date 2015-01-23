define('js!SBIS3.CONTROLS.MenuLink', ['js!SBIS3.CONTROLS.Link', 'js!SBIS3.CONTROLS.CollectionMixin', 'js!SBIS3.CONTROLS.PickerMixin', 'js!SBIS3.CONTROLS.MenuButtonMixin', 'js!SBIS3.CONTROLS.ContextMenu'], function(Link, CollectionMixin, PickerMixin, MenuButtonMixin, ContextMenu) {

   'use strict';

   /**
    * Контрол, отображающий кнопку в виде ссылки и выпадающее из нее меню
    * @class SBIS3.Engine.MenuLink
    * @extends SBIS3.CONTROLS.ButtonBase
    * @control
    * @mixes SBIS3.CONTROLS.CollectionMixin
    * @mixes SBIS3.CONTROLS.PickerMixin
    */

   var MenuLink = Link.extend( [PickerMixin, CollectionMixin, MenuButtonMixin], /** @lends SBIS3.Engine.Link.prototype */ {
      $protected: {
         _zIndex: '',
         _options: {
         }
      },

      $constructor: function() {
         var self = this;
         if (this.getItems().getItemsCount() > 1) {
            this.subscribe('onActivated', function () {
               this._container.addClass('controls-Checked__checked');
               self.togglePicker();
            });
         } else {
            if (this.getItems().getNextItem().handler) {
               this.subscribe('onActivated', function () {
                  this.getItems().getNextItem().handler();
               });
            }
         }
      },

      _createPicker: function(){
         return new ContextMenu(this._setPickerConfig());
      },

      _setPickerContent: function(){
         var self = this;
         this._picker._container.addClass('controls-MenuLink__Menu');
         var header= $('<div class="controls-MenuLink__header"></div>');
         header.append(this._container.clone());
         this._picker.getContainer().prepend(header);
         $('.controls-MenuLink__header', this._picker._container).bind('click', function(){
            self.hidePicker();
         });
      }
   });

   return MenuLink;

});