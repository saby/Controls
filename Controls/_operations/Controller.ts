import {Control, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_operations/Controller/Controller');
import tmplNotify = require('Controls/Utils/tmplNotify');

import { SyntheticEvent } from 'Vdom/Vdom';
import { TKeySelection as TKey } from 'Controls/interface';

/** 
 * Контрол используется для организации множественного выбора. 
 * Он обеспечивает связь между Controls/operationsPanel:Containter и {@link Controls/list:Containter}.
 * 
 * @remark
 * Полезные ссылки:
 * * <a href="/doc/platform/developmentapl/interface-development/controls/list-environment/operations/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_operations.less">переменные тем оформления</a>
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
   protected _isAllSelected: boolean = false;
   protected _listMarkedKey: TKey = null;
   protected _notifyHandler: Function = tmplNotify;
   protected _isOperationsPanelOpened: boolean = false;
   protected _savedListMarkedKey: TKey = null;

   protected _beforeMount() {
      this._itemOpenHandler = this._itemOpenHandler.bind(this);
   }

   protected _selectedTypeChangedHandler(event: SyntheticEvent<null>, typeName: string): void {
      if (typeName === 'all' || typeName === 'selected') {
         this._notify('selectionViewModeChanged', [typeName]);
      } else {
         this._children.registrator.start(typeName);
      }
   }

   protected _selectedKeysCountChanged(e, count: number|null, isAllSelected: boolean): void {
      e.stopPropagation();
      this._selectedKeysCount = count;
      this._isAllSelected = isAllSelected;

      // TODO: по этой задаче сделаю так, что опции selectedKeysCount вообще не будет: https://online.sbis.ru/opendoc.html?guid=d9b840ba-8c99-49a5-98d3-78715d10d540
   }

   protected _itemOpenHandler(newCurrentRoot: string|number|null, items, dataRoot = null): void {
      let root: string|number|null = 'root' in this._options ? this._options.root : null;

      if (newCurrentRoot !== root && this._options.selectionViewMode === 'selected') {
         this._notify('selectionViewModeChanged', ['all']);
      }

      if (this._options.itemOpenHandler instanceof Function) {
         return this._options.itemOpenHandler(newCurrentRoot, items, dataRoot);
      }
   }

   protected _listMarkedKeyChangedHandler(event: SyntheticEvent<null>, markedKey: TKey): void {
      this._setListMarkedKey(markedKey);
      this._notify('markedKeyChanged', [markedKey]);
   }

   protected _markedKeyChangedHandler(event: SyntheticEvent<null>): void {
      event.stopPropagation();
   }

   protected _operationsPanelOpen(): void {
      this._isOperationsPanelOpened = true;
      if (this._savedListMarkedKey) {
         this._setListMarkedKey(this._savedListMarkedKey);
      }
   }

   protected _operationsPanelClose(): void {
      this._isOperationsPanelOpened = false;
   }

   private _setListMarkedKey(key: TKey): void {
      if (this._isOperationsPanelOpened) {
         this._listMarkedKey = key;
         this._savedListMarkedKey = null;
      } else {
         this._savedListMarkedKey = key;
      }
   }
}
