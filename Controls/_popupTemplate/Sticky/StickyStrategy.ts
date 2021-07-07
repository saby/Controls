/**
 * Created by as.krasilnikov on 21.03.2018.
 */
import * as cMerge from 'Core/core-merge';
import {detection, constants} from 'Env/Env';
import {IPopupPosition} from 'Controls/popup';
import {IStickyPositionConfig} from 'Controls/_popupTemplate/Sticky/StickyController';
import {ITargetCoords} from 'Controls/_popupTemplate/TargetCoords';

let TouchKeyboardHelper = {};

if (detection.isMobileIOS && detection.IOSVersion === 12) {
   import('Controls/Utils/TouchKeyboardHelper').then((module) => TouchKeyboardHelper = module.default);
}

type TDirection = 'vertical' | 'horizontal';
type TSizeProperty = 'width' | 'height';

interface IVisualViewport {
   height: number;
   offsetLeft: number;
   offsetTop: number;
   pageLeft: number;
   pageTop: number;
   width: number;
}

const INVERTING_CONST = {
   top: 'bottom',
   bottom: 'top',
   left: 'right',
   right: 'left',
   center: 'center'
};

export class StickyStrategy {
   getPosition(popupCfg: IStickyPositionConfig, targetCoords: ITargetCoords): IPopupPosition {
      const position = {
         // position: 'fixed'
      };
      this._prepareRestrictiveCoords(popupCfg, targetCoords);
      cMerge(position, this._calculatePosition(popupCfg, targetCoords, 'horizontal'));
      cMerge(position, this._calculatePosition(popupCfg, targetCoords, 'vertical'));
      this._setMaxSizes(popupCfg, position);
      this._resetMargins(position);
      return position;
   }

   private _calculatePosition(popupCfg: IStickyPositionConfig, targetCoords: ITargetCoords,
                              direction: TDirection): IPopupPosition {
      const property = direction === 'horizontal' ? 'width' : 'height';
      const position = this._getPosition(popupCfg, targetCoords, direction);
      let resultPosition = position;
      let positionOverflow = this._checkOverflow(popupCfg, targetCoords, position, direction);

      /*
         При масштабировании иногда браузер криво считает размеры контейнера,
         из-за чего возникают дробные размеры контейнеров > body,
         из-за которых позиционирование по какому-то краю приводит к overflow < 1px
       */
      if (positionOverflow >= 1) {
         if (popupCfg.fittingMode[direction] === 'fixed') {
            resultPosition = this._calculateFixedModePosition(popupCfg, property, targetCoords,
                                                              position, positionOverflow);
         } else if (popupCfg.fittingMode[direction] === 'overflow') {
            resultPosition = this._calculateOverflowModePosition(popupCfg, property, targetCoords,
                                                                 position, positionOverflow, direction);
         } else {
            this._invertPosition(popupCfg, direction);
            const revertPosition = this._getPosition(popupCfg, targetCoords, direction);
            let revertPositionOverflow = this._checkOverflow(popupCfg, targetCoords, revertPosition, direction);
            if (revertPositionOverflow > 0) {
               if ((positionOverflow <= revertPositionOverflow)) {
                  this._invertPosition(popupCfg, direction);
                  this._fixPosition(position, targetCoords);
                  positionOverflow = this._checkOverflow(popupCfg, targetCoords, position, direction);
                  if (positionOverflow > 0 ) {
                     this._restrictContainer(position, property, popupCfg, positionOverflow);
                  }
                  resultPosition = position;
               } else {
                  // Fix position and overflow, if the revert position is outside of the window,
                  // but it can be position in the visible area
                  this._fixPosition(revertPosition, targetCoords);
                  revertPositionOverflow = this._checkOverflow(popupCfg, targetCoords, revertPosition, direction);
                  if (revertPositionOverflow > 0 ) {
                     this._restrictContainer(revertPosition, property, popupCfg, revertPositionOverflow);
                  }
                  resultPosition = revertPosition;
               }
            } else {
               resultPosition = revertPosition;
            }
         }
      }
      this._fixPosition(resultPosition, targetCoords);
      this._calculateRestrictionContainerCoords(popupCfg, resultPosition);
      return resultPosition;
   }

