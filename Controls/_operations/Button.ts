import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {IExpandableOptions, IExpandable} from 'Controls/interface';
import ButtonTemplate = require('wml!Controls/_operations/Button/Button');
import {default as Store} from 'Controls/Store';
import {DependencyTimer, isLeftMouseButton} from "Controls/Utils/FastOpen";
import {IoC} from 'Env/Env';
import {SyntheticEvent} from "Vdom/Vdom";

export interface IOperationsButtonOptions extends IControlOptions, IExpandableOptions {
}

/**
 * Контрол-кнопка, использующийся для показа и скрытия панели действий {@link Controls/operations:Panel}.
 * 
 * @remark
 * Полезные ссылки:
 * * <a href="/doc/platform/developmentapl/interface-development/controls/list-environment/operations/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_operations.less">переменные тем оформления</a>
 *
 * @class Controls/_operations/Button
 * @extends Core/Control
 * @implements Controls/_interface/IExpandable
 * @control
 * @author Авраменко А.С.
 * @public
 *
 */

/*
 * Control for changing the extensibility of the "Controls/_operations/Panel".
 * The detailed description and instructions on how to configure the control you can read <a href='https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/operations/'>here</a>.
 *
 * @class Controls/_operations/Button
 * @extends Core/Control
 * @implements Controls/_interface/IExpandable
 * @control
 * @author Авраменко А.С.
 * @public
 *
 */

export default class OperationsButton extends Control<IOperationsButtonOptions> implements IExpandable {
   '[Controls/_toggle/interface/IExpandable]': true;
   // TODO https://online.sbis.ru/opendoc.html?guid=0e449eff-bd1e-4b59-8a48-5038e45cab22
   protected _template: TemplateFunction = ButtonTemplate;
   protected _expanded: boolean = false;
   protected _expandedCallbackId: string;

   private _dependenciesTimer: DependencyTimer = null;
   private _loadOperationsPanelPromise: Promise<unknown> = null;

   protected _expandedChanged(value): void {
      if (this._expanded !== !!value) {
         this._expanded = !!value;
      }
   }
   protected _afterMount(options): void {
      if (options.useStore) {
         this._expandedCallbackId = Store.onPropertyChanged('operationsPanelExpanded',
             (expanded) => this._expandedChanged(expanded)
         );
      }
   }
   protected _beforeUnmount(): void {
      if (this._expandedCallbackId) {
         Store.unsubscribe(this._expandedCallbackId);
      }
   }
   protected _mouseDownHandler(event: SyntheticEvent<MouseEvent>): void {
      if (isLeftMouseButton(event)) {
         return;
      }
      if (!this._options.readOnly) {
         this._notify('expandedChanged', [!this._options.expanded]);
         if (this._options.useStore) {
            Store.dispatch('operationsPanelExpanded', !this._expanded);
         }
      }
   }
   protected _mouseEnterHandler(): void {
      if (!this._options.readOnly) {
         if (!this._dependenciesTimer) {
            this._dependenciesTimer = new DependencyTimer();
         }
         this._dependenciesTimer.start(this._loadDependencies);
      }
   }
   protected _mouseLeaveHandler(): void {
      this._dependenciesTimer?.stop();
   }
   private _loadDependencies(): Promise<unknown> {
      try {
         if (!this._loadOperationsPanelPromise) {
            this._loadOperationsPanelPromise = import('Controls/operationsPanel');
         }
         return this._loadOperationsPanelPromise;
      } catch (e) {
         IoC.resolve('ILogger').error('_operations:Button', e);
      }
   }

   static _theme: string[] = ['Controls/operations'];
}
