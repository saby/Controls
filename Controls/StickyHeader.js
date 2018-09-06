define('Controls/StickyHeader',
   [
      'Core/Control',
      'Core/detection',
      'Controls/Utils/IntersectionObserver',
      'wml!Controls/StickyHeader/StickyHeader',

      'css!Controls/StickyHeader/StickyHeader'
   ],
   function(Control, detection, IntersectionObserver, template) {

      'use strict';

      var StickyHeader = Control.extend({
         _template: template,

         _shouldBeFixed: false,

         _isIntersecting: null,

         _isMobile: detection.isMobilePlatform,

         _beforeMount: function() {
            this._isIntersecting = {
               top: null,
               bottom: null
            };
            this._observeHandler = this._observeHandler.bind(this);
         },

         _afterMount: function() {
            var observer = new IntersectionObserver(this._observeHandler);

            observer.observe(this._children.observationTargetTop);
            observer.observe(this._children.observationTargetBottom);
         },

         _observeHandler: function(entries) {
            var self = this;
            var entryTop, entryBottom, isIntersectingTop, isIntersectingBottom, shouldBeFixed;

            entries.forEach(function(entry) {
               if (entry.target === self._children.observationTargetTop) {
                  entryTop = entry;
               }
               if (entry.target === self._children.observationTargetBottom) {
                  entryBottom = entry;
               }
            });

            if (entryTop) {
               isIntersectingTop = entryTop.isIntersecting;
               this._isIntersecting.top = entryTop.isIntersecting;
            } else {
               isIntersectingTop = this._isIntersecting.top;
            }

            if (entryBottom) {
               isIntersectingBottom = entryBottom.isIntersecting;
               this._isIntersecting.bottom = entryBottom.isIntersecting;
            } else {
               isIntersectingBottom = this._isIntersecting.bottom;
            }

            shouldBeFixed = isIntersectingBottom && !isIntersectingTop;

            if (shouldBeFixed !== this._shouldBeFixed) {
               this._notify('fixed', [shouldBeFixed, this._container.offsetHeight], {bubbling: true});
               this._shouldBeFixed = shouldBeFixed;
               this._forceUpdate();
            }
         },

         _listScrollHandler: function(e, eventType, args) {
            switch (eventType) {

               case 'listTop': this._listTop = true; break;

               case 'scrollMove':
                  this._listTop = args.position === 'up';

                  break;
               case 'canScroll':
                  this._scrolling = true;
                  break;
               case 'cantScroll':
                  this._scrolling = false;
                  break;
            }
         }
      });

      return StickyHeader;
   }
);
