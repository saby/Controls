import Control = require('Core/Control');
import ColumnScrollTpl = require('wml!Controls/_grid/resources/ColumnScroll/ColumnScroll');
import { detection } from 'Env/Env';
import Entity = require('Types/entity');
import {isEqualWithSkip} from 'Controls/_grid/utils/GridIsEqualUtil';
import {SyntheticEvent} from 'Vdom/Vdom';
import {debounce} from 'Types/function';
import {isFullGridSupport} from './utils/GridLayoutUtil';

import tmplNotify = require('Controls/Utils/tmplNotify');

interface IColumnScroll {
    _children: {
        content: HTMLElement
    };
}

const DELAY_UPDATE_SIZES = 16;

const
   _private = {
      calculateFixedColumnWidth(container, multiSelectVisibility, stickyColumnsCount) {
         if (!stickyColumnsCount) {
            return 0;
         }

         const hasMultiSelect = multiSelectVisibility !== 'hidden';
         const columnOffset = hasMultiSelect ? 1 : 0;
         const lastStickyColumnIndex = stickyColumnsCount + columnOffset;
         const lastStickyColumnSelector = `.controls-Grid__cell_fixed:nth-child(${lastStickyColumnIndex})`;
         const stickyCellContainer = container.querySelector(lastStickyColumnSelector);
         if (!stickyCellContainer) {
            return 0;
         }
         const stickyCellOffsetLeft = stickyCellContainer.getBoundingClientRect().left - container.getBoundingClientRect().left;
         return stickyCellOffsetLeft + stickyCellContainer.offsetWidth;
      },
      setBorderScrollPosition(self, newContentSize: number, newContentContainerSize: number): void {
          // if the table has increased and the scroll was at the end, it should stick at the end, with a new width.
          // Если при расширении таблицы, скрол находился в конце, он должен остаться в конце.
          if (self._contentSize !== 0 && self._scrollPosition !== 0 &&
              (self._scrollPosition ===  self._contentSize - self._contentContainerSize) &&
              newContentSize > self._contentSize) {
              self._scrollPosition = newContentSize - newContentContainerSize;
          }
      },
      updateSizes(self) {
          if (self._destroyed || !_private.isColumnScrollVisible(self._children.content)) {
              return;
          }
          // горизонтальный сколл имеет position: sticky и из-за особенностей grid-layout скрываем скролл (display: none), что-бы он не распирал таблицу при изменении ширины
          _private.toggleStickyElementsForScrollCalculation(self._children.content, false);
          _private.forceReflowForSafari(self._children.content);
         _private.drawTransform(self, 0);
         const isFullSupport = isFullGridSupport();
         let
            newContentSize = self._children.content.getElementsByClassName('controls-Grid_columnScroll')[0].scrollWidth,
            newContentContainerSize = null;
         if (!isFullSupport) {
            newContentContainerSize = self._children.content.offsetWidth;
         } else {
            newContentContainerSize = self._children.content.getElementsByClassName('controls-Grid_columnScroll')[0].offsetWidth;
         }

         if (self._contentSize !== newContentSize || self._contentContainerSize !== newContentContainerSize) {
            _private.setBorderScrollPosition(self, newContentSize, newContentContainerSize);
            self._contentSize = newContentSize;
            self._contentContainerSize = newContentContainerSize;

            // reset scroll position after resize, if we don't need scroll
            if (self._contentSize <= self._contentContainerSize) {
               self._scrollPosition = 0;
               _private.drawTransform(self, self._scrollPosition);
            }
            self._shadowState =
               _private.calculateShadowState(self._scrollPosition, self._contentContainerSize, self._contentSize);
            _private.updateFixedColumnWidth(self);
            self._forceUpdate();
         }
         if (newContentContainerSize + self._scrollPosition > newContentSize) {
            self._scrollPosition -= (newContentContainerSize + self._scrollPosition) - newContentSize;
         }
         self._contentSizeForHScroll = isFullSupport ? self._contentSize - self._fixedColumnsWidth : self._contentSize;
         _private.drawTransform(self, self._scrollPosition);
         // после расчетов убираем display: none
          _private.toggleStickyElementsForScrollCalculation(self._children.content, true);
      },
      updateFixedColumnWidth(self) {
         self._fixedColumnsWidth = _private.calculateFixedColumnWidth(
            self._children.content.getElementsByClassName('controls-Grid_columnScroll')[0],
            self._options.multiSelectVisibility,
            self._options.stickyColumnsCount,
         );
         self._scrollWidth = isFullGridSupport() ?
              self._children.content.offsetWidth - self._fixedColumnsWidth :
              self._children.content.offsetWidth;
      },
      calculateShadowState(scrollPosition, containerSize, contentSize) {
         let
            shadowState = '';

         if (scrollPosition > 0) {
            shadowState += 'start';
         }
         if (contentSize - containerSize - scrollPosition >= 1) {
            shadowState += 'end';
         }
         return shadowState;
      },
      isShadowVisible(shadowState, position) {
         return shadowState.indexOf(position) !== - 1;
      },
      calculateShadowClasses(shadowState: string, position: string, theme: string, backgroundStyle: string): string {
         let shadowClasses = `controls-ColumnScroll__shadow_theme-${theme}`
                            + ` controls-ColumnScroll__shadow-${position}_theme-${theme}`
                            + ` controls-horizontal-gradient-${backgroundStyle || 'default'}_theme-${theme}`;
         if (!_private.isShadowVisible(shadowState, position)) {
            shadowClasses += ' controls-ColumnScroll__shadow_invisible';
         }
         return shadowClasses;
      },
      calculateShadowStyles(self, position) {
         let
            shadowStyles = '';
         if (position === 'start' && _private.isShadowVisible(self._shadowState, position)) {
            shadowStyles = 'left: ' + self._fixedColumnsWidth + 'px;';
         }
         const container = self._container[0] || self._container;
         const emptyTemplate = container.getElementsByClassName('controls-BaseControl__emptyTemplate')[0];
         if (emptyTemplate) {
            shadowStyles += 'height: ' + emptyTemplate.offsetTop + 'px;';
         }
         return shadowStyles;
      },
       drawTransform(self, position): void {
           // This is the fastest synchronization method scroll position and cell transform.
           // Scroll position synchronization via VDOM is much slower.

           // Горизонтальный скролл передвигает всю таблицу, но компенсирует скролл для некоторых ячеек, например для
           // зафиксированных ячеек
           let newHTML =
               // Скроллируется таблица
               `.${self._transformSelector} .controls-Grid_columnScroll { transform: translateX(-${position}px); }` +

               // Не скроллируем зафиксированные колонки
               `.${self._transformSelector} .controls-Grid__cell_fixed { transform: translateX(${position}px); }` +

               // Не скроллируем скроллбар
               `.${self._transformSelector} .js-controls-Grid_columnScroll_thumb-wrapper { transform: translateX(${position}px); }` +

               // не скроллируем подвал таблицы
               `.${self._transformSelector} .controls-GridView__footer { transform: translateX(${position}px); }`;

           // Не скроллируем операции над записью
           if (isFullGridSupport()) {
               newHTML += `.${self._transformSelector} .controls-Grid__itemAction { transform: translateX(${position}px); }`;
           } else {
               const maxTranslate = self._contentSize - self._contentContainerSize;
               newHTML += ` .${self._transformSelector} .controls-Grid-table-layout__itemActions__container { transform: translateX(${position - maxTranslate}px); }`;
           }

           if (self._children.contentStyle.innerHTML !== newHTML) {
               self._children.contentStyle.innerHTML = newHTML;
           }

       },
       /**
        * Скрывает/показывает горизонтальный скролл и шапку таблицы (display: none),
        * чтобы, из-за особенностей sticky элементов, которые лежат внутри grid-layout,
        * они не распирали таблицу при изменении ширины.
        * @param {HTMLElement} container
        * @param {Boolean} visible Определяет, будут ли отображены sticky элементы
        */
      toggleStickyElementsForScrollCalculation(container: HTMLElement, visible: boolean): void {
          const stickyElements = container.querySelectorAll('.controls-Grid_columnScroll_wrapper');
          let stickyElement;

          for (let i = 0; i < stickyElements.length; i++) {
              stickyElement = stickyElements[i] as HTMLElement;
              if (visible) {
                  stickyElement.style.removeProperty('display');
              } else {
                  stickyElement.style.display = 'none';
              }
          }
      },

      forceReflowForSafari(container: HTMLElement): void {
          if (detection.safari) {
              const header = container.getElementsByClassName('controls-Grid__header')[0] as HTMLElement;

              if (header) {
                  header.style.display = 'none';
                  // tslint:disable-next-line:no-unused-expression
                  container.offsetWidth;
                  header.style.removeProperty('display');
              }
          }
      },

      prepareDebouncedUpdateSizes: function() {
          return debounce(_private.updateSizes, DELAY_UPDATE_SIZES, true);
      },

       isColumnScrollVisible(content: HTMLElement): boolean {
         return !!content.getClientRects().length;
      }

   },
   ColumnScroll = Control.extend({
      _template: ColumnScrollTpl,

      _notifyHandler: tmplNotify,
      _scrollPosition: 0,
      _contentSize: 0,
      _contentContainerSize: 0,
      _shadowState: '',
      _fixedColumnsWidth: 0,
      _transformSelector: '',
      _offsetForHScroll: 0,
      _leftOffsetForHScroll: 0,
      _contentSizeForHScroll: 0,
      _scrollWidth: 0,

      _beforeMount(opt) {
          /* В 19.710 сделаны правки по compound-слою, без которых событие resize не продывалось вообще.
             Зато теперь оно стреляет по 10-20 лишних раз отрисовку очередной страницы навигационной панели.
             По идее надо править на стороне compoundControl, но Шипин адски боится его трогать, да и не понимает, как
             это править на его стороне. По идее это даст профит и в остальных местах со скролом колонок.
             https://online.sbis.ru/opendoc.html?guid=43ba1e3f-1366-4b36-8713-5e8a30c7bc13 */
         this._debouncedUpdateSizes = _private.prepareDebouncedUpdateSizes();
         this._transformSelector = 'controls-ColumnScroll__transform-' + Entity.Guid.create();
         this._positionHandler = this._positionChangedHandler.bind(this);
      },

      _afterMount() {
         this._debouncedUpdateSizes(this);
         if (this._options.columnScrollStartPosition === 'end' && this._isDisplayColumnScroll()) {
            this._positionChangedHandler(null, this._contentSize - this._contentContainerSize);
         }
         if (!isFullGridSupport()) {
            this._contentSizeForHScroll = this._contentSize;
         }
      },

      _afterUpdate(oldOptions) {
         /*
         * TODO: Kingo
         * Смена колонок может не вызвать событие resize на обёртке грида(ColumnScroll), если общая ширина колонок до обновления и после одинакова.
         */
         if (
             !isEqualWithSkip(this._options.columns, oldOptions.columns, { template: true, resultTemplate: true })
             || this._options.multiSelectVisibility !== oldOptions.multiSelectVisibility
         ) {
            this._debouncedUpdateSizes(this);
         }
         if (this._options.stickyColumnsCount !== oldOptions.stickyColumnsCount) {
            _private.updateFixedColumnWidth(this);
         }
         if (oldOptions.root !== this._options.root) {
             this._contentSize = 0;
             this._contentContainerSize = 0;
         }
      },

      updateShadowStyle() {
          if (this._children.startShadow) {
              // устанавливаем style через setAttribute т.к объект el.style считается доступным только для чтения
              this._children.startShadow.setAttribute('style', _private.calculateShadowStyles(this, 'start'));
          }
      },

      _resizeHandler() {
          this._debouncedUpdateSizes(this);
      },

       /**
        * Определяет видимость горизонтального скроллбара.
        * @private
        */
       _isDisplayColumnScroll(): boolean {
         const items = this._options.listModel.getItems();
         return !!items && (!!items.getCount() || !!this._options.editingItemData) && (this._contentSize > this._contentContainerSize);
      },

      _calculateShadowClasses(position: string): string {
         return _private.calculateShadowClasses(this._shadowState, position, this._options.theme, this._options.backgroundStyle);
      },

      _calculateShadowStyles(position) {
         return _private.calculateShadowStyles(this, position);
      },

      _onFocusInEditingCell(e: SyntheticEvent<FocusEvent>): void {
           if (e.target.tagName !== 'INPUT' || !this._options.listModel.getEditingItemData() || !this._isDisplayColumnScroll()) {
               return;
           }
           const container = this._children.content;
           const startShadow = this._children.startShadow;
           const { right: activeElementRight, left: activeElementLeft  } = e.target.getBoundingClientRect();
           const { right: containerRight } = container.getBoundingClientRect();
           const { left: startShadowLeft } = startShadow.getBoundingClientRect();
           if (activeElementRight > containerRight) {
               this._setScrollPosition(this._scrollPosition + (activeElementRight - containerRight + (this._children.startShadow.offsetWidth || 0)));
           } else if (startShadowLeft > activeElementLeft) {
               this._setScrollPosition(this._scrollPosition - (startShadowLeft - activeElementLeft + (this._children.startShadow.offsetWidth || 0)));
           }
       },

      _setScrollPosition: function(position) {
          const
              newScrollPosition = Math.round(position);
          if (this._scrollPosition !== newScrollPosition) {
              this._scrollPosition = newScrollPosition;
              this._shadowState =
                  _private.calculateShadowState(this._scrollPosition, this._contentContainerSize, this._contentSize);

              _private.drawTransform(this, this._scrollPosition);
          }
      },

       _positionChangedHandler(event, position) {
           this._setScrollPosition(position);
       },
       getContentContainerSize() {
           return this._contentContainerSize;
       },

       _wheelHandler(e: SyntheticEvent<WheelEvent>): void {
           const nativeEvent = e.nativeEvent;
           const maxPosition = this._contentSize - this._contentContainerSize;
           let newPosition: number;
           let delta: number;
           if (nativeEvent.shiftKey || nativeEvent.deltaX) {
               e.stopPropagation();
               e.preventDefault();

               // deltaX определена, когда качаем колесом мыши
               if (nativeEvent.deltaX) {
                   delta = this._calcWheelDelta(detection.firefox, nativeEvent.deltaX);
               } else {
                   delta = this._calcWheelDelta(detection.firefox, nativeEvent.deltaY);
               }
               newPosition = this._calcPositionByWheel(this._scrollPosition, maxPosition, delta);
               this._setScrollPosition(newPosition);
           }
       },

       _calcPositionByWheel(currentPosition: number, maxPosition: number, wheelDelta: number): number {
           let newPosition: number;
           newPosition = currentPosition + wheelDelta;
           if (newPosition < 0) {
               newPosition = 0;
           } else if (newPosition > maxPosition) {
               newPosition = maxPosition;
           }

           return newPosition;
       },

       _calcWheelDelta(firefox: boolean, delta: number): number {
           /**
            * Определяем смещение ползунка.
            * В firefox в дескрипторе события в свойстве deltaY лежит маленькое значение,
            * поэтому установим его сами.
            * TODO: Нормальное значение есть в дескрипторе события MozMousePixelScroll в
            * свойстве detail, но на него нельзя подписаться.
            * https://online.sbis.ru/opendoc.html?guid=3e532f22-65a9-421b-ab0c-001e69d382c8
            */
           if (firefox) {
               return Math.sign(delta) * 100;
           }

           return delta;
       },

       _isDragScrollingEnabled(): boolean {
          const hasOption = typeof this._options.dragScrolling === 'boolean';
          const isDisplayColumnScroll = !!this._children.content && this._isDisplayColumnScroll();
          return isDisplayColumnScroll && (hasOption ? this._options.dragScrolling : !this._options.itemsDragNDrop);
       }
   });
ColumnScroll._theme = ['Controls/grid', 'Controls/Classes'];
ColumnScroll._private = _private;
export = ColumnScroll;
