define(
   [
      'Controls/popupTemplate',
      'Controls/_popupTemplate/Notification/Template/NotificationContent',
      'Controls/popup',
      'Controls/_popupTemplate/Notification/NotificationController',
      'Types/collection'
   ],
   (popupTemplate, NotificationContent, popup, NotificationController, collection) => {
      'use strict';

      NotificationContent = NotificationContent.default;

      describe('Controls/_popup/Opener/Notification', () => {
         const containers = [
            {
               offsetHeight: 10
            },
            {
               offsetHeight: 20
            },
            {
               offsetHeight: 30
            }
         ];

         afterEach(function() {
            popupTemplate.NotificationController._stack.clear();
         });

         it('elementCreated', function() {
            const item1 = {
               popupOptions: {}
            };
            const item2 = {
               popupOptions: {}
            };

            popupTemplate.NotificationController.elementCreated(item1, containers[1]);
            assert.equal(popupTemplate.NotificationController._stack.getCount(), 1);
            assert.equal(popupTemplate.NotificationController._stack.at(0), item1);
            assert.equal(item1.height, containers[1].offsetHeight);
            assert.deepEqual(item1.position, {
               right: 0,
               bottom: 0
            });

            popupTemplate.NotificationController.elementCreated(item2, containers[2]);
            assert.equal(popupTemplate.NotificationController._stack.getCount(), 2);
            assert.equal(popupTemplate.NotificationController._stack.at(0), item2);
            assert.equal(popupTemplate.NotificationController._stack.at(1), item1);
            assert.equal(item2.height, containers[2].offsetHeight);
            assert.deepEqual(item2.position, {
               right: 0,
               bottom: 0
            });
            assert.deepEqual(item1.position, {
               right: 0,
               bottom: containers[2].offsetHeight
            });
         });

         it('elementUpdated', function() {
            const item = {
               popupOptions: {}
            };

            popupTemplate.NotificationController.elementCreated(item, containers[1]);
            popupTemplate.NotificationController.elementUpdated(item, containers[2]);
            assert.equal(popupTemplate.NotificationController._stack.getCount(), 1);
            assert.equal(popupTemplate.NotificationController._stack.at(0), item);
            assert.equal(item.height, containers[2].offsetHeight);
            assert.deepEqual(item.position, {
               right: 0,
               bottom: 0
            });
         });

         it('elementDestroyed', function() {
            const item = {
               popupOptions: {}
            };

            popupTemplate.NotificationController.elementCreated(item, containers[1]);
            popupTemplate.NotificationController.elementDestroyed(item);
            assert.equal(popupTemplate.NotificationController._stack.getCount(), 0);
         });

         it('getDefaultConfig', function() {
            const item = {
               popupOptions: {}
            };

            popupTemplate.NotificationController.getDefaultConfig(item);
            assert.equal(item.popupOptions.content, NotificationContent);
         });

         it('getCustomZIndex', () => {
            let list = new collection.List();
            list.add({
               id: 1,
               popupOptions: {}
            });
            let zIndex = popup.Notification.zIndexCallback({}, list);
            assert.equal(zIndex, 100);

            list.add({
               id: 2,
               popupOptions: {
                  maximize: true,
               }
            });

            zIndex = popup.Notification.zIndexCallback({}, list);
            assert.equal(zIndex, 19);

            list.at(1).popupOptions.maximize = false;
            list.at(1).popupOptions.modal = true;

            zIndex = popup.Notification.zIndexCallback({}, list);
            assert.equal(zIndex, 19);

            let item = {
               id: 3,
               parentId: 2,
               popupOptions: {}
            };
            list.add(item);
            zIndex = popup.Notification.zIndexCallback(item, list);
            assert.equal(zIndex, 100);

         });

         it('getCompatibleConfig', () => {
            const cfg = {
               autoClose: true
            };

            popup.Notification.prototype._getCompatibleConfig({
               prepareNotificationConfig: function(config) {
                  return config;
               }
            }, cfg);
            assert.equal(cfg.notHide, false);
            cfg.autoClose = false;
            popup.Notification.prototype._getCompatibleConfig({
               prepareNotificationConfig: function(config) {
                  return config;
               }
            }, cfg);
            assert.equal(cfg.notHide, true);
         });

         it('Notification opener open/close', (done) => {
            let closeId = null;
            popup.Notification.openPopup = () => {
               return Promise.resolve('123');
            };

            popup.Notification.closePopup = (id) => {
               closeId = id;
            };

            const opener = new popup.Notification({});
            opener.open().then((id1) => {
               assert.equal(id1, '123');
               opener.open().then((id2) => {
                  assert.equal(id2, '123');
                  opener.close();
                  assert.equal(closeId, '123');
                  done();
               });
            });
         });
      });
   }
);
