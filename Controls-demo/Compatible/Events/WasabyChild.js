define('Controls-demo/Compatible/Events/WasabyChild', [
    'UI/Base',
    'wml!Controls-demo/Compatible/Events/WasabyChild'
 ], function(Base, template) {
    'use strict';
 
    var ModuleClass = Base.Control.extend(
       {
          _template: template,
          handler: function(e, key) {
             this._notify('myEvent', [], { bubbling: true });     
          }
       }
    );
    return ModuleClass;
 });
 