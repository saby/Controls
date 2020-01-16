import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_operations/Controller/Controller');
import tmplNotify = require('Controls/Utils/tmplNotify');

import { SyntheticEvent } from 'Vdom/Vdom';
import { TKeySelection as TKey } from 'Controls/interface/';

/**
 * Контроллер для работы с множественным выбором.
 * Передает состояние массового выделения дочерним контролам.
 * Подробное описание и инструкцию по настройке читайте <a href='https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/operations/'>здесь</a>.
 *
 * @class Controls/_operations/Controller
 * @extends Core/Control
 * @mixes Controls/interface/IPromisedSelectable
 * @control
 * @author Авраменко А.С.
 * @public
 */

/*
 * Container for content that can work with multiselection.
 * Puts selection in child context.
 * The detailed description and instructions on how to configure the control you can read <a href='https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/operations/'>here</a>.
 *
 * @class Controls/_operations/Controller
 * @extends Core/Control
 * @mixes Controls/interface/IPromisedSelectable
 * @control
 * @author Авраменко А.С.
 * @public
 */

export default class MultiSelector extends Control {
   protected _template: TemplateFunction = template;
   protected _selectedKeysCount: number|null;
   protected _listMarkedKey: TKey = null;
   private _notifyHandler: Function = tmplNotify;

   protected _beforeMount() {
      this._itemOpenHandler = this._itemOpenHandler.bind(this);
   }

   protected _selectedTypeChangedHandler(event: SyntheticEvent<null>, typeName: string, limit: number): void {
      if (typeName === 'all' || typeName === 'selected') {
         this._notify('selectionViewModeChanged', [typeName]);
      } else {
         this._children.registrator.start(typeName, limit);
      }
   }

   protected _selectedKeysCountChanged(e, count: number|null): void {
      e.stopPropagation();
      this._selectedKeysCount = count;

      // TODO: по этой задаче сделаю так, что опции selectedKeysCount вообще не будет: https://online.sbis.ru/opendoc.html?guid=d9b840ba-8c99-49a5-98d3-78715d10d540
   }

   protected _itemOpenHandler(newCurrentRoot: string|number|null): void {
      let root: string|number|null = 'root' in this._options ? this._options.root : null;

      if (newCurrentRoot !== root && this._options.selectionViewMode === 'selected') {
         this._notify('selectionViewModeChanged', ['all']);
      }

      if (this._options.itemOpenHandler instanceof Function) {
         return this._options.itemOpenHandler(newCurrentRoot);
      }
   }

   protected _listMarkedKeyChangedHandler(event: SyntheticEvent<null>, markedKey: TKey): void {
      this._listMarkedKey = markedKey;
   }
}
