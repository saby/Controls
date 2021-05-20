import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import { SyntheticEvent } from 'UICommon/Events';
import {Model} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import {CrudWrapper} from 'Controls/dataSource';
import template = require('wml!Controls/_toggle/RadioGroup/RadioGroup');
import defaultItemTemplate = require('wml!Controls/_toggle/RadioGroup/resources/ItemTemplate');
import {ISource, ISourceOptions, ISingleSelectable, ISingleSelectableOptions} from 'Controls/interface';
import {IToggleGroup, IToggleGroupOptions} from './interface/IToggleGroup';
import 'css!Controls/toggle';
import 'css!Controls/CommonClasses';

export interface IRadioGroupOptions extends IControlOptions,
    ISingleSelectableOptions,
    ISourceOptions,
    IToggleGroupOptions {}

/**
 * Группа контролов, которые предоставляют пользователям возможность выбора между двумя или более параметрами.
 * 
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2Ftoggle%2FRadioGroup%2FIndex демо-пример}
 * * {@link https://github.com/saby/wasaby-controls/blob/69b02f939005820476d32a184ca50b72f9533076/Controls-default-theme/variables/_toggle.less переменные тем оформления}
 *
 * @class Controls/_toggle/RadioGroup
 * @extends UI/Base:Control
 * @mixes Controls/interface:ISource
 * @mixes Controls/interface:ISingleSelectable
 * @mixes Controls/interface:IValidationStatus
 * @implements Controls/toggle:IToggleGroup
 * 
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/toggle/RadioGroup/Base/Index
 */

/*
 * Controls are designed to give users a choice among two or more settings.
 *
 * <a href="/materials/Controls-demo/app/Controls-demo%2Ftoggle%2fRadioGroup%2fIndex">Demo-example</a>.
 *
 * @class Controls/_toggle/RadioGroup
 * @extends UI/Base:Control
 * @mixes Controls/interface:ISource
 * @mixes Controls/interface:ISingleSelectable
 * @implements Controls/toggle:IToggleGroup
 * 
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/toggle/RadioGroup/Base/Index
 */

class Radio extends Control<IRadioGroupOptions, RecordSet> implements ISource, ISingleSelectable, IToggleGroup {
   '[Controls/_interface/ISource]': boolean = true;
   '[Controls/_interface/ISingleSelectable]': boolean = true;
   '[Controls/_toggle/interface/IToggleGroup]': boolean = true;

   protected _template: TemplateFunction = template;
   protected _defaultItemTemplate: TemplateFunction = defaultItemTemplate;
   protected _items: RecordSet;
   protected _crudWrapper: CrudWrapper;

   protected _beforeMount(options: IRadioGroupOptions, context: object, receivedState: RecordSet): void|Promise<RecordSet> {
      if (receivedState) {
         this._items = receivedState;
      } else {
         return this._initItems(options).then((items: RecordSet) => {
            this._items = items;
            return items;
         });
      }
   }

   protected _beforeUpdate(newOptions: IRadioGroupOptions): Promise<void> {
      if (newOptions.source && newOptions.source !== this._options.source) {
         return this._initItems(newOptions).then((items: RecordSet) => {
            this._items = items;
            this._forceUpdate();
         });
      }
   }

   protected _selectKeyChanged(e: SyntheticEvent<MouseEvent | TouchEvent>, item: Model, keyProperty: string): void {
      if (!this._options.readOnly && item.get('readOnly') !== true) {
         this._notify('selectedKeyChanged', [item.get(keyProperty)]);
      }
   }

   private _initItems(options: IRadioGroupOptions): Promise<RecordSet> {
      this._crudWrapper = new CrudWrapper({
         source: options.source
      });
      return this._crudWrapper.query({}).then((items) => {
         return items;
      });
   }

   static getDefaultOptions(): object {
      return {
         direction: 'vertical',
         validationStatus: 'valid'
      };
   }
}

Object.defineProperty(Radio, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Radio.getDefaultOptions();
   }
});

export default Radio;

/**
 * @name Controls/_toggle/RadioGroup#direction
 * @cfg
 * @demo Controls-demo/toggle/RadioGroup/Direction/Index
 */