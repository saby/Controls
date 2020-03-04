/**
 * Created by dv.zuev on 17.01.2018.
 *
 * Вставляем в tmpl:
 * <Controls/event:Listener event="scroll" callback="myScrollCallback()" />
 */
import Control = require('Core/Control');
import template = require('wml!Controls/_event/Listener');
import entity = require('Types/entity');

/**
 * Позволяет реагировать на события родителя, использующего Controls.events:Register в своем шаблоне
 * @class Controls/_event/Register
 * @extends Core/Control
 * @control
 * @public
 * @author Белотелов Н.В.
 */

/**
 * @name Controls/_event/Register#event
 * @cfg {String} Имя событие, на которое нужно среагировать.
 */

/**
 * @name Controls/_event/Register#listenAll
 * @cfg {boolean} Нужно ли реагировать на события всех родительских контролов с Register в шаблоне,
 *  либо же только на события ближайшего такого контрола
 */

var EventListener = Control.extend({
   _template: template,
   _afterMount: function() {
      let config = {
         listenAll: !!this._options.listenAll
      };
      this._notify('register', [this._options.event, this, this.callback, config], {bubbling: true});
   },
   _beforeUnmount: function() {
      this._notify('unregister', [this._options.event, this], {bubbling: true});
   },
   callback: function() {
      this._notify(this._options.event, Array.prototype.slice.call(arguments));
   }
});

EventListener.getOptionTypes = function() {
   return {
      event: entity.descriptor(String).required(),
      listenAll: entity.descriptor(Boolean)
   };
};

export = EventListener;

