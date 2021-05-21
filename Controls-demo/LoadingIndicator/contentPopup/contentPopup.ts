import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/LoadingIndicator/contentPopup/contentPopup');

class contentPopup extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

   protected _beforeMount() {
        const delay: number = 5000;
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, delay);
        });
    }
}
export default contentPopup;
