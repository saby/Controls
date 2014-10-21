define('js!SBIS3.CONTROLS.ComboBox', [
   'js!SBIS3.CONTROLS.TextBox',
   'js!SBIS3.CONTROLS._PickerMixin',
   'js!SBIS3.CONTROLS._CollectionMixin',
   'js!SBIS3.CONTROLS._SelectorMixin',
   'html!SBIS3.CONTROLS.ComboBox/resources/ComboBoxArrowDown',
   'html!SBIS3.CONTROLS.ComboBox/resources/ComboBoxItemTpl'
], function(TextBox, _PickerMixin, _CollectionMixin, _SelectorMixin, arrowTpl, itemTpl) {
   'use strict';
   /**
    * Выпадающий список с выбором значений из набора. Есть настройка которая позволяет также  вручную вводить значения.
    * @class SBIS3.CONTROLS.ComboBox
    * @extends SBIS3.CONTROLS.TextBox
    * @control
    * @public
    * @category Inputs
    * @mixes SBIS3.CONTROLS._PickerMixin
    * @mixes SBIS3.CONTROLS._FormWidgetMixin
    * @mixes SBIS3.CONTROLS._CollectionMixin
    * @mixes SBIS3.CONTROLS._SelectorMixin
    */

   var ComboBox = TextBox.extend([_PickerMixin, _CollectionMixin, _SelectorMixin], /** @lends SBIS3.CONTROLS.ComboBox.prototype */{
      $protected: {
         _itemTpl : itemTpl,
         _displayField : '',
         _options: {
            afterFieldWrapper: arrowTpl,
            /**
             * @cfg {Boolean} Возможен ли ручной ввод текста
             */
            isEditable: true,
            /**
             * @cfg {Boolean} Присутствует пустое значение или нет
             */
            emptyValue: false,
            /**
             * @cfg {String} Форматирование значений в списке
             */
            valueFormat: ''
         }
      },

      $constructor: function() {
         var self = this;
         self.getContainer().addClass('controls-ComboBox');
         if (this._options.displayField) {
            this._displayField = this._options.displayField;
         }
         else {
            //TODO по умолчанию поле title???
            this._displayField = 'title';
         }
         if (this._options.itemTemplate) {
            this._itemTpl = this._options.itemTemplate;
         }

         //TODO: в идеале надо сделать, чтобы атрибут проставлялся в шаблоне, и не плодить его на все контролы-наследники TextBox'а, плюс очень похоже на enabled
         // запрещен ручной ввод значений
         if(!this._options.isEditable){
            self.getContainer().addClass('controls-ComboBox__isEditable-false').find('.js-controls-TextBox__field').attr('readonly', 'readonly').addClass('js-controls-ComboBox__arrowDown');
         }

         if (this._items.getItemsCount()) {
            /*устанавливаем первое значение TODO по идее переписан метод setSelectedItem для того чтобы не срабатывало событие при первой установке*/
            var
               item = this._items.getNextItem();
            this._selectedItem = this._items.getKey(item);
            ComboBox.superclass.setText.call(this, item[this._displayField]);
         }

         /*обрабочики кликов*/
         $('.js-controls-ComboBox__arrowDown', this._container.get(0)).click(function () {
            if (self.isEnabled()) {
               $('.controls-ComboBox__itemRow__selected').removeClass('controls-ComboBox__itemRow__selected');
               var key = self.getSelectedItem();
               $('.controls-ComboBox__itemRow[data-key=\'' + key + '\']').addClass('controls-ComboBox__itemRow__selected');
               self.togglePicker();
            }
         });

      },

      setText : function(text) {
         ComboBox.superclass.setText.call(this, text);
         this._setKeyByText();
         this.hidePicker();
      },

      _drawSelectedItem : function(key) {
         if (key) {
            var item = this._items.getItem(key);
            ComboBox.superclass.setText.call(this, item[this._displayField]);
            $('.controls-ComboBox__itemRow__selected').removeClass('controls-ComboBox__itemRow__selected');
            $('.controls-ComboBox__itemRow[data-key=\'' + key + '\']').addClass('controls-ComboBox__itemRow__selected');
         }
      },

      //TODO от этого надо избавиться. Пользуется Саня Кузьмин
      _notifySelectedItem : function(key) {
         var text = this.getText();
         this._notify('onChangeSelectedItem', key, text);
      },

      _setPickerContent: function () {
         this._drawItems();
         //TODO: кажется неочевидное место, возможно как то автоматизировать
         this._picker.getContainer().addClass('controls-ComboBox__picker');
      },

      _drawItems: function () {
         var self = this;
         if (self._picker) {
            self._picker.getContainer().empty();
            this._items.iterate(function (item, key) {
               /*TODO просто в пикер пихаются дивы. Норм ли это понять после разработки ListView*/
               self._picker.getContainer().append(self._itemTpl({key: key, title: item[self._displayField]}));
            });
            $('.js-controls-ComboBox__itemRow', self._picker.getContainer().get(0)).click(function () {
               self.setValue($(this).attr('data-key'));
               self.hidePicker();
            });

         }
      },

      _keyDownBind : function(e){
         /*описываем здесь поведение стрелок вверх и вниз*/
         var self = this,
         current = self.getSelectedItem();
			if (e.which == 40 || e.which == 38) {
            e.preventDefault();
         }
         var newItem;
         if (e.which == 40) {
            newItem = self.getItems().getNextItem(current);
         }
         if (e.which == 38) {
            newItem = self.getItems().getPreviousItem(current);
         }
         if (newItem) {
            self.setSelectedItem(this._items.getKey(newItem));
         }
         if (e.which == 13) {
            this.hidePicker();
         }
      },


      _keyUpBind: function(e) {
         /*по изменению текста делаем то же что и в текстбоксе*/
         ComboBox.superclass._keyUpBind.call(this);
         /*не делаем смену значения при нажатии на стрелки вверх вниз. Иначе событие смены ключа срабатывает два раза*/
         if ((e.which != 40) && (e.which != 38)) {
            this._setKeyByText();
         }
      },

      _setKeyByText : function() {
         /*устанавливаем ключ, когда текст изменен извне*/
         var
            selKey,
            oldKey = this._selectedItem,
            self = this,
            text = this._options.text;
         this._items.iterate(function(item, key){
            if (item[self._displayField] == text) {
               selKey = key;
            }
         });
         this._selectedItem = selKey || null;
         if (oldKey !== this._selectedItem) { // при повторном индексе null не стреляет событием
            this._notifySelectedItem(this._selectedItem);
         }
      },

      setValue: function(key){
         this.setSelectedItem(key);
      },

      getValue: function() {
         return this.getSelectedItem();
      }
   });

   return ComboBox;
});