/**
 * Created by am.gerasimov on 13.04.2018.
 */
/**
 * Created by am.gerasimov on 13.12.2017.
 */
define('Controls-demo/Suggest/resources/SuggestTemplate', [
   'UI/Base',
   'wml!Controls-demo/Suggest/resources/SuggestTemplate',
   'Controls/list'
], function(Base, template) {
   
   'use strict';
   
   return Base.Control.extend({
      _template: template
   });
   
});