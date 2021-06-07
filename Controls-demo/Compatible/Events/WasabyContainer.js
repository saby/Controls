define('Controls-demo/Compatible/Events/WasabyContainer', [
    'UI/Base',
    'wml!Controls-demo/Compatible/Events/WasabyContainer'
 ], function(Base, template) {
    'use strict';
 
    var ModuleClass = Base.Control.extend(
       {
          _template: template,
          value: "false"
       }
    );
    return ModuleClass;
 });
 