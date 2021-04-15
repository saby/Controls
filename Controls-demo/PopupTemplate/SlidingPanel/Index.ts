import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/PopupTemplate/SlidingPanel/Index/Index');
import {detection} from 'Env/Env';


class Index extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _beforeMount(): void {
        // В этой демке показывается поведение контрола в режиме мобилки
        detection.isPhone = true;
    }
    protected _beforeUnmount(): void {
        // На случай если в демках появится SPA, чтобы не поломать другие демки
        detection.isPhone = false;
    }
    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/PopupTemplate/SlidingPanel/Index/Index'];
}
export default Index;
