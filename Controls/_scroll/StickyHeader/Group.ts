import Control = require('Core/Control');
import {isStickySupport, getNextId, getOffset} from 'Controls/_scroll/StickyHeader/Utils';
import template = require('wml!Controls/_scroll/StickyHeader/Group');



      /**
       * Allows you to combine sticky headers with the same behavior. It is necessary if you need to make
       * several headers fixed at the same level, which should simultaneously stick and stick out.
       * Behaves like one fixed header.
       *
       * @extends Core/Control
       * @class Controls/_scroll/StickyHeader/Group
       * @author Красильников А.С.
       * @public
       */

      /**
       * @name Controls/_scroll/StickyHeader/Group#content
       * @cfg {Function} Content in which several fixed headers are inserted.
       */

      /**
       * @event Controls/_scroll/StickyHeader/Group#fixed Change the fixation state.
       * @param {Vdom/Vdom:SyntheticEvent} event Event descriptor.
       * @param {Controls/_scroll/StickyHeader/Types/InformationFixationEvent.typedef} information Information about the fixation event.
       */

      var _private = {
         _notifyFixed: function(self, fixedHeaderData) {
            self._notify(
               'fixed',
               [{
                  id: self._index,
                  offsetHeight: fixedHeaderData.offsetHeight,
                  fixedPosition: fixedHeaderData.fixedPosition,
                  prevPosition: fixedHeaderData.prevPosition,
                  mode: fixedHeaderData.mode
               }],
               { bubbling: true }
            );
         }
      };

      var Component = Control.extend({

         _template: template,
         _index: null,
         _isStickySupport: null,

         _fixed: null,

         _stickyHeadersIds: null,
         _shadowVisible: false,

         _headers: null,
         _isRegistry: false,

         _beforeMount: function(options, context, receivedState) {
            this._isStickySupport = isStickySupport();
            this._index = getNextId();
            this._stickyHeadersIds = {
               top: [],
               bottom: []
            };
            this._headers = {};
         },

         _afterMount: function() {
            this._notify('register', ['updateStickyShadow', this, this._updateStickyShadow], {bubbling: true});
         },

         _beforeUnmount: function() {
            this._notify('unregister', ['updateStickyShadow', this], {bubbling: true});
         },

         getOffset: function(parentElement, position) {
            return getOffset(parentElement, this._container, position);
         },

         get height() {
            // Group can be with style display: content. Use the height of the first header as the height of the group.
            const headersIds = Object.keys(this._headers);
            return headersIds.length ? this._headers[headersIds[0]].inst.height : 0;
         },

         set top(value) {
            for (var id in this._headers) {
               this._headers[id].inst.top = value;
            }
            this._top = value;
         },
         set bottom(value) {
            for (var id in this._headers) {
               this._headers[id].inst.bottom = value;
            }
         },

         _fixedHandler: function(event, fixedHeaderData) {
            event.stopImmediatePropagation();
            if (!!fixedHeaderData.fixedPosition) {
               this._stickyHeadersIds[fixedHeaderData.fixedPosition].push(fixedHeaderData.id);
               if (this._shadowVisible === true) {
                  this._children.stickyHeaderShadow.start(this._stickyHeadersIds[fixedHeaderData.fixedPosition]);
               }
            } else if (!!fixedHeaderData.prevPosition && this._stickyHeadersIds[fixedHeaderData.prevPosition].indexOf(fixedHeaderData.id) > -1) {
               this._stickyHeadersIds[fixedHeaderData.prevPosition].splice(this._stickyHeadersIds[fixedHeaderData.prevPosition].indexOf(fixedHeaderData.id), 1);
            }

            if (!!fixedHeaderData.fixedPosition && !this._fixed) {
               this._fixed = true;
               _private._notifyFixed(this, fixedHeaderData);
            } else if (!fixedHeaderData.fixedPosition && this._fixed &&
                        this._stickyHeadersIds.top.length === 0 && this._stickyHeadersIds.bottom.length === 0) {
               this._fixed = false;
               _private._notifyFixed(this, fixedHeaderData);
            }
         },

         _updateStickyShadow: function(ids) {
            var shadowVisible = ids.indexOf(this._index) !== -1;
            if (this._shadowVisible !== shadowVisible) {
               this._shadowVisible = shadowVisible;
               if (shadowVisible) {
                  this._children.stickyHeaderShadow.start(this._stickyHeadersIds.top.concat(this._stickyHeadersIds.bottom));
               } else {
                  this._children.stickyHeaderShadow.start([]);
               }
            }
         },

         _stickyRegisterHandler: function(event, data, register) {
            event.stopImmediatePropagation();
            if (register) {
               if (this._top) {
                  data.inst.top = this._top;
               }
               this._headers[data.id] = data;

               // Register group after first header is registred
               if (!this._isRegistry) {
                  this._notify('stickyRegister', [{
                     id: this._index,
                     inst: this,
                     position: data.position,
                     mode: data.mode,
                  }, true], { bubbling: true });
                  this._isRegistry = true;
               }
            } else {
               delete this._headers[data.id];

               // Unregister group after last header is unregistred
               if (!Object.keys(this._headers).length) {
                  this._notify('stickyRegister', [{ id: this._index }, false], { bubbling: true });
                  this._isRegistry = false;
               }
            }
         }
      });

      Component._private = _private;

      export = Component;

