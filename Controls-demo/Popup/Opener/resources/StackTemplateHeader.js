define('Controls-demo/Popup/Opener/resources/StackTemplateHeader',
   [
      'Core/Control',
      'wml!Controls-demo/Popup/Opener/resources/StackTemplateHeader',
      'Types/source',
      'wml!Controls-demo/List/Tree/DemoContentTemplate'
   ],
   function(Control, template, Source) {
      'use strict';

      var PopupPage = Control.extend({
         _template: template,
         SelectedKey1: '1',
         _source1: null,
         _beforeMount: function() {
            this._source1 = new Source.Memory({
               keyProperty: 'id',
               data: [
                  {
                     id: '1',
                     title: 'Document',
                     align: 'left',
                     isMainTab: true
                  },
                  {
                     id: '2',
                     title: 'Files',
                     align: 'left'
                  },
                  {
                     id: '3',
                     title: 'Orders',
                     align: 'left'
                  },
                  {
                     id: '4',
                     title: 'Productions'
                  },
                  {
                     id: '5',
                     title: 'Employees'
                  },
                  {
                     id: '6',
                     title: 'Groups'
                  },
                  {
                     id: '7',
                     title: 'Photos'
                  },
                  {
                     id: '8',
                     title: 'Videos'
                  }
               ]
            });
         },
         _close: function() {
            this._notify('close', [], { bubbling: true });
         },
         _onActionClick: function(event, action) {
            this._actionClicked = action.title;
         }
      });


      PopupPage._styles = ['Controls-demo/Popup/Opener/resources/StackHeader'];

      return PopupPage;
   });
