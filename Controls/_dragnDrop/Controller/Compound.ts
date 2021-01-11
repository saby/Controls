import {Bus} from 'Env/Event';
import {Control} from 'UI/Base';
import template = require('wml!Controls/_dragnDrop/Controller/Compound/Compound');
import draggingTemplateWrapper = require('wml!Controls/_dragnDrop/DraggingTemplateWrapper');
import { SyntheticEvent } from 'Vdom/Vdom';
      var ZINDEX_FOR_OLD_PAGE = 10000;

      export = Control.extend({
         _template: template,
         _draggingTemplate: null,

         _onRegisterHandler: function(event, eventName, emitter, handler) {
            if (['mousemove', 'touchmove', 'mouseup', 'touchend'].indexOf(eventName) !== -1) {
               if (handler) {
                  this._compoundHandlers = this._compoundHandlers || {};
                  this._compoundHandlers[eventName] = function(event) {
                     handler.apply(emitter, [new SyntheticEvent(event)]);
                  };
                  document.body.addEventListener(eventName, this._compoundHandlers[eventName]);
               } else if (this._compoundHandlers && this._compoundHandlers[eventName]) {
                  document.body.removeEventListener(eventName, this._compoundHandlers[eventName]);
                  this._compoundHandlers[eventName] = null;
               }
            }
         },

         _removeDraggingTemplate: function() {
            if (this._draggingTemplate) {
               this._draggingTemplate.then((draggingTemplate) => {
                  draggingTemplate.remove();
                  draggingTemplate = null;
               });
               this._draggingTemplate = null;
            }
         },

         _documentDragStart: function() {
            Bus.globalChannel().notify('_compoundDragStart');
         },

         _documentDragEnd: function() {
            this._removeDraggingTemplate();
            Bus.globalChannel().notify('_compoundDragEnd');
         },

         _updatePosition: function(draggingTemplateOptions) {
            this._draggingTemplate.then((draggingTemplate) => {
               draggingTemplate.css({
                  'top': draggingTemplateOptions.position.y + draggingTemplateOptions.draggingTemplateOffset,
                  'left': draggingTemplateOptions.position.x + draggingTemplateOptions.draggingTemplateOffset
               });
            });
         },

         _updateDraggingTemplate: function(event, draggingTemplateOptions, draggingTemplate) {
            //На старых страницах нет application, который отвечает за создание и позиционирование draggingTemplate.
            //Поэтому сами создади его и добавим в body.
            if (draggingTemplate) {
               //Оборачиваем построение шаблона в Promise для унификации синхронных и асинхронных шаблонов.
               if (!this._draggingTemplate) {
                  this._draggingTemplate = Promise.resolve(draggingTemplateWrapper({
                     draggingTemplateOptions: draggingTemplateOptions,
                     draggingTemplate: draggingTemplate
                  })).then((result) => {
                     const draggingTemplate = $(result);
                     draggingTemplate.appendTo(document.body);

                     //На старых страницах стартовый z-index всплывающих окон 1050. Сделаем наш z-index заведомо больше.
                     draggingTemplate.css('z-index', ZINDEX_FOR_OLD_PAGE);
                     return draggingTemplate;
                  });
               } else {
                  this._updatePosition(draggingTemplateOptions);
               }
            } else {
               this._removeDraggingTemplate();
            }
         }
      });

