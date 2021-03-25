import {descriptor} from 'Types/entity';
import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_spoiler/CutButton/CutButton';

type TIconSize = 's' | 'm' | 'l';
type TButtonPosition = 'start' | 'center';

export interface ICutButton {
    iconSize: TIconSize;
    contrastBackground: boolean;
    readOnly: boolean;
    expanded: boolean;
    buttonPosition: TButtonPosition;
}

class CutButton extends Control<ICutButton, IControlOptions> {
    protected _template: TemplateFunction = template;

    protected _clickHandler(): void {
        if (!this._options.readOnly) {
            this._notify('expandedChanged', [!this._options.expanded]);
        }
    }

    static _theme: string[] = ['Controls/Classes'];

    static getOptionTypes(): object {
        return {
            readOnly: descriptor(Boolean),
            buttonsPosition: descriptor(String),
            contrastBackground: descriptor(Boolean),
            iconSize: descriptor(String),
            expanded: descriptor(Boolean)
        };
    }

    static getDefaultOptions(): object {
        return {
            iconSize: 'm',
            buttonPosition: 'center',
            readOnly: false,
            contrastBackground: true
        };
    }

    static _theme: string[] = ['Controls/spoiler'];
}

Object.defineProperty(CutButton, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): object {
        return CutButton.getDefaultOptions();
    }
});

export default CutButton;
