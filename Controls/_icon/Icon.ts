import {TemplateFunction, IControlOptions, Control} from 'UI/Base';
import * as template from 'wml!Controls/_icon/Icon';
import {IIconSize, IIconSizeOptions, IIconStyle, IIconStyleOptions, IIcon, IIconOptions} from 'Controls/interface';
import {getIcon, isSVGIcon} from 'Controls/Utils/Icon';
import 'css!Controls/CommonClasses';

interface IIconControlOptions extends IControlOptions, IIconStyleOptions, IIconSizeOptions, IIconOptions {}

/**
 * Иконка
 * @public
 */
export default class Icon extends Control<IIconControlOptions> implements IIconStyle, IIconSize, IIcon {
    protected _template: TemplateFunction = template;
    protected _icon: string = null;
    protected _isSVGIcon: boolean = false;

    readonly '[Controls/_interface/IIconStyle]': boolean = true;
    readonly '[Controls/_interface/IIconSize]': boolean = true;
    readonly '[Controls/_interface/IIcon]': boolean = true;

    protected _beforeMount(options: IIconControlOptions): void {
        this._icon = getIcon(options.icon);
        this._isSVGIcon = isSVGIcon(options.icon);
    }

    protected _beforeUpdate(options: IIconControlOptions): void {
        if (options.icon !== this._options.icon) {
            this._icon = getIcon(options.icon);
            this._isSVGIcon = isSVGIcon(options.icon);
        }
    }
}
