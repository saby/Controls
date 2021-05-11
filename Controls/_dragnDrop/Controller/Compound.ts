import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_dragnDrop/Controller/Compound/Compound';
import * as draggingTemplateWrapper from 'wml!Controls/_dragnDrop/DraggingTemplateWrapper';
import {Bus} from 'Env/Event';
import { SyntheticEvent } from 'UICommon/Events';

const ZINDEX_FOR_OLD_PAGE: number = 10000;

export default class Compound extends Control<IControlOptions> {
   protected _template: TemplateFunction = template;
   protected _draggingTemplate: Promise<TemplateFunction>;
   private _compoundHandlers: object;

   protected _onRegisterHandler(event, eventName, emitter, handler): void {
      if (['mousemove', 'touchmove', 'mouseup', 'touchend'].indexOf(eventName) !== -1) {
         if (handler) {
            this._compoundHandlers = this._compoundHandlers || {};
            this._compoundHandlers[eventName] = (event) => {
               handler.apply(emitter, [new SyntheticEvent(event)]);
            };
            document.body.addEventListener(eventName, this._compoundHandlers[eventName]);
         } else if (this._compoundHandlers && this._compoundHandlers[eventName]) {
            document.body.removeEventListener(eventName, this._compoundHandlers[eventName]);
            this._compoundHandlers[eventName] = null;
         }
      }
   }

   protected _updateDraggingTemplate(event, draggingTemplateOptions, draggingTemplate): void {
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

   protected _documentDragStart(): void {
      Bus.globalChannel().notify('_compoundDragStart');
   }

   protected _documentDragEnd(): void {
      this._removeDraggingTemplate();
      Bus.globalChannel().notify('_compoundDragEnd');
   }

   private _removeDraggingTemplate(): void {
      if (this._draggingTemplate) {
         this._draggingTemplate.then((draggingTemplate) => {
            draggingTemplate.remove();
            draggingTemplate = null;
         });
         this._draggingTemplate = null;
      }
   }

   private _updatePosition(draggingTemplateOptions): void {
      this._draggingTemplate.then((draggingTemplate) => {
         draggingTemplate.css({
            'top': draggingTemplateOptions.position.y + draggingTemplateOptions.draggingTemplateOffset,
            'left': draggingTemplateOptions.position.x + draggingTemplateOptions.draggingTemplateOffset
         });
      });
   }
}
