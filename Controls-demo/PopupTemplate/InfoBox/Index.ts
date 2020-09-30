import {Control, TemplateFunction} from 'UI/Base';
// @ts-ignore
import * as Template from 'wml!Controls-demo/PopupTemplate/InfoBox/InfoBox';

export default class extends Control {
    protected _template: TemplateFunction = Template;

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];

    static getDefaultOptions() {
        return {
            stickyPosition: {
                direction: {
                    horizontal: 'left',
                    vertical: 'top'
                },
                targetPoint: {
                    horizontal: 'left',
                    vertical: 'top'
                }
            }
        };
    }
}
