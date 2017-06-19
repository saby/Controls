/**
 * Created by am.gerasimov on 19.01.2016.
 */
define('js!SBIS3.CONTROLS.Utils.TemplateUtil', ['Core/tmpl/tmplstr'], function(tmplstr) {

    /**
     * @class SBIS3.CONTROLS.Utils.TemplateUtil
     * @public
     */
   return /** @lends SBIS3.CONTROLS.Utils.TemplateUtil.prototype */{
       /**
        *
        * @param tpl
        * @returns {*}
        */
      prepareTemplate: function(tpl, logicless) {
         var template;

         switch (typeof tpl) {
            case 'string' :
               template = tpl.indexOf('html!') === 0 || tpl.indexOf('tmpl!') === 0 ?
                   global.requirejs(tpl) : ( logicless ? tmplstr.getFunction(tpl) : doT.template(tpl));
               break;
            case 'function' :
               template = tpl;
               break;
            case 'undefined' :
               template = undefined;
               break;
            default:
               template = null;
         }
         return template;
      }
   };
});