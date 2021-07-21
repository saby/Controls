import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_columnScroll/Shadows/Shadows';
import ColumnScrollController from './../ColumnScrollController';

interface IShadowsOptions extends IControlOptions {
    backgroundStyle?: string;
    needBottomPadding?: boolean;
}

export default class Shadows extends Control<IControlOptions> {
    private _template: TemplateFunction = template;

    private _getClasses(options: IShadowsOptions, position: 'start' | 'end'): string {
        return ColumnScrollController.getShadowClasses(position, {
            backgroundStyle: options.backgroundStyle || 'default',
            needBottomPadding: !!options.needBottomPadding
        });
    }
}
