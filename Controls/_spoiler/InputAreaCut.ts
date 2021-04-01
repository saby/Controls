import {TemplateFunction} from 'UI/Base';
import Cut from './Cut';
import * as template from 'wml!Controls/_spoiler/InputAreaCut/InputAreaCut';

class InputAreaCut extends Cut {
    protected _template: TemplateFunction = template;

    static getDefaultOptions(): object {
        return {
            cutButtonVisibility: true,
            lineHeight: 'm',
            backgroundStyle: 'default'
        };
    }
}

export default InputAreaCut;
