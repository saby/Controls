/**
 * Created by iv.cheremushkin on 18.11.2014.
 */
define('js!SBIS3.CONTROLS.EditAtPlaceGroup',
   ['js!SBIS3.CORE.CompoundControl',
      'js!SBIS3.CONTROLS.IconButton',
      'js!SBIS3.CONTROLS.PickerMixin',
      'js!SBIS3.CONTROLS.EditAtPlace',
      'js!SBIS3.CORE.Dialog',
      'js!SBIS3.CONTROLS.ControlHierarchyManager',
      'html!SBIS3.CONTROLS.EditAtPlaceGroup'],
   function (CompoundControl, IconButton, PickerMixin, EditAtPlace, Dialog, ControlHierarchyManager, dotTplFn) {
      'use strict';
      /**
       * @class SBIS3.CONTROLS.EditAtPlaceGroup
       * @extends SBIS3.CORE.CompoundControl
       * @control
       * @public
       * @category Inputs
       * @mixes SBIS3.CONTROLS._PickerMixin
       */

      var EditAtPlaceGroup = CompoundControl.extend([PickerMixin], /** @lends SBIS3.CONTROLS.EditAtPlaceGroup.prototype */{
         $protected: {
            _dotTplFn: dotTplFn,
            _textField: null,
            _cancelButton: null,
            _okButton: null,
            _cancelCross: null,
            _editorTpl: null,
            _forceClose: true,
            _options: {
               /**
                * @cfg {String} шаблон
                */
               template: null,
               /**
                * @cfg {Boolean} отображать как редактор
                */
               displayAsEditor: false,
               /**
                * @cfg {Boolean} редактировать во всплывашке или в собственном контейнере
                */
               editInPopup: false
            }
         },

         $constructor: function () {
            var self = this;
            this._publish('onCancel', 'onApply');
            this._loadChildControls();

            if (this._options.displayAsEditor) {
               this.setInPlaceEditMode();
            } else {
               // всем EditAtPlace задаем свой обработчик клика
               this._iterateChildEditAtPlaces(function(child){
                  child._setClickHandler(function () {
                     self._clickHandler();
                  });
                  if ($(child._options.editorTpl).attr('data-component') == 'SBIS3.CONTROLS.TextArea'){
                     $(child._container.children()[0]).addClass('controls-EditAtPlace__textAreaWrapper');
                  }
                  child.subscribe('onTextChange', function(event, text){
                     self._forceClose = false;
                     if (text == child._oldText) {
                        self._forceClose = true;
                     }
                  });
               });
            }
         },

         _initializePicker: function(){
            var self = this;
            EditAtPlaceGroup.superclass._initializePicker.call(this);
            this._picker.subscribe('onClose', function(event){
               event.setResult(self._forceClose);
               if (!self._forceClose) {
                  self._moveToTop(true);
                  self._openConfirmDialog().addCallback(function (result) {
                     switch (result) {
                        case 'yesButton':
                           self._applyEdit();
                           break;
                        case 'noButton':
                           self._cancelEdit();
                           break;
                        default:
                           self._moveToTop(true);
                     }
                  });
               }
            });
         },

         showPicker: function(){
            EditAtPlaceGroup.superclass.showPicker.call(this);
            this._forceClose = true;
         },

         //FixMe Придрот для менеджера окон. Выпилить когда будет свой
         _moveToTop: function(adjust){
            if (this._picker.isVisible()) {
               var pos = Array.indexOf($ws.single.WindowManager._modalIndexes, this._picker._zIndex);
               $ws.single.WindowManager._modalIndexes.splice(pos, 1);
               pos = Array.indexOf($ws.single.WindowManager._visibleIndexes, this._picker._zIndex);
               $ws.single.WindowManager._visibleIndexes.splice(pos, 1);
               if (adjust) {
                  this._picker._zIndex = $ws.single.WindowManager.acquireZIndex(true);
                  this._picker._container.css('z-index', this._picker._zIndex);
                  $ws.single.WindowManager.setVisible(this._picker._zIndex);
                  $ws.single.ModalOverlay.adjust();
               }
            }
         },

         _setPickerContent: function () {
            var self = this;
            this._picker._container.addClass('controls-EditAtPlaceGroup__editorOverlay');
            this._picker._container.bind('keydown', function (e) {
               self._keyPressHandler(e);
            });
            this._picker._loadChildControls();

            this._iterateChildEditAtPlaces(function(child){
               child.setInPlaceEditMode(true);
            }, this._picker);
            this._addControlPanel(this._picker._container);
            this._picker._container.bind('mousedown', function(){
               self._moveToTop(true);
            });
         },

         _iterateChildEditAtPlaces: function(func, parent){
            var children;
            if (!parent){
               children = this.getChildControls();
            } else {
               children = parent.getChildControls();
            }
            for (var i = 0; i < children.length; i++) {
               if (children[i] instanceof EditAtPlace) {
                  func(children[i], i);
               }
            }
         },

         /**
          * Установить режим отображения
          * @param inPlace true - редактирвоание / false - отображение
          */
         setInPlaceEditMode: function (inPlace) {
            this._iterateChildEditAtPlaces(function(child){
               child.setInPlaceEditMode(inPlace);
            });
         },

         // Добавляем кнопки
         _addControlPanel: function (container) {
            this._cancelCross = $('<span class="controls-EditAtPlace__cancel"></span>');
            var self = this,
               $ok = $('<span class="controls-EditAtPlace__okButton"></span>'),
               $cntrlPanel = $('<span class="controls-EditAtPlaceGroup__controlPanel"></span>').append($ok).append(this._cancelCross);

            // Добавляем кнопки
            this._okButton = new IconButton({
               parent: self._picker,
               element: $ok,
               icon: 'sprite:icon-24 icon-Successful icon-done action-hover'
            });
            container.append($cntrlPanel);
            this._okButton.subscribe('onActivated', function () {
               self._applyEdit();
            });
            this._cancelCross.bind('mousedown', function () {
               self._cancelEdit();
            });
         },

         _cancelEdit: function () {
            if (this._options.editInPopup) {
               this._forceClose = true;
               this._picker.hide();
            } else {
               this._removeControlPanel();
               this.setInPlaceEditMode(false);
            }
            this._iterateChildEditAtPlaces(function (child) {
               child._setOldText();
            });
            this._notify('onCancel');
         },

         _applyEdit: function () {
            if (this.validate()) {
               if (this._options.editInPopup) {
                  this._forceClose = true;
                  this._picker.hide();
               } else {
                  this.setInPlaceEditMode(false);
                  this._removeControlPanel();
               }
               this._notify('onApply');
            }
            this._moveToTop(true);
         },

         _removeControlPanel: function(){
            this._cancelCross.parent().remove();
         },

         _setPickerConfig: function () {
            return {
               corner: 'tl',
               verticalAlign: {
                  side: 'top'
               },
               horizontalAlign: {
                  side: 'left'
               },
               closeByExternalClick: true,
               isModal: true,
               template: this._options.template
            };
         },

         _clickHandler: function () {
            this._iterateChildEditAtPlaces(function (child) {
               child._saveOldText();

            });
            if (this._options.editInPopup) {
               this.showPicker();
            } else {
               this.setInPlaceEditMode(true);
               this._addControlPanel(this._container);
            }
            $('.js-controls-TextBox__field', this._picker._container).get(0).focus();
         },

         _keyPressHandler: function (e) {
            switch (e.which) {
               case 13: {
                  this._applyEdit();
               }
                  break;
               case 27: {
                  this._cancelEdit();
                  e.stopPropagation();
               }
                  break;
               default:
                  break;
            }
         },

         /**
          * Открывает диалог подтверждения при отмене радактирования.
          * @returns {$ws.proto.Deferred} deferred на закрытие модального диалога подтверждения.
          * @private
          */
         _openConfirmDialog: function () {
            var result,
               deferred = new $ws.proto.Deferred();
            this._dialogConfirm = new Dialog({
               parent: this,
               opener: this,
               template: 'confirmRecordActionsDialog',
               resizable: false,
               handlers: {
                  onReady: function () {
                     var children = this.getChildControls(),
                        dialog = this,
                        onActivatedHandler = function () {
                           dialog.getLinkedContext().setValue('result', this.getName());
                           dialog.close();
                        };
                     for (var i = 0, len = children.length; i < len; i++) {
                        if (children[i].hasEvent('onActivated')) {
                           children[i].subscribe('onActivated', onActivatedHandler);
                        }
                     }
                  },
                  onKeyPressed: function (event, result) {
                     if (result.keyCode === $ws._const.key.esc) {
                        this.getLinkedContext().setValue('result', 'cancelButton');
                     }
                  },
                  onAfterClose: function () {
                     result = this.getLinkedContext().getValue('result');
                  },
                  onDestroy: function () {
                     deferred.callback(result);
                  }
               }
            });
            ControlHierarchyManager.setTopWindow(this._dialogConfirm);
            return deferred;
         },


         //*TODO переопределяем метод compoundControl - костыль*//*
         _loadControls: function (pdResult) {
            return pdResult.done([]);
         },

         /*TODO свой механизм загрузки дочерних контролов - костыль*/
         _loadChildControls: function () {
            var def = new $ws.proto.Deferred();
            var self = this;
            self._loadControlsBySelector(new $ws.proto.ParallelDeferred(), undefined, '[data-component]')
               .getResult().addCallback(function () {
                  def.callback();
               });
            return def;
         }
      });

      return EditAtPlaceGroup;
   });