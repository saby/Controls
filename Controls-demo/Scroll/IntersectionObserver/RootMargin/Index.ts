import {TemplateFunction} from 'UI/Base';
import IntersectionObserverDemoControl from 'Controls-demo/Scroll/IntersectionObserver/Default/Index'
import controlTemplate = require('wml!Controls-demo/Scroll/IntersectionObserver/RootMargin/Template');
import 'css!Controls-demo/Controls-demo';

export default class IntersectionObserverThresholdDemoControl extends IntersectionObserverDemoControl {
    protected _template: TemplateFunction = controlTemplate;
}
