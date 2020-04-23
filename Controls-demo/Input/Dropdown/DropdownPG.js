define('Controls-demo/Input/Dropdown/DropdownPG',
   [
      'Core/Control',
      'tmpl!Controls-demo/PropertyGrid/DemoPG',

      'json!Controls-demo/PropertyGrid/pgtext',

      'Types/source',
      'wml!Controls-demo/Input/Dropdown/contentTemplateDropdownWithIconLeft',
      'wml!Controls-demo/Input/Dropdown/headTemplateDropdown',
      'wml!Controls-demo/Input/Dropdown/footerTemplateDropdown',
      'wml!Controls-demo/Input/Dropdown/itemTemplateDropdown',
      'wml!Controls-demo/Input/Dropdown/itemTemplateDropdownCustom2',
   ],

   function(Control, template, config, sourceLib) {
      'use strict';
      var DropdownPG = Control.extend({
         _template: template,
         _styles: ['Controls-demo/Input/Dropdown/Dropdown', 'Controls-demo/Wrapper/Wrapper'],
         _metaData: null,
         _content: 'Controls/dropdown:Input',
         _eventType: 'selectedKeysChanged',
         _nameOption: 'selectedKeys',
         _dataObject: null,
         _componentOptions: null,
         _sourceTasks: null,

         _beforeMount: function() {
            this._sourceTasks = new sourceLib.Memory({
               keyProperty: 'id',
               data: [
                  {id: 1, title: 'Task in development', text: 'TASK', parent: null, '@parent': false, myTemplate: 'wml!Controls-demo/Input/Dropdown/itemTemplateDropdown', comment: 'develop'},
                  {id: 2, title: 'Error in development', text: 'ERROR', parent: null, '@parent': false, comment: 'develop'},
                  {id: 3, title: 'Application', text: 'APPLICATION', parent: null, '@parent': false, myTemplate: 'wml!Controls-demo/Input/Dropdown/itemTemplateDropdown', comment: 'develop'},
                  {id: 4, title: 'Assignment', text: 'ASSIGNMENT', parent: null, '@parent': true, myTemplate: 'wml!Controls-demo/Input/Dropdown/itemTemplateDropdown', comment: 'develop'},
                  {id: 5, title: 'Approval', text: 'APPROVAL', parent: null, '@parent': false, myTemplate: 'wml!Controls-demo/Input/Dropdown/itemTemplateDropdown', comment: 'develop'},
                  {id: 6, title: 'Working out', text: 'WORKING OUT', parent: null, '@parent': false, comment: 'develop'},
                  {id: 7, title: 'Assignment for accounting', text: 'ASSIGNMENT FOR ACCOUNTING', parent: 4, '@parent': false, comment: 'develop'},
                  {id: 8, title: 'Assignment for delivery', text: 'ASSIGNMENT FOR DELIVERY', parent: 4, '@parent': false, myTemplate: 'wml!Controls-demo/Input/Dropdown/itemTemplateDropdown', comment: 'develop'},
                  {id: 9, title: 'Assignment for logisticians', text: 'ASSIGNMENT FOR LOGISTICIANS', parent: 4, '@parent': false, comment: 'develop'}
               ]
            });
            this._sourceIcons = new sourceLib.Memory({
               keyProperty: 'id',
               data: [
                  {id: 1, title: 'In the work', text: 'IN THE WORK', icon: 'icon-small icon-Trade icon-primary', parent: null, '@parent': false, myTemplate: 'wml!Controls-demo/Input/Dropdown/itemTemplateDropdown'},
                  {id: 2, title: 'It is planned', text: 'IT IS PLANNED', icon: 'icon-16 icon-Sandclock icon-primary', parent: null, '@parent': false },
                  {id: 3, title: 'Completed', text: 'COMPLETED', icon: 'icon-small icon-Successful icon-done', parent: null, '@parent': true, myTemplate: 'wml!Controls-demo/Input/Dropdown/itemTemplateDropdown'},
                  {id: 5, title: 'positive', text: 'POSITIVE', parent: 3, '@parent': false, myTemplate: 'wml!Controls-demo/Input/Dropdown/itemTemplateDropdown'},
                  {id: 6, title: 'negative', text: 'NEGATIVE', parent: 3, '@parent': false, myTemplate: 'wml!Controls-demo/Input/Dropdown/itemTemplateDropdown'},
                  {id: 4, title: 'Not done', text: 'NOT DONE', icon: 'icon-small icon-Decline icon-error', parent: null, '@parent': false}
               ]
            });
            this._dataObject = {
               selectedKeys: {
                  readOnly: true
               },
               source: {
                  items: [
                     { id: '1', title: 'Tasks', items: this._sourceTasks },
                     { id: '2', title: 'With icons', items: this._sourceIcons }
                  ],
                  value: 'With icons'
               },
               displayProperty: {
                  items: [
                     { id: '1', title: 'title', value: 'title' },
                     { id: '2', title: 'text', value: 'text' }
                  ],
                  value: 'title'
               },
               contentTemplate: {
                  items: [
                     { id: '1', title: 'Default template', template: '' },
                     { id: '2', title: 'Custom template', template: 'wml!Controls-demo/Input/Dropdown/contentTemplateDropdownWithIconLeft' }
                  ],
                  value: 'Default template'
               },
               itemTemplate: {
                  items: [
                     { id: '1', title: 'Default template', template: '' },
                     { id: '2', title: 'Custom template', template: 'wml!Controls-demo/Input/Dropdown/itemTemplateDropdownCustom2' }
                  ],
                  value: 'Default template'
               },
               itemTemplateProperty: {
                  items: [
                     { id: '1', title: 'myTemplate', value: 'myTemplate' },
                     { id: '2', title: 'Not specified', value: '' }
                  ],
                  value: 'Not specified'
               },
               headerTemplate: {
                  items: [
                     { id: '1', title: 'Default template', template: '' },
                     { id: '2', title: 'Custom template', template: 'wml!Controls-demo/Input/Dropdown/headTemplateDropdown' }
                  ],
                  value: 'Default template'
               },
               footerTemplate: {
                  items: [
                     { id: '1', title: 'Not specified', template: '' },
                     { id: '2', title: 'Custom template', template: 'wml!Controls-demo/Input/Dropdown/footerTemplateDropdown' }
                  ],
                  value: 'Not specified'
               },
               dropdownClassName: {
                  items: [
                     { id: '1', title: 'Limited height', value: 'ControlsDemo-InputDropdown__scroll-demopg' },
                     { id: '2', title: 'Not specified', value: ''}
                  ],
                  value: 'Not specified'
               },
               navigation: {
                  items: [
                     { id: '1', title: 'Loads 2 items', items: { view: 'page', source: 'page', sourceConfig: { pageSize: 2, page: 1, hasMore: false } } },
                     { id: '2', title: 'Not specified', items: {} }
                  ],
                  value: 'Not specified'
               },
               filter: {
                  items: [
                     { id: '1', title: 'Loads items with id is 1, 2', items: { id: [1, 2] } },
                     { id: '2', title: 'Not specified', items: {} }
                  ],
                  value: 'Not specified'
               },
               parentProperty: {
                  items: [
                     { id: '1', title: 'parent', value: 'parent'},
                     { id: '2', title: 'Not specified', value: ''}
                  ],
                  value: 'Not specified'
               },
               nodeProperty: {
                  items: [
                     { id: '1', title: '@parent', value: '@parent'},
                     { id: '2', title: 'Not specified', value: ''}
                  ],
                  value: 'Not specified'
               }
            };
            this._componentOptions = {
               name: 'Dropdown',
               source: this._sourceIcons,
               selectedKeys: [1],
               historyId: '',
               itemTemplate: undefined,
               itemTemplateProperty: '',
               contentTemplate: undefined,
               headerTemplate: undefined,
               footerTemplate: undefined,
               dropdownClassName: '',
               parentProperty: '',
               nodeProperty: '',
               filter: undefined,
               navigation: undefined,
               emptyText: '',
               displayProperty: 'title',
               keyProperty: 'id',
               readOnly: false,
               multiSelect: false
            };
            this._metaData = config[this._content].properties['ws-config'].options;
         }
      });
      return DropdownPG;
   });
