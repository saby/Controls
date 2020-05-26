/**
 * Created by as.krasilnikov on 21.03.2018.
 */
import * as cMerge from 'Core/core-merge';
import {detection} from 'Env/Env';
let TouchKeyboardHelper = {};

if (detection.isMobileIOS && detection.IOSVersion === 12) {
   import('Controls/Utils/TouchKeyboardHelper').then((module) => TouchKeyboardHelper = module);
}

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
         let height = _private.getViewportHeight();
         if (_private.isIOS12()) {
            height -= TouchKeyboardHelper.getKeyboardHeight(true);
         }
         return {
            width: document.body.clientWidth,
            height
         };
      },

      getMargins: function(popupCfg, direction) {
         return popupCfg.sizes.margins[direction === 'horizontal' ? 'left' : 'top'] + popupCfg.offset[direction];
      },

      getPosition: function(popupCfg, targetCoords, direction) {
         const position = {};
         const isHorizontal = direction === 'horizontal';
         if (popupCfg.direction[direction] === 'center') {
            const coord: string = isHorizontal ? 'left' : 'top';
            const targetCoord: number = targetCoords[coord];
            const targetSize: number = targetCoords[isHorizontal ? 'width' : 'height'];
            const popupSize: number = popupCfg.sizes[isHorizontal ? 'width' : 'height'];
            const margins: number = _private.getMargins(popupCfg, direction);
            const middleCoef: number = 2;
            position[coord] = targetCoord + targetSize / middleCoef - popupSize / middleCoef + margins;
         } else {
            let coord: string = isHorizontal ? 'left' : 'top';
            if (popupCfg.direction[direction] === coord) {
               coord = isHorizontal ? 'right' : 'bottom';
               const viewportOffset: number = _private.getVisualViewport()[isHorizontal ? 'offsetLeft' : 'offsetTop'];
               const viewportPage: number = _private.getVisualViewport()[isHorizontal ? 'pageLeft' : 'pageTop'];
               const viewportSize: number = _private.getVisualViewport()[isHorizontal ? 'width' : 'height'];
               const topSpacing: number = viewportSize + viewportPage + viewportOffset;
               const bottomSpacing: number = _private.getBody()[isHorizontal ? 'width' : 'height'] - topSpacing;
               const targetCoord: number = _private.getTargetCoords(popupCfg, targetCoords, coord, direction);
               const margins: number = _private.getMargins(popupCfg, direction);
               position[coord] = bottomSpacing + (topSpacing - targetCoord) - margins;
            } else {
               const targetCoord: number = _private.getTargetCoords(popupCfg, targetCoords, coord, direction);
               const margins: number = _private.getMargins(popupCfg, direction);
               position[coord] = targetCoord + margins;

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
         if (_private.isIOS12()) {
            if (!isHorizontal && TouchKeyboardHelper.isKeyboardVisible(true)) {
               taskBarKeyboardIosHeight = 45;
               // if (_private.isIOS13()) {
               //    // На ios13 высота серой области на 5px больше
               //    taskBarKeyboardIosHeight += 5;
               // }
            }
         }
         const viewportOffset: number = _private.getVisualViewport()[isHorizontal ? 'offsetLeft' : 'offsetTop'];
         const viewportPage: number = _private.getVisualViewport()[isHorizontal ? 'pageLeft' : 'pageTop'];

         // viewportOffset и viewportPage показали одинаковое значение при показе клавиатуры, соответсвтенно по сути
         // размер с клавой учитывался 2 раза. Использую 1 значение, на всякий случай беру максимальное. теоретически
         // можно оптимизировать.
         const viewportSpacing = Math.max(viewportOffset, viewportPage);

         const positionValue: number = position[isHorizontal ? 'left' : 'top'];
         const popupSize: number = popupCfg.sizes[isHorizontal ? 'width' : 'height'];
         const windowSize: number = _private.getWindowSizes()[isHorizontal ? 'width' : 'height'];
         let overflow = positionValue + taskBarKeyboardIosHeight + popupSize - windowSize - viewportSpacing;
         if (_private.isIOS12()) {
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

      isIOS13() {
         return this._isMobileIOS() && detection.IOSVersion > 12;
      },
      isIOS12() {
         return this._isMobileIOS() && detection.IOSVersion === 12;
      },

       _isMobileIOS() {
          return detection.isMobileIOS;
       },

      calculatePosition: function(popupCfg: Object, targetCoords: Object, direction: String): IPosition {
         let property = direction === 'horizontal' ? 'width' : 'height';
         let position = _private.getPosition(popupCfg, targetCoords, direction);
         let resultPosition = position;
         let positionOverflow = _private.checkOverflow(popupCfg, targetCoords, position, direction);
         if (positionOverflow > 0) {
            if (popupCfg.fittingMode[direction] === 'fixed') {
               resultPosition = _private.calculateFixedModePosition(popupCfg, property, targetCoords, position, positionOverflow);
            } else if (popupCfg.fittingMode[direction] === 'overflow') {
               resultPosition = _private.calculateOverflowModePosition(popupCfg, property, targetCoords, position, positionOverflow);
            } else {
               _private.invertPosition(popupCfg, direction);
               let revertPosition = _private.getPosition(popupCfg, targetCoords, direction);
               let revertPositionOverflow = _private.checkOverflow(popupCfg, targetCoords, revertPosition, direction);
               if (revertPositionOverflow > 0) {
                  if ((positionOverflow <= revertPositionOverflow)) {
                     _private.invertPosition(popupCfg, direction);
                     _private.restrictContainer(position, property, popupCfg, positionOverflow);
                     resultPosition = position;
                  } else {
                     //Fix position and overflow, if the revert position is outside of the window, but it can be position in the visible area
                     _private.fixPosition(revertPosition, targetCoords);
                     revertPositionOverflow = _private.checkOverflow(popupCfg, targetCoords, revertPosition, direction);
                     if (revertPositionOverflow > 0 ) {
                        _private.restrictContainer(revertPosition, property, popupCfg, revertPositionOverflow);
                     }
                     resultPosition = revertPosition;
                  }
               } else {
                  resultPosition = revertPosition;
               }
            }
         }
         _private.fixPosition(resultPosition, targetCoords);
         _private.calculateRestrictionContainerCoords(popupCfg, position);
         return resultPosition;
      },


      restrictContainer: function(position, property, popupCfg, overflow) {
         position[property] = popupCfg.sizes[property] - overflow;
      },

      fixPosition: function(position, targetCoords) {
         if (_private._isMobileIOS()) {
            _private._fixBottomPositionForIos(position, targetCoords);
         }
         const body = _private.getBody();


         // Проблема: body не всегда прилегает к нижней границе окна браузера.
         // Если контент страницы больше высоты окна браузера, появляется скролл,
         // но body по высоте остается с размер экрана. Это приводит к тому, что при сколле страницы в самый низ,
         // низ боди и низ контента не будет совпадать. Т.к. окна находятся и позиционируются относительно боди
         // в этом случае позиция окна будет иметь отрицательную координату (ниже нижней границы боди).
         // В этом случае отключаю защиту от отрицательных координат.
         if (position.bottom && (_private._isMobileIOS() || body.height === body.scrollHeight)) {
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

      calculateRestrictionContainerCoords(popupCfg, position): void {
         const coords = popupCfg.restrictiveContainerCoords;
         const height = position.height || popupCfg.sizes?.height;
         const width = position.width || popupCfg.sizes?.width;
         const body = _private.getBody();
         if (coords) {
            let dif = (position.bottom + height) - (body.clientHeight - coords.top);
            if (dif > 0) {
               position.bottom -= dif;
            } else if (position.top + height > coords.bottom) {
               position.top = coords.bottom - height;
            }

            dif = (position.right + width) - (body.clientWidth - coords.left);
            if (dif > 0) {
               position.right -= dif;
            } else if (position.left + width > coords.right) {
               position.left = coords.right - width;
            }
         }
      },

      _fixBottomPositionForIos: function(position, targetCoords) {
         if (position.bottom) {
            if (_private.isIOS12()) {
               const keyboardHeight = _private.getKeyboardHeight();
               if (!_private.isPortrait()) {
                  position.bottom += keyboardHeight;
               }
            }
            // on newer versions of ios(12.1.3/12.1.4), in horizontal orientation sometimes(!) keyboard with the display
            // reduces screen height(as it should be). in this case, getKeyboardHeight returns height 0, and
            // additional offsets do not need to be considered. In other cases, it is necessary to take into account the height of the keyboard.
            // only for this case consider a scrollTop
            if (_private.isIOS12()) {
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
         }
      },

      isPortrait: function() {
         return TouchKeyboardHelper.isPortrait();
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
            position.maxHeight = _private.getViewportHeight();
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

      getBody(): object {
         return {
            height: document.body.clientHeight,
            scrollHeight: document.body.scrollHeight,
            width: document.body.clientWidth
         };
      },

      getViewportHeight(): number {
          if (window?.visualViewport) {
              return _private.getVisualViewport().height;
          }
          return document.body.clientHeight;
      },

      getVisualViewport(): object {
         if (window?.visualViewport) {
            return window.visualViewport;
         }
         return {
            offsetLeft: 0,
            offsetTop: 0,
            pageLeft: 0,
            pageTop: 0,
            width: document && document.body.clientWidth,
            height: document && document.body.clientHeight
         };
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

