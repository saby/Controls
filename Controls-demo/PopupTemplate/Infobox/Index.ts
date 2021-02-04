import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/PopupTemplate/Infobox/Main');

class Infobox extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];

    static getDefaultOptions(): object {
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

Object.defineProperty(Infobox, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Infobox.getDefaultOptions();
   }
});

export default Infobox;
