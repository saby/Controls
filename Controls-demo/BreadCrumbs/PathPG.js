define('Controls-demo/BreadCrumbs/PathPG', [
   'Core/Control',
   'tmpl!Controls-demo/PropertyGrid/DemoPG',
   'json!Controls-demo/PropertyGrid/pgtext',
   'Types/entity',
], function(
   Control,
   template,
   config,
   entity
) {
   return Control.extend({
      _template: template,
      _styles: ['Controls-demo/BreadCrumbs/PathPG'],
      _dataObject: null,
      _componentOptions: null,
      _metaData: null,
      _content: 'Controls/breadcrumbs:HeadingPath',

      _beforeMount: function() {
         var
            employees = [{
               id: 0,
               name: 'John',
               surname: 'Doe',
               parent: null
            }, {
               id: 1,
               name: 'Rick',
               surname: 'Ministries',
               parent: 0
            }],
            contacts = [{
               id: 0,
               name: 'Mark',
               surname: 'Moe',
               parent: null
            }, {
               id: 1,
               name: 'Friedman',
               surname: 'Ferguson',
               parent: 0
            }, {
               id: 2,
               name: 'Bill',
               surname: 'Schuette',
               parent: 1
            }];
         this._dataObject = {
            items: {
               items: [{
                  id: 0,
                  title: 'Employees',
                  items: employees.map(function(item) {
                     return new entity.Model({
                        rawData: item,
                        keyProperty: 'id'
                     });
                  })
               }, {
                  id: 1,
                  title: 'Contacts',
                  items: contacts.map(function(item) {
                     return new entity.Model({
                        rawData: item,
                        keyProperty: 'id'
                     });
                  })
               }],
               value: 'Employees'
            },
            keyProperty: {
               readOnly: true
            },
            displayProperty: {
               readOnly: false,
               value: 'name',
               items: [
                  {
                     id: 0,
                     title: 'name',
                     value: 'name'
                  }, {
                     id: 1,
                     title: 'surname',
                     value: 'surname'
                  }
               ]
            },
            parentProperty: {
               readOnly: true,
               value: 'parent'
            }
         };
         this._componentOptions = {
            readOnly: false,
            parentProperty: 'parent',
            keyProperty: 'id',
            displayProperty: 'name',
            name: 'Path',
            items: employees.map(function(item) {
               return new entity.Model({
                  rawData: item,
                  keyProperty: 'id'
               });
            }),
            showActionButton: true
         };
         this._metaData = config[this._content].properties['ws-config'].options;
      }
   });
});
