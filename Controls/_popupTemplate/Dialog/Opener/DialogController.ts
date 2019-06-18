import BaseController = require('Controls/_popupTemplate/BaseController');
import DialogStrategy = require('Controls/_popupTemplate/Dialog/Opener/DialogStrategy');
      var _private = {
         prepareConfig: function(item, sizes) {
            // After popup will be transferred to the synchronous change of coordinates,
            // we need to return the calculation of the position with the keyboard.
            // Positioning relative to body
            item.position = DialogStrategy.getPosition(_private.getWindowSize(), sizes, item);
            _private.fixCompatiblePosition(item);
         },
         fixCompatiblePosition: function(cfg) {
            // COMPATIBLE: for old windows user can set the coordinates relative to the body
            if (!cfg.dragged) {
               if (cfg.popupOptions.top) {
                  cfg.position.top = cfg.popupOptions.top;
               }
               if (cfg.popupOptions.left) {
                  // Calculating the left position when reducing the size of the browser window
                  const differenceWindowWidth =
                      (cfg.popupOptions.left + cfg.popupOptions.width) - _private.getWindowSize().width;
                  if (differenceWindowWidth > 0) {
                     cfg.position.left = cfg.popupOptions.left - differenceWindowWidth;
                  } else {
                     cfg.position.left = cfg.popupOptions.left;
                  }
               }
            }
         },
         getWindowSize() {
            return {
               width: window.innerWidth,
               height: window.innerHeight,
               scrollTop: window.scrollY,
               scrollLeft: window.scrollX
            };
         }
      };

      /**
       * Dialog Popup Controller
       * @class Controls/_popupTemplate/Dialog/Opener/DialogController
       * @control
       * @private
       * @category Popup
       * @extends Controls/_popupTemplate/BaseController
       */
      var DialogController = BaseController.extend({
         elementCreated: function(cfg, container) {
            this.prepareConfig(cfg, container);
         },

         elementUpdated: function(cfg, container) {
            /* start: We remove the set values that affect the size and positioning to get the real size of the content */
            var width = container.style.width;
            var height = container.style.height;
            // We won't remove width and height, if they are set explicitly.
            if(!cfg.popupOptions.width) {
               container.style.width = 'auto';
            }
            if(!cfg.popupOptions.height) {
               container.style.height = 'auto';
            }
            if (cfg.popupOptions.maxWidth) {
               container.style.maxWidth = cfg.popupOptions.maxWidth + 'px';
            }
            if (cfg.popupOptions.maxHeight) {
               container.style.maxHeight = cfg.popupOptions.maxHeight + 'px';
            }

            /* end: We remove the set values that affect the size and positioning to get the real size of the content */
            this.prepareConfig(cfg, container);

            /* start: Return all values to the node. Need for vdom synchronizer */
            container.style.width = width;
            container.style.height = height;
            container.style.maxWidth = '';
            container.style.maxHeight = '';

            /* end: Return all values to the node. Need for vdom synchronizer */
         },

         getDefaultConfig: function(item) {
            // set sizes before positioning. Need for templates who calculate sizes relatively popup sizes
            var sizes = {
               width: 0,
               height: 0
            };
            _private.prepareConfig(item, sizes);
            item.position.top = -10000;
            item.position.left = -10000;
         },

         popupDragStart: function(item, container, offset) {
            if (!item.startPosition) {
               item.startPosition = {
                  left: item.position.left,
                  top: item.position.top
               };
            }
            item.dragged = true;
            item.position.left = item.startPosition.left + offset.x;
            item.position.top = item.startPosition.top + offset.y;

            // Take the size from cache, because they don't change when you move
            _private.prepareConfig(item, item.sizes);
         },

         popupDragEnd: function(item) {
            delete item.startPosition;
         },

         pageScrolled(): boolean {
            // Don't respond to page scrolling. The popup should remain where it originally positioned.
            return false;
         },

         prepareConfig: function(cfg, container) {
            var sizes = this._getPopupSizes(cfg, container);
            cfg.sizes = sizes;
            _private.prepareConfig(cfg, sizes);
         },

         needRecalcOnKeyboardShow: function() {
            return false;
         },
         _private: _private
      });
      export = new DialogController();