   private _getPosition(popupCfg: IStickyPositionConfig, targetCoords: ITargetCoords, direction: TDirection): IPopupPosition {
      const position = {};
      const isHorizontal = direction === 'horizontal';
      if (popupCfg.direction[direction] === 'center') {
         const coord: string = isHorizontal ? 'left' : 'top';
         const targetCoord: number = targetCoords[coord];
         const targetSize: number = targetCoords[isHorizontal ? 'width' : 'height'];
         const popupSize: number = popupCfg.sizes[isHorizontal ? 'width' : 'height'];
         const margins: number = this._getMargins(popupCfg, direction);
         const middleCoef: number = 2;
         position[coord] = targetCoord + targetSize / middleCoef - popupSize / middleCoef + margins;
      } else {
         let coord: string = isHorizontal ? 'left' : 'top';
         if (popupCfg.direction[direction] === coord) {
            coord = isHorizontal ? 'right' : 'bottom';
            const viewportOffset: number = this._getVisualViewport()[isHorizontal ? 'offsetLeft' : 'offsetTop'];
            const viewportPage: number = this._getVisualViewport()[isHorizontal ? 'pageLeft' : 'pageTop'];
            const viewportSize: number = this._getVisualViewport()[isHorizontal ? 'width' : 'height'];
            const topSpacing: number = viewportSize + viewportPage + viewportOffset;
            const bottomSpacing: number = this._getBody()[isHorizontal ? 'width' : 'height'] - topSpacing;
            const targetCoord: number = this._getTargetCoords(popupCfg, targetCoords, coord, direction);
            const margins: number = this._getMargins(popupCfg, direction);
            position[coord] = bottomSpacing + (topSpacing - targetCoord) - margins;
         } else {
            const targetCoord: number = this._getTargetCoords(popupCfg, targetCoords, coord, direction);
            const margins: number = this._getMargins(popupCfg, direction);
            position[coord] = targetCoord + margins;

            if (this._isIOS12()) {
               position[isHorizontal ? 'left' : 'top'] += targetCoords[isHorizontal ? 'leftScroll' : 'topScroll'];
            }
         }
      }
      return position;
   }

   private _checkOverflow(popupCfg: IStickyPositionConfig, targetCoords: ITargetCoords, position: IPopupPosition, direction: TDirection): number {
      const isHorizontal = direction === 'horizontal';
      const popupDirection = popupCfg.direction[direction];
      const restrictiveContainerPosition = popupCfg.restrictiveContainerCoords;
      const restrictiveContainerCoord = restrictiveContainerPosition?.[popupDirection] || 0;

      if (position.hasOwnProperty(isHorizontal ? 'right' : 'bottom')) {
         if (position[isHorizontal ? 'right' : 'bottom'] < 0) {
            return -(position[isHorizontal ? 'right' : 'bottom']);
         }
         const targetCoord = this._getTargetCoords(
             popupCfg,
             targetCoords,
             isHorizontal ? 'right' : 'bottom', direction
         );
         return popupCfg.sizes[isHorizontal ? 'width' : 'height'] -
             (targetCoord - targetCoords[isHorizontal ? 'leftScroll' : 'topScroll']) +
             restrictiveContainerCoord;
      }
      if (position[isHorizontal ? 'left' : 'top'] < 0) {
         return -(position[isHorizontal ? 'left' : 'top']);
      }
      let taskBarKeyboardIosHeight = 0;
      // Над клавой в ios может быть показана управляющая панель высотой 30px (задается в настройках ios).
      // У нас нет никакой инфы про ее наличие и/или высоту.
      // Единственное решение учитывать ее всегда и поднимать окно от низа экрана на 45px.
      // С проектированием решили увеличить до 45.
      if (this._isIOS12()) {
         if (!isHorizontal && TouchKeyboardHelper.isKeyboardVisible(true)) {
            taskBarKeyboardIosHeight = 45;
            // if (this._isIOS13()) {
            //    // На ios13 высота серой области на 5px больше
            //    taskBarKeyboardIosHeight += 5;
            // }
         }
      }

      // При открытии клавиаутры происходит изменение размеров браузера по вертикали
      // Только в этом случае viewPortOffset находится вне windowSize, его нужно учитывать при подсчете размеров окна
      // Если контент страницы больше, чем боди, появляется нативный скролл,
      // В этом случае нужно учитывать viewPortPageTop
      const viewportOffset: number = isHorizontal ?
          0 : this._getVisualViewport().offsetTop || this._getVisualViewport().pageTop;

      const positionValue: number = position[isHorizontal ? 'left' : 'top'];
      const popupSize: number = popupCfg.sizes[isHorizontal ? 'width' : 'height'];
      const windowSize = this._getWindowSizes()[isHorizontal ? 'width' : 'height'];
      // Размер restrictiveContainer не больше размера экрана
      const containerSize: number = restrictiveContainerPosition ?
          Math.min(restrictiveContainerCoord, windowSize) : windowSize;
      let overflow = positionValue + taskBarKeyboardIosHeight + popupSize - containerSize - viewportOffset;
      if (this._isIOS12()) {
         overflow -= targetCoords[isHorizontal ? 'leftScroll' : 'topScroll'];
      }
      return overflow;
   }

