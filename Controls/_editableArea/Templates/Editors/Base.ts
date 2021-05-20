import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_editableArea/Templates/Editors/Base/Base');
import { SyntheticEvent } from 'UICommon/Events';
import {
    IFontColorStyleOptions, IFontColorStyle,
    IFontWeightOptions, IFontWeight,
    IFontSizeOptions, IFontSize,
    IHeightOptions, IHeight
} from 'Controls/interface';

import 'css!Controls/CommonClasses';
import 'css!Controls/editableArea';

interface IBaseOptions extends IFontSizeOptions, IFontWeightOptions, IFontColorStyleOptions, IHeightOptions,
                                IControlOptions {
    value: string;
    isEditing: boolean;
    editorTemplate: TemplateFunction;
}

/**
 * Базовый шаблон редактирования полей ввода. Имитирует стили {@link Controls/input:Text}.
 * @class Controls/_editableArea/Templates/Editors/Base
 * @extends UI/Base:Control
 * @mixes Controls/interface:IFontWeight
 * @mixes Controls/interface:IFontSize
 * @mixes Controls/interface:IFontColorStyle
 * @mixes Controls/interface:IHeight
 * @author Красильников А.С.
 * @public
 * @see Controls/_editableArea/Templates/Editors/DateTime
 * @demo Controls-demo/EditableArea/ViewContent/Index
 */
class Base extends Control<IBaseOptions>
    implements IHeight, IFontSize, IFontWeight, IFontColorStyle {
    protected _template: TemplateFunction = template;

    readonly '[Controls/_interface/IFontColorStyle]': boolean = true;
    readonly '[Controls/_interface/IFontSize]': boolean = true;
    readonly '[Controls/_interface/IFontWeight]': boolean = true;
    readonly '[Controls/_interface/IHeight]': boolean = true;

    protected _prepareValueForEditor(value: string | TemplateFunction): string | TemplateFunction {
        return value;
    }

    protected _editorValueChangeHandler(event: SyntheticEvent, value: string | TemplateFunction): void {
        this._notify('valueChanged', [value]);
    }

    static getDefaultOptions(): object {
        return {
            fontWeight: 'default',
            inlineHeight: 'default'
        };
    }
}

Object.defineProperty(Base, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Base.getDefaultOptions();
   }
});

export default Base;

/**
 * @name Controls/_editableArea/Templates/Editors/Base#isEditing
 * @cfg {Boolean} Определяет режим взаимодействия с контролом.
 * * true - режим редактирования
 * * false - режим чтения
 */
/**
 * @name Controls/_editableArea/Templates/Editors/Base#editorTemplate
 * @cfg {Controls/input:Base} Шаблон редактирования.
 */
/**
 * @name Controls/_editableArea/Templates/Editors/Base#value
 * @cfg {String} Значение контрола редактирования.
 */
