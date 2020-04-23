/**
 * Created by kraynovdo on 31.01.2018.
 */
define('Controls-demo/List/Swipe', [
   'Env/Env',
   'Core/Control',
   'wml!Controls-demo/List/Swipe/Swipe',
   'Types/source',
], function(Env,
   BaseControl,
   template,
   source) {
   'use strict';
   var ModuleClass = BaseControl.extend(
      {
         _actions: null,
         _heightS: null,
         _height: 37,
         _itemActions: null,
         _actionsArrays: null,
         _template: template,
         _styles: ['Controls-demo/List/Swipe/Swipe'],
         showType: null,
         _selectedKeys: null,
         _onActionClick: function(event, action, item) {
            Env.IoC.resolve('ILogger').info(arguments);
         },
         _contentClick: function() {
            Env.IoC.resolve('ILogger').info(arguments);
         },

         _beforeMount: function() {
            this._selectedKeys = [];
            this.showType = {
               // show only in Menu
               MENU: 0,
               // show in Menu and Toolbar
               MENU_TOOLBAR: 1,
               // show only in Toolbar
               TOOLBAR: 2
            };
            this._actionsArrays = {
               1: [
                  {
                     id: 1,
                     title: 'one actions without image',
                     showType: this.showType.TOOLBAR,
                     handler: function(item) {
                        Env.IoC.resolve('ILogger').info('one phone Click ', item);
                     }
                  }
               ],
               2: [
                  {
                     id: 1,
                     icon: 'icon-primary icon-PhoneNull',
                     title: 'phone',
                     showType: this.showType.MENU_TOOLBAR,
                     handler: function(item) {
                        Env.IoC.resolve('ILogger').info('action phone Click ', item);
                     }
                  },
                  {
                     id: 2,
                     showType: this.showType.MENU_TOOLBAR,
                     icon: 'icon-primary icon-EmptyMessage',
                     title: 'message',
                     handler: function() {
                        alert('Message Click');
                     }
                  }
               ],
               3: [
                  {
                     id: 1,
                     icon: 'icon-primary icon-PhoneNull',
                     title: 'phone',
                     showType: this.showType.MENU_TOOLBAR,
                     handler: function(item) {
                        Env.IoC.resolve('ILogger').info('action phone Click ', item);
                     }
                  },
                  {
                     id: 2,
                     icon: 'icon-primary icon-EmptyMessage',
                     title: 'message',
                     showType: this.showType.MENU_TOOLBAR,
                     handler: function() {
                        alert('Message Click');
                     }
                  },
                  {
                     id: 3,
                     icon: 'icon-primary icon-Profile',
                     title: 'profile',
                     showType: this.showType.MENU_TOOLBAR,
                     handler: function() {
                        Env.IoC.resolve('ILogger').info('action profile Click');
                     }
                  }
               ],
               4: [
                  {
                     id: 1,
                     icon: 'icon-primary icon-PhoneNull',
                     title: 'phone',
                     handler: function(item) {
                        Env.IoC.resolve('ILogger').info('action phone Click ', item);
                     }
                  },
                  {
                     id: 2,
                     icon: 'icon-primary icon-EmptyMessage',
                     title: 'message',
                     handler: function() {
                        alert('Message Click');
                     }
                  },
                  {
                     id: 3,
                     icon: 'icon-primary icon-Profile',
                     title: 'profile',
                     showType: this.showType.MENU_TOOLBAR,
                     handler: function() {
                        Env.IoC.resolve('ILogger').info('action profile Click');
                     }
                  },
                  {
                     id: 4,
                     icon: 'icon-Erase',
                     iconStyle: 'danger',
                     title: 'delete pls',
                     showType: this.showType.TOOLBAR,
                     handler: function() {
                        Env.IoC.resolve('ILogger').info('action delete Click');
                     }
                  }
               ],
               5: [
                  {
                     id: 5,
                     title: 'прочитано',
                     icon: 'icon-primary icon-CbPlus',
                     showType: this.showType.TOOLBAR,
                     handler: function() {
                        Env.IoC.resolve('ILogger').info('action read Click');
                     }
                  },
                  {
                     id: 1,
                     icon: 'icon-primary icon-PhoneNull',
                     title: 'phone',
                     handler: function(item) {
                        Env.IoC.resolve('ILogger').info('action phone Click ', item);
                     }
                  },
                  {
                     id: 2,
                     icon: 'icon-primary icon-EmptyMessage',
                     title: 'message',
                     handler: function() {
                        alert('Message Click');
                     }
                  },
                  {
                     id: 3,
                     icon: 'icon-primary icon-Profile',
                     title: 'profile',
                     showType: this.showType.MENU_TOOLBAR,
                     handler: function() {
                        Env.IoC.resolve('ILogger').info('action profile Click');
                     }
                  },
                  {
                     id: 4,
                     icon: 'icon-Erase',
                     iconStyle: 'danger',
                     title: 'delete pls',
                     showType: this.showType.TOOLBAR,
                     handler: function() {
                        Env.IoC.resolve('ILogger').info('action delete Click');
                     }
                  }
               ],
               6: [

                  {
                     id: 1,
                     icon: 'icon-primary icon-PhoneNull',
                     title: 'phone',
                     handler: function(item) {
                        Env.IoC.resolve('ILogger').info('action phone Click ', item);
                     }
                  },
                  {
                     id: 2,
                     icon: 'icon-primary icon-EmptyMessage',
                     title: 'message',
                     handler: function() {
                        alert('Message Click');
                     }
                  },
                  {
                     id: 3,
                     icon: 'icon-primary icon-Profile',
                     title: 'profile',
                     showType: this.showType.MENU_TOOLBAR,
                     handler: function() {
                        Env.IoC.resolve('ILogger').info('action profile Click');
                     }
                  },
                  {
                     id: 4,
                     icon: 'icon-Erase',
                     iconStyle: 'danger',
                     title: 'delete pls',
                     handler: function() {
                        Env.IoC.resolve('ILogger').info('action delete Click');
                     }
                  },
                  {
                     id: 5,
                     title: 'прочитано',
                     icon: 'icon-primary icon-CbPlus',
                     showType: this.showType.TOOLBAR,
                     handler: function() {
                        Env.IoC.resolve('ILogger').info('action read Click');
                     }
                  },

                  {
                     id: 6,
                     icon: 'icon-Lightning icon-error',
                     title: 'шестая кнопочка',
                     showType: this.showType.TOOLBAR,
                     handler: function() {
                        Env.IoC.resolve('ILogger').info('action delete Click');
                     }
                  }
               ],
               7: [

                  {
                     id: 1,
                     icon: 'icon-primary icon-PhoneNull',
                     title: 'phone',
                     handler: function(item) {
                        Env.IoC.resolve('ILogger').info('action phone Click ', item);
                     }
                  },
                  {
                     id: 2,
                     title: 'messagemessagemessagemessagemessagemessage',
                     handler: function() {
                        alert('Message Click');
                     }
                  },
                  {
                     id: 3,
                     icon: 'icon-primary icon-Profile',
                     title: 'profile',
                     handler: function() {
                        Env.IoC.resolve('ILogger').info('action profile Click');
                     }
                  },
                  {
                     id: 4,
                     icon: 'icon-Erase',
                     iconStyle: 'danger',
                     title: 'delete pls',
                     handler: function() {
                        Env.IoC.resolve('ILogger').info('action delete Click');
                     }
                  },

                  {
                     id: 5,
                     icon: 'icon-Lightning icon-error',
                     title: 'шестая кнопочка',
                     showType: this.showType.TOOLBAR,
                     handler: function() {
                        Env.IoC.resolve('ILogger').info('action delete Click');
                     }
                  },
                  {
                     id: 6,
                     title: 'прочитано',

                     showType: this.showType.TOOLBAR,
                     handler: function() {
                        Env.IoC.resolve('ILogger').info('action read Click');
                     }
                  },

                  {
                     id: 7,
                     icon: 'icon-Pack icon-error',
                     title: 'Седьмая кнопочка',
                     showType: this.showType.TOOLBAR,
                     handler: function() {
                        Env.IoC.resolve('ILogger').info('action delete Click');
                     }
                  }
               ],
               8: [

                  {
                     id: 1,
                     icon: 'icon-primary icon-PhoneNull',
                     title: 'phone',
                     handler: function(item) {
                        Env.IoC.resolve('ILogger').info('action phone Click ', item);
                     }
                  },
                  {
                     id: 2,
                     icon: 'icon-primary icon-EmptyMessage',
                     title: 'message',
                     handler: function() {
                        alert('Message Click');
                     }
                  },
                  {
                     id: 3,
                     icon: 'icon-primary icon-Profile',
                     title: 'profile',
                     handler: function() {
                        Env.IoC.resolve('ILogger').info('action profile Click');
                     }
                  },
                  {
                     id: 4,
                     icon: 'icon-Erase',
                     iconStyle: 'danger',
                     title: 'delete pls',
                     handler: function() {
                        Env.IoC.resolve('ILogger').info('action delete Click');
                     }
                  },
                  {
                     id: 5,
                     title: 'прочитано',
                     icon: 'icon-primary icon-CbPlus',
                     handler: function() {
                        Env.IoC.resolve('ILogger').info('action read Click');
                     }
                  },

                  {
                     id: 6,
                     icon: 'icon-Lightning icon-error',
                     title: 'шестая кнопочка',
                     showType: this.showType.TOOLBAR,
                     handler: function() {
                        Env.IoC.resolve('ILogger').info('action delete Click');
                     }
                  },
                  {
                     id: 7,
                     title: '777 кнопочка',
                     showType: this.showType.TOOLBAR,
                     handler: function() {
                        Env.IoC.resolve('ILogger').info('action delete Click');
                     }
                  },
                  {
                     id: 8,
                     icon: 'icon-PhoneGetManually icon-error',
                     title: '8888я кнопочка',
                     showType: this.showType.TOOLBAR,
                     handler: function() {
                        Env.IoC.resolve('ILogger').info('action delete Click');
                     }
                  }
               ]
            };
            // this._onActClick = this._onActClick.bind(this);
            this._viewSource = new source.Memory({
               keyProperty: 'id',
               data: [
                  {
                     id: 1
                  },
                  {
                     id: 2
                  },
                  {
                     id: 3
                  }
               ],
            });
            this._actions = [1, 2, 3, 4, 5, 6, 7, 8];
            this._heightS = [37, 38, 44, 52, 72, 73, 75, 85, 92, 107, 108, 109, 110, 120, 133, 134, 157, 158, 169, 170, 181, 182, 184, 223, 224, 263, 264, 303, 304, 350, 400, 500, 600];
            this._itemActions = this._actionsArrays[5];
         },
         _onHeightClick: function(event, height) {
            this._height = height;
            this._forceUpdate();
         },
         _onActClick: function(event, act) {
            this._itemActions = this._actionsArrays[act];
         }
      }
   );
   return ModuleClass;
});
