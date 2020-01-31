import Control = require('Core/Control');
import template = require('wml!Controls/_breadcrumbs/HeadingPath/Back');

class Back extends Control {
   protected _template = template;

   /**
    * Presently, the only way to subscribe to a non-bubbling event is to create control in a wml file and subscribe there.
    * But, sometimes we use this control in the header of a list. Because the header is dynamic, we can't create it in a wml file, therefore it's impossible to make a subscription there.
    * So, all the events from this control should bubble, and it's parent should make sure that they don't propagate higher than it's necessary.
    */
   _onBackButtonClick() {
      this._notify('backButtonClick', [], {
         bubbling: true
      });
   }

   _onArrowClick() {
      this._notify('arrowClick', []);
   }

   static _theme: string[] = ['Controls/crumbs', 'Controls/heading'];
   static _styles: string[] = ['Controls/Utils/FontLoadUtil'];
}

export default Back;
