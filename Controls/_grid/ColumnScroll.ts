import Control = require('Core/Control');
import ColumnScrollTpl = require('wml!Controls/_grid/ColumnScroll');
import 'css!theme?Controls/grid';
import { detection } from 'Env/Env';
import Entity = require('Types/entity');
import {isEqualWithSkip} from 'Controls/_grid/utils/GridIsEqualUtil';
import {SyntheticEvent} from 'Vdom/Vdom';
import {debounce} from 'Types/function';
import {isFullGridSupport} from './utils/GridLayoutUtil';

import tmplNotify = require('Controls/Utils/tmplNotify');

const DELAY_UPDATE_SIZES = 16;

const
   _private = {
      calculateFixedColumnWidth(container, multiSelectVisibility, stickyColumnsCount, firstCell) {
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
         _private.setDispalyNoneForScroll(self._children.content);
         _private.drawTransform(self, 0);
         let
            newContentSize = self._children.content.getElementsByClassName('controls-Grid_columnScroll')[0].scrollWidth,
            newContentContainerSize = null;
         if (!isFullGridSupport()) {
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
         self._setOffsetForHScroll();
         self._contentSizeForHScroll = self._contentSize - self._leftOffsetForHScroll;
         _private.drawTransform(self, self._scrollPosition);
         // после расчетов убираем display: none
         _private.removeDisplayFromScroll(self._children.content);
      },
      updateFixedColumnWidth(self) {
         self._fixedColumnsWidth = _private.calculateFixedColumnWidth(
            self._children.content.getElementsByClassName('controls-Grid_columnScroll')[0],
            self._options.multiSelectVisibility,
            self._options.stickyColumnsCount,
            self._options.header[0]
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
      calculateShadowClasses(shadowState, position, theme) {
         let
            shadowClasses = 'controls-ColumnScroll__shadow_theme-' + theme;
         shadowClasses += ' controls-ColumnScroll__shadow-' + position + '_theme-' + theme;
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
      drawTransform (self, position) {
         // This is the fastest synchronization method scroll position and cell transform.
         // Scroll position synchronization via VDOM is much slower.
         const newHTML = '.' + self._transformSelector +
            ' .controls-Grid__cell_transform { transform: translateX(-' + position + 'px); }';
         if (self._children.contentStyle.innerHTML !== newHTML) {
            self._children.contentStyle.innerHTML = newHTML;
         }

      },
      setOffsetForHScroll (self) {
          const container = self._children.content;
          self._offsetForHScroll = 0;
          self._leftOffsetForHScroll = 0;
          const HeaderGroup = container.getElementsByClassName('controls-Grid__header')[0] && container.getElementsByClassName('controls-Grid__header')[0].childNodes;
          if (HeaderGroup && !!HeaderGroup.length) {
              const firstCell = HeaderGroup[0];
              if (self._fixedColumnsWidth) {
                  self._leftOffsetForHScroll = self._fixedColumnsWidth;
              } else if (self._options.multiSelectVisibility !== 'hidden') {
                  self._leftOffsetForHScroll = firstCell.offsetWidth + HeaderGroup[1].offsetWidth;
              } else {
                  self._leftOffsetForHScroll = firstCell.offsetWidth;
              }
              self._offsetForHScroll += firstCell.offsetHeight;
          }
          if (self._options.listModel.getResultsPosition() === 'top') {
              const ResultsContainer = container.getElementsByClassName('controls-Grid__results')[0] && container.getElementsByClassName('controls-Grid__results')[0].childNodes;
              if (ResultsContainer && !!ResultsContainer.length) {
                  self._offsetForHScroll += ResultsContainer[0].offsetHeight;
              }
          }
      },

      removeDisplayFromScroll: function(container) {
         const scroll = container.getElementsByClassName('controls-Grid_columnScroll_wrapper')[0];
         if (scroll) {
            scroll.style.removeProperty('display');
         }
      },

      setDispalyNoneForScroll: function(container) {
         const scroll = container.getElementsByClassName('controls-Grid_columnScroll_wrapper')[0];
         if (scroll) {
            scroll.style.display = 'none';
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
         * */
         if (
             !isEqualWithSkip(this._options.columns, oldOptions.columns, { template: true, resultTemplate: true })
             || this._options.multiSelectVisibility !== oldOptions.multiSelectVisibility
         ) {
            this._debouncedUpdateSizes(this);
         }
         if (this._options.stickyColumnsCount !== oldOptions.stickyColumnsCount) {
            _private.updateFixedColumnWidth(this);
            this._setOffsetForHScroll();
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

       _isDisplayColumnScroll: function() {
         const items = this._options.listModel.getItems();
         return items && !!items.getCount() && (this._contentSize > this._contentContainerSize) ? true : false;
      },

      _calculateShadowClasses(position) {
         return _private.calculateShadowClasses(this._shadowState, position, this._options.theme);
      },

      _calculateShadowStyles(position) {
         return _private.calculateShadowStyles(this, position);
      },

      _setOffsetForHScroll() {
         if (isFullGridSupport()) {
            _private.setOffsetForHScroll(this);
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

       _onKeyDown(e: SyntheticEvent<KeyboardEvent>): void {
           if (e.nativeEvent.keyCode !== 9 || !this._options.listModel.getEditingItemData() || !this._isDisplayColumnScroll()) {
               return;
           }
           const container = this._children.content;
           const startShadow = this._children.startShadow;
           // Подскролить к сфокусированному инпуту
           setTimeout((container, startShadow, shiftKey) => {
               const activeElement = document.activeElement;
               if (activeElement && activeElement.tagName === 'INPUT') {
                   const { right: activeElementRight, left: activeElementLeft  } = activeElement.getBoundingClientRect();
                   const { right: containerRight } = container.getBoundingClientRect();
                   const { left: startShadowLeft } = startShadow.getBoundingClientRect();
                   if (!shiftKey && activeElementRight > containerRight) {
                       this._setScrollPosition(this._scrollPosition + (activeElementRight - containerRight + (this._children.startShadow.offsetWidth || 0)));
                   } else if (shiftKey && startShadowLeft > activeElementLeft) {
                       this._setScrollPosition(this._scrollPosition - (startShadowLeft - activeElementLeft + (this._children.startShadow.offsetWidth || 0)));
                   }
               }
           }, 50, container, startShadow, e.nativeEvent.shiftKey);
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
       }
   });
ColumnScroll._private = _private;
export = ColumnScroll;
