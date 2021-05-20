import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_masterDetail/List/List';
import { SyntheticEvent } from 'UICommon/Events';

/**
 * Контрол используют в качестве контейнера для списочного контрола, который добавлен в шаблон {@link Controls/masterDetail:Base#master master}.
 * Он обеспечивает передачу текущей отмеченной записи в списке между списком и master'ом через всплывающее событие selectedMasterValueChanged.
 * @class Controls/_masterDetail/List
 * @extends UI/Base:Control
 * @public
 * @author Авраменко А.С.
 * @demo Controls-demo/MasterDetail/Demo
 */

export default class List extends Control<IControlOptions> {
   protected _template: TemplateFunction = template;

   protected _markedKeyChangedHandler(event: SyntheticEvent<Event>, key: string): void {
      this._notify('selectedMasterValueChanged', [key], {bubbling: true});
   }
}

/**
 * @event Происходит при смене выбранной записи.
 * @name Controls/_masterDetail/List#selectedMasterValueChanged
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Number} key Ключ выбранного элемента.
 */
