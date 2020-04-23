define('Controls-demo/Buttons/Menu/Menu', [
   'Core/Control',
   'wml!Controls-demo/Buttons/Menu/Menu',
   'Types/source',
   'Controls/Constants',
   'Controls-demo/Buttons/Menu/historySourceMenu',

   'wml!Controls-demo/Buttons/Menu/itemTemplateSub',
   'wml!Controls-demo/Buttons/Menu/itemTemplateComment'
], function(Control, template, source, ControlsConstants, HistorySourceMenu) {
   'use strict';

   var ModuleClass = Control.extend(
      {
         _template: template,
         _styles: ['Controls-demo/Buttons/Menu/Menu'],
         _oneItem: null,
         _simpleItems: null,
         _simpleItems2: null,
         _iconsItems: null,
         _subParagraphItems: null,
         _commentItems: null,
         _themesItems: null,
         _simpleAdd: null,
         _simpleAdd2: null,
         _simpleAdd3: null,
         _iconAdd: null,
         _iconAddMedium: null,
         _iconButtonItems: null,
         _multiItems: null,
         _hierarchyItems: null,
         _groupItems: null,
         _oneGroupItems: null,
         _itemsGroup: null,
         _scrollItems: null,
         _hierarchyMultiItems: null,
         _groupTextItems: null,
         _additionalItems: null,
         _multilevelHierarchyItems: null,
         _bigItems: null,

         _beforeMount: function() {
            this._oneItem = [
               { id: 1, title: 'Task in development' }
            ];
            this._simpleItems = [
               { id: 1, title: 'Revision' },
               { id: 2, title: 'Newsletter' },
               { id: 3, title: 'Order' }
            ];

            this._simpleItems2 = [
               { id: 1, title: 'Assignment' },
               { id: 2, title: 'Task in development' },
               { id: 3, title: 'Error in development' },
               { id: 4, title: 'Matching' }
            ];
            this._iconsItems = [
               { id: 1, title: 'Form file', icon: 'icon-medium icon-Attach icon-primary' },
               { id: 2, title: 'From 1C', icon: 'icon-medium icon-1c icon-primary' }
            ];

            this._subParagraphItems = [
               { id: 1, title: 'Sales report' },
               { id: 2, title: 'Property Warehouse, Arum, Ltd., 17 March`16', myTemplate: 'wml!Controls-demo/Buttons/Menu/itemTemplateSub' },
               { id: 3, title: 'Main warehouse, Media companies, LLC, 02 Feb`16', myTemplate: 'wml!Controls-demo/Buttons/Menu/itemTemplateSub' },
               { id: 4, title: 'Main warehouse, Our organization, I quarter', myTemplate: 'wml!Controls-demo/Buttons/Menu/itemTemplateSub' },
               { id: 5, title: 'Dynamics of sales' },
               { id: 6, title: 'Balance sheet' },
               { id: 7, title: 'Turnover Statement' },
               { id: 8, title: 'Writing List' }
            ];

            this._commentItems = [
               {
                  id: 1,
                  title: 'Create in internal editor',
                  comment: 'The internal editor provides a wide range of automatic fill settings',
                  myTemplate: 'wml!Controls-demo/Buttons/Menu/itemTemplateComment'
               },
               {
                  id: 2,
                  title: 'Create office documents in the editor',
                  comment: 'Word is more familiar, but does not support all the features of automatic filling',
                  myTemplate: 'wml!Controls-demo/Buttons/Menu/itemTemplateComment'
               },
               { id: 3, title: 'Download ready printed form', myTemplate: 'wml!Controls-demo/Buttons/Menu/itemTemplateComment' },
               { id: 4, title: 'Select a printed form' },
               {
                  id: 5,
                  title: 'Request documents from the user',
                  comment: 'During the processing you can request to download the necessary documents, for example, scans, photos',
                  myTemplate: 'wml!Controls-demo/Buttons/Menu/itemTemplateComment'
               }
            ];

            this._themesItems = [
               {
                  id: 1,
                  title: 'Discussion',
                  comment: 'Create a discussion to find out the views of other group members on this issue'
               },
               {
                  id: 2,
                  title: 'Idea/suggestion',
                  comment: 'Offer your idea, which others can not only discuss, but also evaluate. The best ideas will not go unnoticed and will be realized'
               },
               {
                  id: 3,
                  title: 'Problem',
                  comment: 'Do you have a problem? Tell about it and experts will help to find its solution'
               }
            ];

            this._simpleAdd = [
               { id: 1, title: 'Administrator' },
               { id: 2, title: 'Moderator' },
               { id: 3, title: 'Participant' },
               { id: 4, title: 'Subscriber' }
            ];

            this._simpleAdd2 = [
               { id: 1, title: 'Administrator', icon: 'icon-AdminInfo' },
               { id: 2, title: 'Moderator' },
               { id: 3, title: 'Participant' },
               { id: 4, title: 'Subscriber', icon: 'icon-Subscribe' }
            ];

            this._simpleAdd3 = [
               { id: 1, title: 'Administrator', icon: 'icon-AdminInfo' },
               { id: 2, title: 'Moderator' },
               { id: 3, title: 'Participant' },
               { id: 4, title: 'Subscriber', icon: 'icon-Subscribe' }
            ];
            this._iconAdd = [
               { id: 1, title: 'Work phone', icon: 'icon-small icon-PhoneWork' },
               { id: 2, title: 'Mobile phone', icon: 'icon-small icon-PhoneCell' },
               { id: 3, title: 'Home phone', icon: 'icon-small icon-Home' },
               { id: 4, title: 'Telegram', icon: 'icon-small icon-Telegram' },
               { id: 5, title: 'e-mail', icon: 'icon-small icon-Email' },
               { id: 6, title: 'Skype', icon: 'icon-small icon-Skype' },
               { id: 7, title: 'ICQ', icon: 'icon-small icon-Icq' }
            ];
            this._iconAddMedium = [
               { id: 1, title: 'Work phone', icon: 'icon-medium icon-PhoneWork' },
               { id: 2, title: 'Mobile phone', icon: 'icon-medium icon-PhoneCell' },
               { id: 3, title: 'Home phone', icon: 'icon-medium icon-Home' },
               { id: 4, title: 'Telegram', icon: 'icon-medium icon-Telegram' },
               { id: 5, title: 'e-mail', icon: 'icon-medium icon-Email' },
               { id: 6, title: 'Skype', icon: 'icon-medium icon-Skype' },
               { id: 7, title: 'ICQ', icon: 'icon-medium icon-Icq' }
            ];
            this._iconButtonItems = [
               { id: 1, title: 'All documents to disk' },
               { id: 2, title: 'List in PDF' },
               { id: 3, title: 'List in Excel' }
            ];
            this._hierarchyItems = [
               {
                  id: 1, title: 'Sales of goods and services', parent: null, '@parent': true
               },
               { id: 2, title: 'Contract', parent: null },
               { id: 3, title: 'Texture', parent: null },
               { id: 4, title: 'Score', parent: null },
               { id: 5, title: 'Act of reconciliation', parent: null },
               { id: 6, title: 'Goods', parent: 1 },
               { id: 7, title: 'Finished products', parent: 1 }
            ];
            this._groupItems = [
               { id: 1, title: 'Add', icon: 'icon-small icon-Bell icon-primary' },
               {
                  id: 2, title: 'Vacation', icon: 'icon-small icon-Vacation', group: '2'
               },
               {
                  id: 3, title: 'Time off', icon: 'icon-small icon-SelfVacation', group: '2'
               },
               {
                  id: 4, title: 'Hospital', icon: 'icon-small icon-Sick', group: '2'
               },
               {
                  id: 5, title: 'Business trip', icon: 'icon-small icon-statusDeparted', group: '2'
               }
            ];
            this._oneGroupItems = [
               { id: 1, title: 'Add', icon: 'icon-small icon-Bell icon-primary', group: '2' },
               {
                  id: 2, title: 'Vacation', icon: 'icon-small icon-Vacation', group: '2'
               },
               {
                  id: 3, title: 'Time off', icon: 'icon-small icon-SelfVacation', group: '2'
               },
               {
                  id: 4, title: 'Hospital', icon: 'icon-small icon-Sick', group: '2'
               },
               {
                  id: 5, title: 'Business trip', icon: 'icon-small icon-statusDeparted', group: '2'
               }
            ];
            this._groupTextItems = [
               { id: 1, title: 'Project', group: 'Select' },
               { id: 2, title: 'Work plan', group: 'Select' },
               { id: 3, title: 'Task', group: 'Select' },
               { id: 4, title: 'Merge request', group: 'Create' },
               { id: 5, title: 'Meeting', group: 'Create' },
               { id: 6, title: 'Video meeting', group: 'Create' }
            ];
            this._scrollItems = [
               { id: 1, title: 'Task in development' },
               { id: 2, title: 'Error in development' },
               { id: 3, title: 'Application' },
               { id: 4, title: 'Assignment' },
               { id: 5, title: 'Approval' },
               { id: 6, title: 'Working out' },
               { id: 7, title: 'Assignment for accounting' },
               { id: 8, title: 'Assignment for delivery' },
               { id: 9, title: 'Assignment for logisticians' }
            ];
            this._multiItems = [
               {
                  id: 1,
                  title: 'Task',
                  '@parent': true,
                  parent: null
               },
               { id: 2, title: 'Error in the development', '@parent': false, parent: null },
               { id: 3, title: 'Commission', parent: 1 },
               {
                  id: 4,
                  title: 'Coordination',
                  parent: 1,
                  '@parent': true
               },
               { id: 5, title: 'Application', parent: 1 },
               { id: 6, title: 'Development', parent: 1 },
               { id: 7, title: 'Exploitation', parent: 1 },
               { id: 8, title: 'Coordination', parent: 4 },
               { id: 9, title: 'Negotiate the discount', parent: 4 },
               { id: 10, title: 'Coordination of change prices', parent: 4 },
               { id: 11, title: 'Matching new dish', parent: 4 }
            ];
            this._hierarchyMultiItems = [
               {
                  id: 1,
                  title: 'Task',
                  '@parent': true,
                  parent: null
               },
               { id: 2, title: 'Error in the development', '@parent': false, parent: null, readOnly: true },
               { id: 3, title: 'Commission', parent: 1 },
               {
                  id: 4,
                  title: 'Coordination',
                  parent: 1,
                  '@parent': true,
                  readOnly: true
               },
               { id: 5, title: 'Application', parent: 1 },
               { id: 6, title: 'Development', parent: 1 },
               { id: 7, title: 'Exploitation', parent: 1, readOnly: true },
               { id: 8, title: 'Coordination', parent: 4 },
               { id: 9, title: 'Negotiate the discount', parent: 4 },
               { id: 10, title: 'Coordination of change prices', parent: 4, readOnly: true },
               { id: 11, title: 'Matching new dish', parent: 4 }
            ];
            this._additionalItems = [
               { id: 1, title: 'Add', icon: 'icon-Bell' },
               { id: 2, title: 'Vacation', icon: 'icon-Vacation', group: '2' },
               { id: 3, title: 'Time off', icon: 'icon-SelfVacation', group: '2' },
               { id: 4, title: 'Hospital', icon: 'icon-Sick', group: '2' },
               { id: 5, title: 'Business trip', icon: 'icon-statusDeparted', group: '2' },
               { id: 6, title: 'Task', icon: 'icon-TFTask', group: '3', additional: true },
               { id: 7, title: 'Incident', icon: 'icon-Alert', group: '3', additional: true },
               { id: 8, title: 'Outfit', icon: 'icon-PermittedBuyers', group: '3', additional: true },
               { id: 9, title: 'Project', icon: 'icon-Document', group: '3', additional: true },
               { id: 10, title: 'Check', icon: 'icon-Statistics', group: '3', additional: true },
               { id: 11, title: 'Meeting', icon: 'icon-Groups', group: '3', additional: true },
               { id: 12, title: 'Treaties', icon: 'icon-Report', group: '3', additional: true }
            ];
            this._multilevelHierarchyItems = [
               { id: 1, title: 'Task', '@parent': true, parent: null },
               { id: 2, title: 'Error in the development', '@parent': false, parent: null },
               { id: 3, title: 'Commission', parent: 1 },
               { id: 4, title: 'Coordination', parent: 1, '@parent': true },
               { id: 5, title: 'Application', parent: 1 },
               { id: 6, title: 'Development', parent: 1 },
               { id: 7, title: 'Exploitation', parent: 1 },
               { id: 8, title: 'Coordination', parent: 4 },
               { id: 9, title: 'Negotiate the discount', parent: 4 },
               { id: 10, title: 'Coordination of change prices', parent: 4, '@parent': true },
               { id: 11, title: 'Matching new dish', parent: 4 },
               { id: 12, title: 'New level', parent: 10},
               { id: 13, title: 'New level record 2', parent: 10},
               { id: 14, title: 'New level record 3', parent: 10, '@parent': true},
               { id: 15, title: 'Very long hierarchy', parent: 14},
               { id: 16, title: 'Very long hierarchy 2', parent: 14, '@parent': true},
               { id: 17, title: 'Very long hierarchy 3', parent: 14},
               { id: 18, title: 'It is last level', parent: 16},
               { id: 19, title: 'It is last level 2', parent: 16},
               { id: 20, title: 'It is last level 3', parent: 16}
            ];
            this._bigItems = this._createBigItems();
         },

         _createBigItems: function() {
            var items = [];
            for (var i = 0; i < 100; i++) {
               items.push({id: i, title: i % 10 === 0 ? ('Are we testing if there are very long records in the menu with unlimited width? This is a very long record. ' + i) : ('New record ' + i)});
            }
            return items;
         },

         _createMemory: function(items) {
            return new source.Memory({
               keyProperty: 'id',
               data: items
            });
         },

         _createHistoryMemory: function() {
            return HistorySourceMenu.createMemory();
         },
         _groupingKeyCallback: function(item) {
            if (item.get('group') === 'hidden' || !item.get('group')) {
               return ControlsConstants.view.hiddenGroup;
            }
            return item.get('group');
         }
      }
   );
   return ModuleClass;
});
