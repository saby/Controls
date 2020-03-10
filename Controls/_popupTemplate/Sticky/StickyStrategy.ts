/**
 * Created by as.krasilnikov on 21.03.2018.
 */
import TouchKeyboardHelper from 'Controls/Utils/TouchKeyboardHelper';
import cMerge = require('Core/core-merge');
import Env = require('Env/Env');

interface IPosition {
    left?: Number;
    right?: Number;
    top?: Number;
    bottom?: Number;
}
   const INVERTING_CONST = {
      top: 'bottom',
      bottom: 'top',
      left: 'right',
      right: 'left',
      center: 'center'
   };

   var _private = {
      getWindowSizes: function() {
         // Ширина берется по body специально. В случае, когда уменьшили окно браузера и появился горизонтальный скролл
         // надо правильно вычислить координату right. Для высоты аналогично.
         return {
            width: document.body.clientWidth,
            height: document.body.clientHeight - TouchKeyboardHelper.getKeyboardHeight(true)
         };
      },

      getMargins: function(popupCfg, direction) {
         return popupCfg.sizes.margins[direction === 'horizontal' ? 'left' : 'top'] + popupCfg.offset[direction];
      },

      getPosition: function(popupCfg, targetCoords, direction) {
         var position = {};
         var isHorizontal = direction === 'horizontal';
         if (popupCfg.direction[direction] === 'center') {
            position[isHorizontal ? 'left' : 'top'] = targetCoords[isHorizontal ? 'left' : 'top'] + targetCoords[isHorizontal ? 'width' : 'height'] / 2 - popupCfg.sizes[isHorizontal ? 'width' : 'height'] / 2 + _private.getMargins(popupCfg, direction) ;
         } else {
            if (popupCfg.direction[direction] === (isHorizontal ? 'left' : 'top')) {
               position[isHorizontal ? 'right' : 'bottom'] = _private.getWindowSizes()[isHorizontal ? 'width' : 'height'] -
                   _private.getTargetCoords(popupCfg, targetCoords, isHorizontal ? 'right' : 'bottom', direction) - _private.getMargins(popupCfg, direction);
            } else {
               position[isHorizontal ? 'left' : 'top'] = _private.getTargetCoords(popupCfg, targetCoords, isHorizontal ? 'left' : 'top', direction) + _private.getMargins(popupCfg, direction);
               if (_private.isIOS12()) {
                  position[isHorizontal ? 'left' : 'top'] += targetCoords[isHorizontal ? 'leftScroll' : 'topScroll'];
               }
            }
         }
         return position;
      },

      getTargetCoords: function(popupCfg, targetCoords, coord, direction) {
         if (popupCfg.targetPoint[direction] === 'center') {
            if (coord === 'right' || coord === 'left') {
               return targetCoords.left + targetCoords.width / 2;
            }
            if (coord === 'top' || coord === 'bottom') {
               return targetCoords.top + targetCoords.height / 2;
            }
         }
         return targetCoords[popupCfg.targetPoint[direction]];
      },

      checkOverflow: function(popupCfg, targetCoords, position, direction) {
         var isHorizontal = direction === 'horizontal';
         if (position.hasOwnProperty(isHorizontal ? 'right' : 'bottom')) {
            //TODO: will be fixed by https://online.sbis.ru/opendoc.html?guid=41b3a01c-72e1-418b-937f-ca795dacf508
            if (_private._isMobileIOS() && position[isHorizontal ? 'right' : 'bottom'] < 0) {
               return -(position[isHorizontal ? 'right' : 'bottom']);
            }
            return popupCfg.sizes[isHorizontal ? 'width' : 'height'] - (_private.getTargetCoords(popupCfg, targetCoords, isHorizontal ? 'right' : 'bottom', direction) - targetCoords[isHorizontal ? 'leftScroll' : 'topScroll']);
         }
         //TODO: will be fixed by https://online.sbis.ru/opendoc.html?guid=41b3a01c-72e1-418b-937f-ca795dacf508
         if (_private._isMobileIOS() && position[isHorizontal ? 'left' : 'top'] < 0) {
            return -(position[isHorizontal ? 'left' : 'top']);
         }
         let taskBarKeyboardIosHeight = 0;
         // Над клавой в ios может быть показана управляющая панель высотой 30px (задается в настройках ios).
         // У нас нет никакой инфы про ее наличие и/или высоту.
         // Единственное решение учитывать ее всегда и поднимать окно от низа экрана на 45px.
         // С проектированием решили увеличить до 45.
         if (!isHorizontal && TouchKeyboardHelper.isKeyboardVisible(true)) {
            taskBarKeyboardIosHeight = 45;
            if (_private.isIOS13()) {
               // На ios13 высота серой области на 5px больше
               taskBarKeyboardIosHeight += 5;
            }
         }
         let overflow = position[isHorizontal ? 'left' : 'top'] + taskBarKeyboardIosHeight + popupCfg.sizes[isHorizontal ? 'width' : 'height'] - _private.getWindowSizes()[isHorizontal ? 'width' : 'height'];
         if (!_private.isIOS13()) {
            overflow -= targetCoords[isHorizontal ? 'leftScroll' : 'topScroll'];
         }
         return overflow;
      },

      invertPosition: function(popupCfg, direction) {
         popupCfg.targetPoint[direction] = INVERTING_CONST[popupCfg.targetPoint[direction]];
         popupCfg.direction[direction] = INVERTING_CONST[popupCfg.direction[direction]];
         popupCfg.offset[direction] *= -1;
         popupCfg.sizes.margins[direction === 'horizontal' ? 'left' : 'top'] *= -1;
      },

      moveContainer: function(popupCfg, position: IPosition, sizeProperty: string, positionOverflow: number) {
         const positionProperty = Object.keys(position)[0];
         let overflow = positionOverflow;
         // Reset position and overflow, if the original position is outside of the window
         if (position[positionProperty] < 0) {
            position[positionProperty] = overflow = 0;
         }

         position[positionProperty] -= overflow;
         if (position[positionProperty] < 0) {
            _private.restrictContainer(position, sizeProperty, popupCfg, -position[positionProperty]);
            position[positionProperty] = 0;
         }
      },

      calculateFixedModePosition: function(popupCfg, property, targetCoords, position, positionOverflow) {
         _private.restrictContainer(position, property, popupCfg, positionOverflow);
         return position;
      },

      calculateOverflowModePosition: function(popupCfg, property, targetCoords, position, positionOverflow) {
         _private.moveContainer(popupCfg, position, property, positionOverflow);
         return position;
      },

       isNegativePosition(popupCfg: object, position: IPosition, targetCoords): Boolean {
           // The target side can be behind the visible area. In Ios it's happen, when page is zoomed.
           if (_private._isMobileIOS() && popupCfg.checkNegativePosition !== false) {
               // don't change original value
               let clonePosition = {...position};
               _private._fixBottomPositionForIos(clonePosition, targetCoords);    // Protection against incorrect page design
               // Protection against incorrect page design
               let minValue = -10;
               return clonePosition.left < minValue || clonePosition.right < minValue || clonePosition.top < minValue || clonePosition.bottom < minValue;
           }
           return false;
       },

       isIOS13() {
         return this._isMobileIOS() && Env.detection.IOSVersion > 12;
      },
      isIOS12() {
         return this._isMobileIOS() && Env.detection.IOSVersion === 12;
      },

       _isMobileIOS() {
          return Env.detection.isMobileIOS;
       },

      calculatePosition: function(popupCfg: Object, targetCoords: Object, direction: String): IPosition {
         let property = direction === 'horizontal' ? 'width' : 'height';
         let position = _private.getPosition(popupCfg, targetCoords, direction);
         let resultPosition = position;
         let positionOverflow = _private.checkOverflow(popupCfg, targetCoords, position, direction);
         let isNegativePos = _private.isNegativePosition(popupCfg, position, targetCoords);
         if (positionOverflow > 0 || isNegativePos) {
            if (popupCfg.fittingMode[direction] === 'fixed') {
               resultPosition = _private.calculateFixedModePosition(popupCfg, property, targetCoords, position, positionOverflow);
            } else if (popupCfg.fittingMode[direction] === 'overflow') {
               resultPosition = _private.calculateOverflowModePosition(popupCfg, property, targetCoords, position, positionOverflow);
            } else {
               _private.invertPosition(popupCfg, direction);
               let revertPosition = _private.getPosition(popupCfg, targetCoords, direction);
               let revertPositionOverflow = _private.checkOverflow(popupCfg, targetCoords, revertPosition, direction);
               let isNegativeRevertPosition = _private.isNegativePosition(popupCfg, revertPosition, targetCoords);
               if (revertPositionOverflow > 0 || isNegativeRevertPosition) {
                  if ((positionOverflow <= revertPositionOverflow) && !isNegativePos || isNegativeRevertPosition) {
                     _private.invertPosition(popupCfg, direction);
                     _private.restrictContainer(position, property, popupCfg, positionOverflow);
                     resultPosition = position;
                  } else {
                     _private.restrictContainer(revertPosition, property, popupCfg, revertPositionOverflow);
                     resultPosition = revertPosition;
                  }
               } else {
                  resultPosition = revertPosition;
               }
            }
         }
         _private.fixPosition(resultPosition, targetCoords);
         return resultPosition;
      },


      restrictContainer: function(position, property, popupCfg, overflow) {
         position[property] = popupCfg.sizes[property] - overflow;
      },

      fixPosition: function(position, targetCoords) {
         if (_private._isMobileIOS()) {
            _private._fixBottomPositionForIos(position, targetCoords);
         }
         if (position.bottom) {
            position.bottom = Math.max(position.bottom, 0);
         }
         if (position.top) {
            position.top = Math.max(position.top, 0);
         }
         if (position.left) {
            position.left = Math.max(position.left, 0);
         }
         if (position.right) {
            position.right = Math.max(position.right, 0);
         }
      },

      _fixBottomPositionForIos: function(position, targetCoords) {
         if (position.bottom) {
            let keyboardHeight = _private.getKeyboardHeight();
            position.bottom += keyboardHeight;

            // on newer versions of ios(12.1.3/12.1.4), in horizontal orientation sometimes(!) keyboard with the display
            // reduces screen height(as it should be). in this case, getKeyboardHeight returns height 0, and
            // additional offsets do not need to be considered. In other cases, it is necessary to take into account the height of the keyboard.
            // only for this case consider a scrollTop
            let win = _private.getWindow();
            if ((win.innerHeight + win.scrollY) > win.innerWidth) {
               // fix for positioning with keyboard on vertical ios orientation
               let dif = win.innerHeight - targetCoords.boundingClientRect.top;
               if (position.bottom > dif) {
                  position.bottom = dif;
               }
            } else if (keyboardHeight === 0) {
               position.bottom += _private.getTopScroll(targetCoords);
            }
         }
      },

      getKeyboardHeight: function() {
         return TouchKeyboardHelper.getKeyboardHeight(true);
      },

      getWindow: function() {
         return window;
      },

      getTopScroll: function(targetCoords) {
         // in portrait landscape sometimes(!) screen.availHeight < innerHeight =>
         // screen.availHeight / innerHeight < 2 incorrect. We expectation what availHeight > innerHeight always.
         if (_private.considerTopScroll()) {
            return targetCoords.topScroll;
         }
         return 0;
      },

      considerTopScroll() {
         return window && (window.screen.availHeight / window.innerHeight < 2) && (window.screen.availHeight > window.innerHeight);
      },

      setMaxSizes: function(popupCfg, position) {
         var windowSizes = _private.getWindowSizes();

         if (popupCfg.config.maxWidth) {
            position.maxWidth = Math.min(popupCfg.config.maxWidth, windowSizes.width);
         } else {
            position.maxWidth = windowSizes.width;
         }

         if (popupCfg.config.minWidth) {
            position.minWidth = popupCfg.config.minWidth;
         }

         if (popupCfg.config.maxHeight) {
            position.maxHeight = Math.min(popupCfg.config.maxHeight, windowSizes.height);
         } else {
            // На ios возвращается неверная высота страницы, из-за чего накладывая maxWidth === windowSizes.height
            // окно визуально обрезается. Делаю по body, у него высота правильная
            position.maxHeight = _private.getBodyHeight();
            // position.maxHeight = windowSizes.height;
         }

         if (popupCfg.config.minHeight) {
            position.minHeight = popupCfg.config.minHeight;
         }

         if (popupCfg.config.width) {
            position.width = popupCfg.config.width;
         }
         if (popupCfg.config.height) {
            position.height = popupCfg.config.height;
         }
      },

      getBodyHeight(): number {
         return document.body.clientHeight;
      }
   };

   export = {
      getPosition: function(popupCfg, targetCoords) {
         var position = {

            // position: 'fixed'
         };

         cMerge(position, _private.calculatePosition(popupCfg, targetCoords, 'horizontal'));
         cMerge(position, _private.calculatePosition(popupCfg, targetCoords, 'vertical'));
         _private.setMaxSizes(popupCfg, position);
         return position;
      },
      _private: _private
   };

