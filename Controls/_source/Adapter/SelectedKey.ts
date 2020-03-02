import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import SelectedKeyAdapterTemplate = require('wml!Controls/_source/Adapter/SelectedKey/SelectedKey');
import {SyntheticEvent} from 'Vdom/Vdom';

export interface ISelectedKeyAdapterOptions extends IControlOptions {
   selectedKey?: number | string;
}

type TSelectedKeys = Array<string | number>;
/**
 * Контейнер для контролов, реализующих интерфейс {@link Controls/_interface/IMultiSelectable multiSelectable}.
 * Контейнер получает параметр selectedKey и передает selectedKeys дочерним контролам.
 * Получает результат дочернего события "selectedKeysChanged" и уведомляет о событии "selectedKeyChanged".
 * @class Controls/_source/Adapter/SelectedKey
 * @extends Controls/Control
 * @mixes Controls/_interface/ISingleSelectable
 * @control
 * @public
 * @author Золотова Э.Е.
 */

/*
 * Container for controls that implement interface {@link Controls/_interface/IMultiSelectable multiSelectable}.
 * Container receives selectedKey option and transfers selectedKeys option to children.
 * Listens for children "selectedKeysChanged" event and notify event "selectedKeyChanged".
 * @class Controls/_source/Adapter/SelectedKey
 * @extends Controls/Control
 * @mixes Controls/_interface/ISingleSelectable
 * @control
 * @public
 * @author Золотова Э.Е.
 */

class SelectedKeyAdapter extends Control<ISelectedKeyAdapterOptions> {
   protected _template: TemplateFunction = SelectedKeyAdapterTemplate;
   protected _selectedKeys: TSelectedKeys;

   private _getSelectedKeys(selectedKey: number | string): TSelectedKeys  {
      return (selectedKey === null || selectedKey === undefined) ? [] : [selectedKey];
   }

   protected _beforeMount(options: ISelectedKeyAdapterOptions): void {
      this._selectedKeys = this._getSelectedKeys(options.selectedKey);
   }

   protected _beforeUpdate(newOptions: ISelectedKeyAdapterOptions): void {
      if (this._options.selectedKey !== newOptions.selectedKey) {
         this._selectedKeys = this._getSelectedKeys(newOptions.selectedKey);
      }
   }

   protected _selectedKeysChanged(event: SyntheticEvent<Event>, keys: TSelectedKeys): Boolean|undefined  {
      event.stopPropagation();
      const selectedKey = keys.length ? keys[0] : null;
      return this._notify('selectedKeyChanged', [selectedKey]);
   }

}

export default SelectedKeyAdapter;
