import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/CompatibleDemo/WasabyEnv/Events/Case3/WasabyControl');

class WasabyControl extends Control<IControlOptions> {
   protected _template: TemplateFunction = template;
   value: string = '';
   textValue: string = '';

   _changeValuesHandler() {
      this.textValue += 'wasChaged\n';
   }
   static _styles: string[] = ['Controls-demo/CompatibleDemo/CompatibleDemo'];
}
export default WasabyControl;
