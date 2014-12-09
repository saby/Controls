/**
 * Created by iv.cheremushkin on 12.08.2014.
 */

define('js!SBIS3.CONTROLS._PopupMixin', ['js!SBIS3.CONTROLS.ControlHierarchyManager', 'js!SBIS3.CORE.ModalOverlay'], function (ControlHierarchyManager, ModalOverlay) {
   'use strict';
   if (typeof window !== 'undefined') {
      var eventsChannel = $ws.single.EventBus.channel('WindowChangeChannel');

      $(document).bind('mousedown', function (e) {
         eventsChannel.notify('onDocumentClick', e.target);
      });

      $(window).bind('scroll', function () {
         eventsChannel.notify('onWindowScroll');
      });

      $(window).bind('resize', function () {
         eventsChannel.notify('onWindowResize');
      });
   }

   /**
    * Миксин определяющий поведение контролов, которые отображаются с абсолютным позиционированием поверх всех остальных компонентов (диалоговые окна, плавающие панели, подсказки).
    * При подмешивании этого миксина в контрол, он вырезается из своего местоположения и вставляется в Body.
    * @mixin SBIS3.CONTROLS._PopupMixin
    */
   var _PopupMixin = /** @lends SBIS3.CONTROLS._PopupMixin.prototype */ {
      $protected: {
         _targetSizes: {},
         _containerSizes: {},
         _windowSizes: {},
         _isMovedH: false,
         _isMovedV: false,
         _defaultCorner: '',
         _defaultHorizontalAlignSide: '',
         _defaultVerticalAlignSide: '',
         _margins: null,
         _initOrigins: true,
         _marginsInited: false,
         _options: {
            /**
             * @typedef {Object} CornerEnum
             * @variant tl верхний левый
             * @variant tr верхний правый
             * @variant br нижний правый
             * @variant bl нижний левый
             */
            /**
             * @cfg {Object} От какого угла идет отсчет координат
             */
            corner: null,
            /**
             * @typedef {Object} VerticalAlignEnum
             * @variant top
             * @variant bottom
             */
            /**
             * @typedef {Object} verticalAlign
             * @property {VerticalAlignEnum} side Вертикальное выравнивание контрола
             * @property {Number} offset отступ в пикселях
             */
            /**
             * @cfg {verticalAlign} авторесайз по высоте, если текст не помещается
             */
            verticalAlign: {},
            /**
             * @typedef {Object} HorizontalAlignEnum
             * @variant right
             * @variant left
             */
            /**
             * @typedef {Object} HorizontalAlign
             * @property {HorizontalAlignEnum} side Вертикальное выравнивание контрола
             * @property {Number} offset отступ в пикселях
             */
            /**
             * @cfg {HorizontalAlign} авторесайз по высоте, если текст не помещается
             */
            horizontalAlign: {},
            /**
             * @cfg {String|jQuery|HTMLElement} элемент, относительно которого позиционируется всплывающее окно
             */
            target: undefined,
            /**
             * @cfg {Boolean} закрывать или нет при клике мимо
             */
            closeByExternalClick: false,
            /**
             * @cfg {Boolean} модальный или нет
             */
            isModal: false
         }
      },

      $constructor: function () {
         this._publish('onClose');
         var self = this;
         var container = this._container;
         var trg = $ws.helpers.trackElement(this._options.target, true);
         container.css({
            'position': 'absolute',
            'top': '-10000px',
            'left': '-10000px'
         });

         //TODO: Придрот
         container.addClass('ws-hidden');
         this._isVisible = false;
         /********************************/

         this._initOppositeCorners();
         //При ресайзе расчитываем размеры
         $ws.single.EventBus.channel('WindowChangeChannel').subscribe('onWindowResize', this._windowChangeHandler, this);

         //Скрываем попап если при скролле таргет скрылся
         $ws.single.EventBus.channel('WindowChangeChannel').subscribe('onWindowScroll', this._windowChangeHandler, this);

         if (this._options.closeByExternalClick) {
            $ws.single.EventBus.channel('WindowChangeChannel').subscribe('onDocumentClick', this._clickHandler, this);
         }

         container.appendTo('body');
         var zIndex = ControlHierarchyManager.zIndexManager.getNext();
         container.css('zIndex', zIndex);
         this._defaultCorner = this._options.corner;
         this._defaultVerticalAlignSide = this._options.verticalAlign.side;
         this._defaultHorizontalAlignSide = this._options.horizontalAlign.side;
         trg.subscribe('onMove', function () {
            if (self.isVisible()) {
               self.recalcPosition();
               self._checkTargetPosition();
            } else {
               self._initSizes();
            }
         });
      },

      recalcPosition: function () {
         //if (this._isVisible) {
            this._initSizes();
            var offset = {
                  top: this._targetSizes.offset.top,
                  left: this._targetSizes.offset.left
               },
               buff = this._getGeneralOffset(this._options.verticalAlign.side, this._options.horizontalAlign.side, this._options.corner);

            offset = this._addOffset(offset, buff);
            offset = this._getOffsetByWindowSize(offset);


            if (!this._isMovedV) {
               offset.top += this._margins.top - this._margins.bottom + (this._options.verticalAlign.offset || 0);
            } else {
               offset.top += -this._margins.top + this._margins.bottom - (this._options.verticalAlign.offset || 0);
            }
            if (!this._isMovedH){
               offset.left += this._margins.left - this._margins.right + (this._options.horizontalAlign.offset || 0) ;
            } else {
               offset.left += -this._margins.left + this._margins.right - (this._options.horizontalAlign.offset || 0) ;
            }

            offset.top = this._calculateOverflow(offset, 'vertical');
            offset.left = this._calculateOverflow(offset, 'horizontal');

            this._container.css({
               'top': offset.top + 'px',
               'left': offset.left + 'px'
            });
         //}
      },

      //Позиционируем относительно body
      _bodyPositioning: function () {
         var
            width = this._containerSizes.width,
            height = this._containerSizes.height,
            $body = $('body'),
            bodyHeight = $body.outerHeight(true),
            bodyWidth = $body.outerWidth(true),
            vAlign = this._defaultVerticalAlignSide,
            hAlign = this._defaultHorizontalAlignSide,
            offset = {
               top: this._options.verticalAlign.offset || 0,
               left: this._options.horizontalAlign.offset || 0
            };
         if (vAlign == 'bottom') {
            offset.top = bodyHeight - offset.top - height;
         }
         if (hAlign == 'right') {
            offset.left = bodyWidth - offset.left - width;
         }
         return offset;
      },

      _clickHandler: function (eventObject, target) {
         if (this.isVisible()) {
            var self = this,
               inTarget = [];
            if (self._options.target) {
               inTarget = !!self._options.target.find($(target)).length;
            }
            if (!inTarget && !ControlHierarchyManager.checkInclusion(self, target)) {
               self.hide();
            }
         }
      },

      _windowChangeHandler: function () {
         if (this.isVisible()) {
            this.recalcPosition();
         } else {
            this._initSizes();
         }
         this._checkTargetPosition();
      },

      _checkTargetPosition: function () {
         var self = this;
         if (this._options.target) {
            var winHeight = $(window).height(),
               top = this._options.target.offset().top - $(window).scrollTop() - winHeight - 3;
            if (top > 0 || -top > winHeight) {
               self.hide();
            }
         }
      },

      //Кэшируем размеры
      _initSizes: function () {
         var target = this._options.target,
            container = this._container;
         if (target) {
            this._targetSizes = {
               width: target.outerWidth(),
               height: target.outerHeight(),
               offset: target.offset(),
               border: (target.outerWidth() - target.innerWidth()) / 2,
               boundingClientRect: target.get(0).getBoundingClientRect()
            };
         }
         this._containerSizes.border = (container.outerWidth() - container.innerWidth()) / 2;
         var buff = this._getGeneralOffset(this._defaultVerticalAlignSide, this._defaultHorizontalAlignSide, this._defaultCorner, true);
         if (this._initOrigins) {
            this._containerSizes.originWidth = this._container.get(0).scrollWidth + this._containerSizes.border * 2;
            this._containerSizes.originHeight = this._container.get(0).scrollHeight + this._containerSizes.border * 2;
         }
         //Запоминаем координаты правого нижнего угла контейнера необходимые для отображения контейнера целиком и там где нужно.
         this._containerSizes.requredOffset = {
            top: buff.top + this._targetSizes.offset.top + this._containerSizes.originHeight + (this._options.verticalAlign.offset || 0),
            left: buff.left + this._targetSizes.offset.left + this._containerSizes.originWidth + (this._options.horizontalAlign.offset || 0)
         };
         this._containerSizes.width = this._containerSizes.originWidth;
         this._containerSizes.height = this._containerSizes.originHeight;
         this._containerSizes.boundingClientRect = container.get(0).getBoundingClientRect();
         this._initWindowSizes();
      },

      _initWindowSizes: function () {
         this._windowSizes = {
            height: this._container.offset().top - this._containerSizes.boundingClientRect.top + $(window).height(),
            width: this._container.offset().left - this._containerSizes.boundingClientRect.left + $(window).width()
         };
      },

      _initMargins: function () {
         var container = this._container;
         this._margins = {
            top: parseInt(container.css('margin-top'), 10) || 0,
            left: parseInt(container.css('margin-left'), 10) || 0,
            bottom: parseInt(container.css('margin-bottom'), 10) || 0,
            right: parseInt(container.css('margin-right'), 10) || 0
         };

      },

      //Вычисляем сдвиг в зависимости от угла
      _getOffsetByCorner: function (corner, notSave) {
         var border = this._targetSizes.border,
            height = this._targetSizes.height,
            width = this._targetSizes.width,
            offset = {
               top: 0,
               left: 0
            };

         switch (corner) {
            case 'tr':
               offset.left += width - border;
               offset.top -= border;
               break;
            case 'bl':
               offset.top += height;
               break;
            case 'br':
               offset.top += height;
               offset.left += width - border;
               break;
            case 'tl':
               offset.top -= border;
               break;
            default:
               throw new Error('PopupMixin: Параметр corner является обязательным');
         }
         if (!notSave) {
            this._options.corner = corner;
         }
         return offset;
      },

      _getOffsetBySide: function (vert, horiz, notSave) {
         var offset = {
            top: 0,
            left: 0
         };
         if (vert == 'bottom') {
            offset.top -= this._containerSizes.originHeight - this._targetSizes.border;
         }
         if (horiz == 'right') {
            offset.left -= this._containerSizes.originWidth - this._targetSizes.border;
         }
         if (!notSave) {
            this._options.horizontalAlign.side = horiz;
            this._options.verticalAlign.side = vert;
         }
         return offset;
      },

      _getGeneralOffset: function (vert, horiz, corner, notSave) {
         var offset = this._getOffsetByCorner(corner, notSave),
            buff = this._getOffsetBySide(vert, horiz, notSave);
         offset = this._addOffset(offset, buff);
         return offset;
      },

      _getOppositeOffset: function (corner, orientation) { // Получить offset при сдвиге в противоположный угол относительно corner по горизонтали или верткали 'horizontal'/'vertical'
         var side = (orientation == 'vertical') ? this._options.horizontalAlign.side : this._options.verticalAlign.side,
            offset,
            oppositeSide, oppositeCorner;

         oppositeCorner = this._getOppositeCorner(corner, side, orientation);
         if (orientation == 'vertical') {
            oppositeSide = (this._options.verticalAlign.side == 'top') ? 'bottom' : 'top';
            offset = this._getGeneralOffset(oppositeSide, this._options.horizontalAlign.side, oppositeCorner);
         } else {
            oppositeSide = (this._options.horizontalAlign.side == 'left') ? 'right' : 'left';
            offset = this._getGeneralOffset(this._options.verticalAlign.side, oppositeSide, oppositeCorner);
         }
         offset.top += (this._options.verticalAlign.offset || 0);
         offset.left += (this._options.horizontalAlign.offset || 0);
         return offset;
      },

      _initOppositeCorners: function () {
         this._oppositeCorners = {
            br: {
               horizontal: {
                  top: 'bl',
                  bottom: 'br'
               },
               vertical: {
                  left: 'br',
                  right: 'tr'
               }
            },
            tr: {
               horizontal: {
                  top: 'tr',
                  bottom: 'tl'
               },
               vertical: {
                  left: 'tr',
                  right: 'br'
               }
            },
            bl: {
               horizontal: {
                  top: 'br',
                  bottom: 'br'
               },
               vertical: {
                  left: 'tl',
                  right: 'bl'
               }
            },
            tl: {
               horizontal: {
                  top: 'tl',
                  bottom: 'tr'
               },
               vertical: {
                  left: 'bl',
                  right: 'tr'
               }
            }
         };
      },

      _getOppositeCorner: function (corner, side, orientation) {
         this._options.corner = this._oppositeCorners[corner][orientation][side];
         return this._options.corner;
      },

      _getOffsetByWindowSize: function (offset) {
         var buf = this._targetSizes.offset;
         //Проверяем убираемся ли в экран снизу
         if (offset.top + this._containerSizes.originHeight + (this._options.verticalAlign.offset || 0) >= this._windowSizes.height - 3 && !this._isMovedV) {
            this._isMovedV = true;
            offset.top = this._getOppositeOffset(this._options.corner, 'vertical').top;
            offset.top = this._addOffset(offset, buf).top;
         }

         //Возможно уже меняли положение и теперь хватает места что бы вернуться на нужную позицию по вертикали
         if (this._containerSizes.requredOffset.top < this._windowSizes.height - 3 && this._isMovedV) {
            this._isMovedV = false;
            offset.top = this._getOppositeOffset(this._options.corner, 'vertical').top;
            offset.top = this._addOffset(offset, buf).top;
         }

         //TODO Избавиться от дублирования
         //Проверяем убираемся ли в экран справа
         if (offset.left + this._containerSizes.originWidth + (this._options.horizontalAlign.offset || 0) >= this._windowSizes.width - 3 && !this._isMovedH) {
            this._isMovedH = true;
            offset.left = this._getOppositeOffset(this._options.corner, 'horizontal').left;
            offset.left = this._addOffset(offset, buf).left;
         }

         //Возможно уже меняли положение и теперь хватает места что бы вернуться на нужную позицию по горизонтали
         if (this._containerSizes.requredOffset.left < this._windowSizes.width - 3 && this._isMovedH) {
            this._isMovedH = false;
            offset.left = this._getOppositeOffset(this._options.corner, 'horizontal').left;
            offset.left = this._addOffset(offset, buf).left;
         }
         return offset;
      },

      _calculateOverflow: function (offset, orientation) {
         var spaces, oppositeOffset;
         spaces = this._getSpaces(this._options.corner);
         if (orientation == 'vertical') {
            if (offset.top < 0) {
               this._container.css('overflow-y', 'auto');
               oppositeOffset = this._getOppositeOffset(this._options.corner, orientation);
               if (spaces.top < spaces.bottom) {
                  spaces = this._getSpaces(this._options.corner);
                  this._container.css('height', spaces.bottom - (this._options.verticalAlign.offset || 0) - 3);
                  offset.top = this._targetSizes.offset.top + oppositeOffset.top;
               } else {
                  offset.top = 0;
                  this._container.css('height', spaces.top - (this._options.verticalAlign.offset || 0));
               }
               this._isMovedV = !this._isMovedV;
            }
            if (this._containerSizes.originHeight + (this._options.verticalAlign.offset || 0) < spaces.bottom) {
               this._container.css('overflow-y', 'visible');
               this._container.height(this._containerSizes.originHeight - this._containerSizes.border*2);
            }
            return offset.top;
         }

         else

         {
            if (offset.left < 0) {
               this._container.css('overflow-x', 'auto');
               spaces = this._getSpaces(this._options.corner);
               oppositeOffset = this._getOppositeOffset(this._options.corner, orientation);
               if (spaces.left < spaces.right) {
                  spaces = this._getSpaces(this._options.corner);
                  this._container.css('width', spaces.right - (this._options.horizontalAlign.offset || 0) - 3);
                  offset.left = this._targetSizes.offset.left + oppositeOffset.left;
               } else {
                  offset.left = 0;
                  this._container.css('width', spaces.left - (this._options.horizontalAlign.offset || 0));
               }
               this._isMovedH = !this._isMovedH;
            }
            if (this._containerSizes.originWidth + (this._options.horizontalAlign.offset || 0) < spaces.right) {
               this._container.css('overflow-x', 'visible');
               this._container.width(this._containerSizes.originWidth - this._containerSizes.border*2);
            }
            return offset.left;
         }
      },

      //Рассчитать расстояния от таргета до границ экрана с учетом собственного положения попапа
      //Нужно для расчета размеров если не влезаем в экран
      //TODO: Можно придумать алгоритм получше
      _getSpaces: function (corner) {
         var offset = this._targetSizes.offset,
            width = this._targetSizes.width,
            height = this._targetSizes.height,
            windowHeight = $(window).height(),
            windowWidth = $(window).width(),
            spaces = {
               top: 0,
               left: 0,
               bottom: 0,
               right: 0
            };

         switch (corner) {
            case 'br':
               spaces.left = offset.left + width;
               spaces.top = offset.top;
               break;
            case 'tr':
               spaces.left = offset.left + width;
               spaces.top = offset.top;
               break;
            case 'tl':
               spaces.left = offset.left;
               spaces.top = offset.top;
               break;
            case 'bl':
               spaces.left = offset.left;
               spaces.top = offset.top;
               break;
            default:
               return spaces;
         }

         if (corner == 'tl' || corner == 'tr') {
            spaces.bottom = windowHeight - spaces.top;
         } else {
            spaces.bottom = windowHeight - spaces.top - height;
         }

         if (corner == 'tr' || corner == 'br') {
            spaces.right = windowWidth - spaces.left;
         } else {
            spaces.right = windowWidth - spaces.left;
         }

         return spaces;
      },

      _addOffset: function (offset1, offset2) {
         var offset = {
            top: 0,
            left: 0
         };
         offset.top = offset1.top + offset2.top;
         offset.left = offset1.left + offset2.left;
         return offset;
      },

      after: {
         init: function(){
            ControlHierarchyManager.addNode(this, this.getParent());
         },

         show: function () {
            if (!this._marginsInited) {
               this._initMargins();
               this._container.css('margin', 0);
               this._marginsInited = true;
            }
            this._initSizes();
            if (this._initOrigins) {
               this._containerSizes.originWidth = this._container.get(0).scrollWidth + this._containerSizes.border * 2;
               this._containerSizes.originHeight = this._container.get(0).scrollHeight + this._containerSizes.border * 2;
               this._cssHeight = (this._container.css('height') == '0px') ? 'auto' : this._container.css('height');
               this._cssWidth = (this._container.css('width') == '0px') ? 'auto' : this._container.css('width');
               this._initOrigins = false;
            }
            this.recalcPosition();
         },

         hide: function(){
            var zIndex = this._container.css('zIndex');
            ControlHierarchyManager.zIndexManager.setFree(zIndex);
            // Убираем оверлей
            if (this._options.isModal) {
               var pos = Array.indexOf($ws.single.WindowManager._modalIndexes, zIndex);
               $ws.single.WindowManager._modalIndexes.splice(pos, 1);
               pos = Array.indexOf($ws.single.WindowManager._visibleIndexes, zIndex);
               $ws.single.WindowManager._visibleIndexes.splice(pos, 1);
               ModalOverlay.adjust();
            }
         }
      },

      before: {
         show: function () {
            this._container.css({
               left: '-10000px',
               top: '-10000px'
            });
            var zIndex = ControlHierarchyManager.zIndexManager.getNext();
            this._container.css('zIndex', zIndex);
            //Показываем оверлей
            if (this._options.isModal) {
               $ws.single.WindowManager._modalIndexes.push(zIndex);
               $ws.single.WindowManager._visibleIndexes.push(zIndex);
               ModalOverlay.adjust();
            }
         },
         destroy: function(){
            var zIndex = this._container.css('zIndex');
            ControlHierarchyManager.zIndexManager.setFree(zIndex);
            ControlHierarchyManager.removeNode(this);
            $ws.single.EventBus.channel('WindowChangeChannel').unsubscribe('onWindowResize', this._windowChangeHandler, this);
            $ws.single.EventBus.channel('WindowChangeChannel').unsubscribe('onWindowScroll', this._windowChangeHandler, this);
            $ws.single.EventBus.channel('WindowChangeChannel').unsubscribe('onDocumentClick', this._clickHandler, this);
         }
      },

      around: {
         hide: function (parentHide) {
            var
               self = this,
               result = this._notify('onClose');
            if (result instanceof $ws.proto.Deferred) {
               result.addCallback(function (res) {
                  if (res !== false) {
                     parentHide.call(self);
                  }
               });
            } else if (result !== false) {
               parentHide.call(this);
            }
         }
      }

   };

   return _PopupMixin;

});