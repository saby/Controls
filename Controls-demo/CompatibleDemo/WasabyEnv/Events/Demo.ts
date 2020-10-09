import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/CompatibleDemo/WasabyEnv/Events/Demo');

class CompatibleEvent extends Control<IControlOptions> {
   protected _template: TemplateFunction = template;

   static _styles: string[] = ['Controls-demo/CompatibleDemo/CompatibleDemo'];
}
export default CompatibleEvent;