   private _invertPosition(popupCfg: IStickyPositionConfig, direction: TDirection): void {
      popupCfg.targetPoint[direction] = INVERTING_CONST[popupCfg.targetPoint[direction]];
      popupCfg.direction[direction] = INVERTING_CONST[popupCfg.direction[direction]];
      popupCfg.offset[direction] *= -1;
      popupCfg.sizes.margins[direction === 'horizontal' ? 'left' : 'top'] *= -1;
   }

   private _moveContainer(popupCfg: IStickyPositionConfig, position: IPopupPosition,
                          sizeProperty: TSizeProperty, positionOverflow: number): void {
      const positionProperty = Object.keys(position)[0];
      let overflow = positionOverflow;
      // Reset position and overflow, if the original position is outside of the window
      if (position[positionProperty] < 0) {
         position[positionProperty] = overflow = 0;
      }

      position[positionProperty] -= overflow;
      if (position[positionProperty] < 0) {
         this._restrictContainer(position, sizeProperty, popupCfg, -position[positionProperty]);
         position[positionProperty] = 0;
      }
   }

   private _calculateFixedModePosition(popupCfg: IStickyPositionConfig, property: TSizeProperty, targetCoords: ITargetCoords,
                                       position: IPopupPosition, positionOverflow: number): IPopupPosition {
      this._restrictContainer(position, property, popupCfg, positionOverflow);
      return position;
   }

   private _calculateOverflowModePosition(popupCfg: IStickyPositionConfig, property, targetCoords: ITargetCoords,
                                          position: IPopupPosition, positionOverflow: number,
                                          direction: TDirection): IPopupPosition {
      this._moveContainer(popupCfg, position, property, positionOverflow);

      // Если после перепозиционирования попап всё равно не влезает, то уменьшаем ему высоту до высоты окна
      const popupSize = position[property] || popupCfg.sizes[property] || 0;
      const windowSize = this._getWindowSizes()[property];

      /*
         Фиксируем высоту, т.к. некоторые браузеры(ie) не могут понять высоту родителя без заданного height
         >= 0 из-за того, что висит max-height/max-width и в случае когда контейнер больше то у него размер
         будет равен размеру вью порта
       */
      if (popupSize >= windowSize) {
         position[property] = windowSize;
      }
      return position;
   }

   private _calculateRestrictionContainerCoords(popupCfg: IStickyPositionConfig, position: IPopupPosition): void {
      const coords = popupCfg.restrictiveContainerCoords;
      const height = position.height > 0 ? position.height : popupCfg.sizes?.height;
      const width = position.width || popupCfg.sizes?.width;
      const body = this._getBody();
      if (coords) {
         if (coords.top > position.top) {
            position.top = coords.top;
         }
         let dif = (position.bottom + height) - (body.height - coords.top);
         if (dif > 0) {
            position.bottom -= dif;
         } else if (position.top + height > coords.bottom) {
            // Не выше, чем верхняя граница restrictiveContainer'a
            position.top = Math.max(coords.bottom - height, coords.top);
         }

         if (coords.left > position.left) {
            position.left = coords.left;
         }
         dif = (position.right + width) - (body.width - coords.left);
         if (dif > 0) {
            position.right -= dif;
         } else if (position.left + width > coords.right) {
            // Не левее, чем левая граница restrictiveContainer'a
            position.left = Math.max(coords.right - width, coords.left);
         }
      }
   }

