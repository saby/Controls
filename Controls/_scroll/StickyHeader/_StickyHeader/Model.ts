import {Logger} from 'UI/Utils';
import simpleExtend = require('Core/core-simpleExtend');
import {POSITION} from '../Utils';

/**
 * @extends Core/core-simpleExtend
 * @class Controls/_scroll/Model
 * @private
 */

/**
 * @typedef {Object} Intersection
 * @property {Boolean} top Determines whether the upper boundary of content is crossed.
 * @property {Boolean} bottom Determines whether the lower boundary of content is crossed.
 */

/**
 * typedef {String} TrackedTarget
 * @variant top Top target.
 * @variant bottom Bottom target.
 */

export = simpleExtend.extend({

   /**
    * @type {Intersection|null} Determines whether the boundaries of content crossed.
    * @private
    */
   _intersection: null,

   /**
    * type {String} Determines whether the content is fixed.
    * @private
    */
   _fixedPosition: '',

   get fixedPosition() {
      return this._fixedPosition;
   },

   /**
    * @param {Object} config
    * @param {Object} config.topTarget DOM element
    * @param {Object} config.bottomTarget DOM element
    * @param {String} config.position Sticky position
    */
   constructor: function(config) {
      this._intersection = {};
      this._topTarget = config.topTarget;
      this._bottomTarget = config.bottomTarget;
      this._position = config.position;
      this._updateStateIntersection = this._updateStateIntersection.bind(this);
   },

   update: function(entries) {
      entries.forEach(this._updateStateIntersection);

      this._fixedPosition = this._getFixedPosition();
   },

   destroy: function() {
      this._updateStateIntersection = undefined;
   },

   /**
    * @param {IntersectionObserverEntry} entry
    * @private
    */
   _updateStateIntersection: function(entry) {
      const position = this._getTarget(entry);
      this._intersection[position] =  entry.isIntersecting;
   },

   /**
    * Get the name of the intersection target.
    * @param {IntersectionObserverEntry} entry The intersection between the target element and its root container at a specific moment of transition.
    * @returns {TrackedTarget} The name of the intersection target.
    * @private
    */
   _getTarget: function(entry) {
      switch (entry.target) {
         case this._topTarget:
            return 'top';
         case this._bottomTarget:
            return 'bottom';
         default:
             Logger.error('Controls/_scroll/StickyHeader/Model: Unexpected target');
            return 'bottom';
      }
   },

   /**
    * Checks the content is fixed.
    * @returns {String} Determines whether the content is fixed.
    * @private
    */
   _getFixedPosition: function() {
      var result = '';

      if (this._position.indexOf('top') !== -1 && !this._intersection.top && this._intersection.bottom) {
         result = 'top';
      } else if (this._position.indexOf('bottom') !== -1 && !this._intersection.bottom && this._intersection.top) {
         result = 'bottom';
      }

      return result;
   }
});

