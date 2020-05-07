define('Controls-demo/Buttons/Menu/MenuPG',
   [
      'Core/Control',
      'tmpl!Controls-demo/PropertyGrid/DemoPG',
      'Types/source',
      'Controls/Constants',
      'json!Controls-demo/PropertyGrid/pgtext',
      'wml!Controls-demo/Buttons/Menu/itemTemplateComment',
      'wml!Controls-demo/Buttons/Menu/itemTemplateSub',
      'wml!Controls-demo/Buttons/Menu/groupTemplate',
      'wml!Controls-demo/Buttons/Menu/itemTemplateCustom',
      'wml!Controls-demo/Buttons/Menu/footerTemplate',
      'wml!Controls-demo/Buttons/Menu/headerTemplate',

   ],

   function(Control, template, sourceLib, ControlsConstants, config) {
      'use strict';

      var MenuPG = Control.extend({
         _template: template,
         _metaData: null,
         _content: 'Controls/dropdown:Button',
         _dataObject: null,
         _componentOptions: null,

         _beforeMount: function() {
            this._commentItems = new sourceLib.Memory({
               data: [
                  {
                     id: 1,
                     title: 'Create in internal editor',
                     comment: 'The internal editor provides a wide range of automatic fill settings',
                     '@parent': true,
                     parent: null,
                     myTemplate: 'wml!Controls-demo/Buttons/Menu/itemTemplateComment'
                  },
                  {
                     id: 2,
                     title: 'Create office documents in the editor',
                     icon: 'icon-small icon-Document',
                     parent: null,
                     comment: 'Word is more familiar, but does not support all the features of automatic filling',
                     myTemplate: 'wml!Controls-demo/Buttons/Menu/itemTemplateComment'
                  },
                  { id: 3, title: 'Download ready printed form', group: 'Print', parent: null },
                  { id: 4, title: 'Select a printed form', group: 'Print', parent: null},
                  {
                     id: 5,
                     title: 'Request documents',
                     comment: 'During the processing you can request to download the necessary documents, for example, scans, photos',
                     parent: null,
                     '@parent': true,
                     myTemplate: 'wml!Controls-demo/Buttons/Menu/itemTemplateComment'
                  },
                  {
                     id: 6,
                     title: 'Request documents from the user',
                     comment: 'During the processing you can request to download the necessary documents, for example, scans, photos',
                     parent: 5,
                     myTemplate: 'wml!Controls-demo/Buttons/Menu/itemTemplateComment'
                  }],
               keyProperty: 'id'
            });
            this._hierarchyItems = new sourceLib.Memory({
               data: [
                  {
                     id: 1,
                     title: 'Task',
                     '@parent': true,
                     parent: null,
                     myTemplate: 'wml!Controls-demo/Buttons/Menu/itemTemplateSub'
                  },
                  {
                     id: 2, title: 'Error in the development', '@parent': true, parent: null
                  },
                  { id: 3, title: 'Commission', parent: 1 },
                  {
                     id: 4,
                     title: 'Coordination',
                     parent: 1,
                     '@parent': true,
                     myTemplate: 'wml!Controls-demo/Buttons/Menu/itemTemplateSub'
                  },
                  {
                     id: 5, title: 'Application', parent: 1, group: 'Create'
                  },
                  {
                     id: 6, title: 'Development', parent: 1, group: 'Create'
                  },
                  {
                     id: 7, title: 'Exploitation', parent: 1, group: 'Create', myTemplate: 'wml!Controls-demo/Buttons/Menu/itemTemplateSub'
                  },
                  { id: 8, title: 'Coordination', parent: 4 },
                  { id: 9, title: 'Negotiate the discount', parent: 4 },
                  {
                     id: 10, title: 'Coordination of change prices', parent: 4, myTemplate: 'wml!Controls-demo/Buttons/Menu/itemTemplateSub'
                  },
                  { id: 11, title: 'Matching new dish', parent: 4 }],
               keyProperty: 'id'
            });
            this._dataObject = {
               style: {
                  keyProperty: 'id',
                  displayProperty: 'title',
                  selectedKey: 0
               },
               viewMode: {
                  keyProperty: 'id',
                  displayProperty: 'title',
                  selectedKey: 1
               },
               size: {
                  keyProperty: 'id',
                  displayProperty: 'title',
                  selectedKey: 1
               },
               iconStyle: {
                  keyProperty: 'id',
                  displayProperty: 'title',
                  selectedKey: 0
               },
               keyProperty: {
                  readOnly: true
               },
               source: {
                  items: [
                     { id: '1', title: 'With icon', items: this._commentItems },
                     { id: '2', title: 'Menu add', items: this._hierarchyItems }
                  ],
                  value: 'With icon'
               },
               itemTemplate: {
                  items: [
                     { id: '1', title: 'Default template', template: '' },
                     { id: '2', title: 'Custom template', template: 'wml!Controls-demo/Buttons/Menu/itemTemplateCustom' }
                  ],
                  value: 'Default template'
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
               },
               headerTemplate: {
                  items: [
                     { id: '1', title: 'Default template', template: '' },
                     { id: '2', title: 'Custom template', template: 'wml!Controls-demo/Buttons/Menu/headerTemplate' }
                  ],
                  value: 'Default template'
               },
               footerTemplate: {
                  items: [
                     { id: '1', title: 'Not specified', template: '' },
                     { id: '2', title: 'Custom template', template: 'wml!Controls-demo/Buttons/Menu/footerTemplate' }
                  ],
                  value: 'Not specified'
               },
               itemTemplateProperty: {
                  items: [
                     { id: '1', title: 'myTemplate', value: 'myTemplate' },
                     { id: '2', title: 'Not specified', value: '' }
                  ],
                  value: 'Not specified'
               },
               dropdownClassName: {
                  items: [
                     { id: '1', title: 'Limited height', value: 'ControlsDemo-ButtonsMenuPG__scroll' },
                     { id: '2', title: 'Not specified', value: ''}
                  ],
                  value: 'Not specified'
               },
               groupTemplate: {
                  items: [
                     { id: '1', title: 'Default groupTemplate', comment: 'groupingKeyCallback must be set', template: 'Controls/dropdown:GroupTemplate' },
                     { id: '2', title: 'With text', comment: 'groupingKeyCallback must be set', template: 'wml!Controls-demo/Buttons/Menu/groupTemplate' },
                     { id: '3', title: 'Not specified', template: '' }
                  ],
                  config: {
                     template: 'custom',
                     value: 'title',
                     comment: 'comment'
                  },
                  value: 'Not specified'
               },
               groupingKeyCallback: {
                  items: [
                     { id: '1', title: 'Property is group', template: function(item) {
                        if (item.get('group') === 'hidden' || !item.get('group')) {
                           return ControlsConstants.view.hiddenGroup;
                        }
                        return item.get('group');
                     } },
                     { id: '2', title: 'Not specified', template: '' }
                  ],
                  value: 'Not specified'
               },
               navigation: {
                  items: [
                     { id: '1', title: 'Loads 2 items', items: { view: 'page', source: 'page', sourceConfig: { pageSize: 2, page: 0, hasMore: false } } },
                     { id: '2', title: 'Not specified', items: {} }
                  ],
                  value: 'Not specified'
               },
               filter: {
                  items: [
                     { id: '1', title: 'Loads items with id is 1, 2 and 3', items: { id: [1, 2, 3] } },
                     { id: '2', title: 'Not specified', items: {} }
                  ],
                  value: 'Not specified'
               }
            };
            this._componentOptions = {
               readOnly: false,
               size: 'm',
               icon: 'icon-medium icon-AddButtonNew',
               iconStyle: 'primary',
               caption: '',
               style: 'primary',
               viewMode: 'button',
               tooltip: '',
               source: this._commentItems,
               groupTemplate: undefined,
               groupingKeyCallback: undefined,
               nodeProperty: '',
               parentProperty: '',
               navigation: undefined,
               headerTemplate: undefined,
               footerTemplate: undefined,
               dropdownClassName: undefined,
               filter: undefined,
               itemTemplate: undefined,
               itemTemplateProperty: undefined,
               keyProperty: 'id',
               name: 'Menu'

            };
            this._metaData = config[this._content].properties['ws-config'].options;
         }
      });
      MenuPG._styles = ['Controls-demo/Input/resources/VdomInputs', 'Controls-demo/Wrapper/Wrapper', 'Controls-demo/Buttons/Menu/Menu'];

      return MenuPG;
   });
