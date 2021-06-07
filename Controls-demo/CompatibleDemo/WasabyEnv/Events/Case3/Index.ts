import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/CompatibleDemo/WasabyEnv/Events/Case3/Index');

class WasabyIndex extends Control<IControlOptions> {
   protected _template: TemplateFunction = template;

   static _styles: string[] = ['Controls-demo/CompatibleDemo/WasabyEnv/Events/EventDemo'];
}
export default WasabyIndex;