   private _restrictContainer(position: IPopupPosition, property: TSizeProperty,
                              popupCfg: IStickyPositionConfig, overflow: number): void {
      position[property] = popupCfg.sizes[property] - overflow;
   }

   private _getTargetCoords(popupCfg: IStickyPositionConfig, targetCoords: ITargetCoords,
                            coord: string, direction: TDirection): number {
      if (popupCfg.targetPoint[direction] === 'center') {
         if (coord === 'right' || coord === 'left') {
            return targetCoords.left + targetCoords.width / 2;
         }
         if (coord === 'top' || coord === 'bottom') {
            return targetCoords.top + targetCoords.height / 2;
         }
      }
      return targetCoords[popupCfg.targetPoint[direction]];
   }

   private _fixPosition(position: IPopupPosition, targetCoords: ITargetCoords): void {
      if (this._isMobileIOS()) {
         this._fixBottomPositionForIos(position, targetCoords);
      }
      const body = this._getBody();


      // Проблема: body не всегда прилегает к нижней границе окна браузера.
      // Если контент страницы больше высоты окна браузера, появляется скролл,
      // но body по высоте остается с размер экрана. Это приводит к тому, что при сколле страницы в самый низ,
      // низ боди и низ контента не будет совпадать. Т.к. окна находятся и позиционируются относительно боди
      // в этом случае позиция окна будет иметь отрицательную координату (ниже нижней границы боди).
      // В этом случае отключаю защиту от отрицательных координат.
      if (position.bottom && (this._isMobileDevices() || body.height === body.scrollHeight)) {
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
   }

   private _setMaxSizes(popupCfg: IStickyPositionConfig, position: IPopupPosition): void {
      const windowSizes = this._getWindowSizes();

      if (popupCfg.config.maxWidth) {
         position.maxWidth = Math.min(popupCfg.config.maxWidth, windowSizes.width);
      } else {
         let horizontalPadding = 0;
         if (popupCfg.fittingMode.horizontal !== 'overflow') {
            horizontalPadding = position.left || position.right || 0;
         }
         position.maxWidth = windowSizes.width - horizontalPadding;
      }

      if (popupCfg.config.minWidth) {
         position.minWidth = popupCfg.config.minWidth;
      }

      if (popupCfg.config.maxHeight) {
         position.maxHeight = Math.min(popupCfg.config.maxHeight, windowSizes.height);
      } else {
         // На ios возвращается неверная высота страницы, из-за чего накладывая maxWidth === windowSizes.height
         // окно визуально обрезается. Делаю по body, у него высота правильная
         let verticalPadding = 0;

         let verticalScroll;
         // Учитываем, какая часть страницы проскроллена снизу или сверху, в зависимости от точки позиционирования
         if (position.top) {
            verticalScroll = this._getVisualViewport().pageTop;
         } else {
            verticalScroll = this._getBody().height - this._getViewportHeight() -
                this._getVisualViewport().pageTop;
         }

         if (popupCfg.fittingMode.vertical !== 'overflow') {
            verticalPadding = position.top || position.bottom || 0;
         }
         position.maxHeight = this._getViewportHeight() - verticalPadding + verticalScroll;
      }
      if (popupCfg.restrictiveContainerCoords) {
         position.maxHeight -= popupCfg.restrictiveContainerCoords.top;
         if (popupCfg.sizes.height > position.maxHeight) {
            position.height = position.maxHeight;
         }
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
   }

   private _prepareRestrictiveCoords(popupCfg: IStickyPositionConfig, targetCoords: ITargetCoords): void {
      if (popupCfg.restrictiveContainerCoords) {
         // Полная проверка на 4 стороны позволит удалить calculateRestrictionContainerCoords
         if (popupCfg.restrictiveContainerCoords.top > targetCoords.top) {
            targetCoords.top = popupCfg.restrictiveContainerCoords.top;
         }
         if (popupCfg.restrictiveContainerCoords.bottom < targetCoords.bottom) {
            targetCoords.bottom = popupCfg.restrictiveContainerCoords.bottom;
         }
      }
   }

   private _resetMargins(position: IPopupPosition): void {
      // Сбрасываю все отступы, которые заданы на css. Они уже учтены в позиции
      position.margin = 0;
   }

   private _getKeyboardHeight(): number {
      return TouchKeyboardHelper.getKeyboardHeight(true);
   }

   private _getMargins(popupCfg: IStickyPositionConfig, direction: TDirection): number {
      return popupCfg.sizes.margins[direction === 'horizontal' ? 'left' : 'top'] + popupCfg.offset[direction];
   }

   private _getWindow(): Window {
      return window;
   }

   private _getTopScroll(targetCoords): number {
      // in portrait landscape sometimes(!) screen.availHeight < innerHeight =>
      // screen.availHeight / innerHeight < 2 incorrect. We expectation what availHeight > innerHeight always.
      if (this._considerTopScroll()) {
         return targetCoords.topScroll;
      }
      return 0;
   }

   private _considerTopScroll(): boolean {
      return constants.isBrowserPlatform &&
          (window.screen.availHeight / window.innerHeight < 2) &&
          (window.screen.availHeight > window.innerHeight);
   }

   private _getWindowSizes(): {width: number; height: number} {
      // Ширина берется по body специально. В случае, когда уменьшили окно браузера и появился горизонтальный скролл
      // надо правильно вычислить координату right. Для высоты аналогично.
      let height = this._getViewportHeight();
      if (this._isIOS12()) {
         height -= TouchKeyboardHelper.getKeyboardHeight(true);
      }
      return {
         width: document.body.clientWidth,
         height
      };
   }

   private _getBody(): object {
      return {
         height: document.body.clientHeight,
         scrollHeight: document.body.scrollHeight,
         width: document.body.clientWidth
      };
   }

   private _getViewportHeight(): number {
      if (window?.visualViewport) {
         return this._getVisualViewport().height;
      }
      return document.body.clientHeight;
   }

   private _getVisualViewport(): IVisualViewport {
      if (window?.visualViewport) {
         return window.visualViewport;
      }
      return {
         offsetLeft: 0,
         offsetTop: 0,
         pageLeft: constants.isBrowserPlatform && window.pageXOffset,
         pageTop: constants.isBrowserPlatform && window.pageYOffset,
         width: constants.isBrowserPlatform && document.body.clientWidth,
         height: constants.isBrowserPlatform && document.body.clientHeight
      };
   }

   private _isIOS13(): boolean {
      return this._isMobileIOS() && detection.IOSVersion > 12;
   }
   private _isIOS12(): boolean {
      return this._isMobileIOS() && detection.IOSVersion === 12;
   }

   private _isMobileIOS(): boolean {
      return detection.isMobileIOS;
   }

   private _isMobileDevices(): boolean {
      return detection.isMobileIOS || detection.isMobileAndroid;
   }

   private _isPortrait(): boolean {
      return TouchKeyboardHelper.isPortrait();
   }

   private _fixBottomPositionForIos(position: IPopupPosition, targetCoords: ITargetCoords): void {
      if (position.bottom) {
         if (this._isIOS12()) {
            const keyboardHeight = this._getKeyboardHeight();
            if (!this._isPortrait()) {
               position.bottom += keyboardHeight;
            }
         }
         // on newer versions of ios(12.1.3/12.1.4), in horizontal orientation sometimes(!) keyboard with the display
         // reduces screen height(as it should be). in this case, getKeyboardHeight returns height 0, and
         // additional offsets do not need to be considered. In other cases,t is necessary to take into account the
         // height of the keyboard. only for this case consider a scrollTop
         if (this._isIOS12()) {
            const win = this._getWindow();
            if ((win.innerHeight + win.scrollY) > win.innerWidth) {
               // fix for positioning with keyboard on vertical ios orientation
               const dif = win.innerHeight - targetCoords.boundingClientRect.top;
               if (position.bottom > dif) {
                  position.bottom = dif;
               }
            }
            // } else if (keyboardHeight === 0) {
            //    position.bottom += this._getTopScroll(targetCoords);
            // }
         }
      }
   }
}

export default new StickyStrategy();
