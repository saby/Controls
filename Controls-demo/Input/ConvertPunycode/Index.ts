import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Input/ConvertPunycode/ConvertPunycode');

class ConvertPunycode extends Control<IControlOptions> {
    protected _placeholder = 'Tooltip';
    protected _template: TemplateFunction = controlTemplate;
    protected _copyText(): void {
        const input = document.getElementById('text');
        input.select();
        document.execCommand('copy');
    }

    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default ConvertPunycode;
