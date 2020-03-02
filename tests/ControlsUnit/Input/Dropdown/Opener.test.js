define(
   [
      'Controls/dropdown',
      'Controls/popup',
      'Core/polyfill/PromiseAPIDeferred'
   ],
   (dropdown, popup) => {
      describe('Dropdown/Opener', () => {
         let config = {
            templateOptions: {
               itemTemplate: 'itemTemplate',
               headTemplate: 'headTemplate',
               footerTemplate: 'footerTemplate',
               keyProperty: 'keyProperty',
               selectedKeys: 'selectedKeys',
               parentProperty: 'parentProperty',
               itemTemplateProperty: 'itemTemplateProperty',
               nodeProperty: 'nodeProperty',
               headConfig: {
                  icon: 'icon-small'
               },
               items: {
                  each: () => {}
               }
            },
            className: 'myClass'
         };

         function getOpener(openerConfig) {
            let opener = new dropdown.Opener(openerConfig);
            opener._beforeMount(openerConfig);
            opener._children.LoadingIndicator = {
               toggleIndicator: () => {}
            };
            opener.saveOptions(openerConfig);
            return opener;
         }

         popup.BaseOpener.isNewEnvironment = function() {
            return true;
         };

         it('get template', () => {
            let opener = getOpener(config);
            let controllerName = 'Controls/popupTemplate:StickyController';

            // первый раз загрузка
            opener._requireModules(config, controllerName).addCallback(() => {
               // второй раз из кэша рекваера
               opener._requireModules(config, controllerName).addCallback(() => {
                  assert.isTrue(true);
               });
            });
         });

         it('open', () => {
            let opener = getOpener(config);
            opener.__proto__.__proto__.open = (cfg) => {
               let compOptions = cfg.templateOptions;
               assert.isTrue(compOptions.itemTemplate === 'itemTemplate' &&
                  compOptions.headTemplate === 'headTemplate' &&
                  compOptions.footerTemplate === 'footerTemplate');
            };
            opener.open({
               templateOptions: {
                  items: {
                     each: () => {}
                  }
               }
            });
         });

         it('check templates config', () => {
            let opener = getOpener(config);
            let cfg = {
               templateOptions: {
                  items: {
                     each: () => {}
                  }
               }
            };
            dropdown.Opener._private.setPopupOptions(opener, cfg);
            assert.isTrue(cfg.className === 'myClass');
         });
      });
   }
);
