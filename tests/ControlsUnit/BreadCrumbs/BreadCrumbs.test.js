define([
   'Controls/breadcrumbs',
   'Types/entity'
], function(
   crumbs,
   entity
) {
   describe('Controls.BreadCrumbs.View', function() {
      var bc, data;
      beforeEach(function() {
         data = [
            {
               id: 1,
               title: 'Настолько длинное название папки что оно не влезет в максимальный размер 1',
               parent: null
            },
            {
               id: 2,
               title: 'Notebooks 2',
               parent: 1
            },
            {
               id: 3,
               title: 'Smartphones 3',
               parent: 2
            },
            {
               id: 4,
               title: 'Record1',
               parent: 3
            },
            {
               id: 5,
               title: 'Record2',
               parent: 4
            },
            {
               id: 6,
               title: 'Record3eqweqweqeqweqweedsadeqweqewqeqweqweqw',
               parent: 5
            }
         ];
         bc = new crumbs.View();
         bc.saveOptions({
            items: data.map(function(item) {
               return new entity.Model({
                  rawData: item
               });
            }),
            keyProperty: 'id',
            parentProperty: 'parent',
            displayProperty: 'test'
         });
      });
      afterEach(function() {
         bc.destroy();
         bc = null;
      });
      it('_onHoveredItemChanged', function() {
         var hoveredItem = 'hoveredItem';

         bc._notify = function(e, args) {
            if (e === 'hoveredItemChanged') {
               assert.equal(hoveredItem, args[0]);
            }
         };
         bc._onHoveredItemChanged({}, hoveredItem);
      });
      describe('_onItemClick', function() {
         const mockEvent = (e) => ({...e, stopPropagation() {}});
         it('item', function() {
            var itemData = {
               item: new entity.Model({
                  rawData: {
                     id: 2,
                     title: 'Notebooks 2'
                  }
               })
            };
            bc._notify = function(e, args) {
               if (e === 'itemClick') {
                  assert.equal(itemData.item.get('id'), args[0].get('id'));
               }
            };
            bc._onItemClick(mockEvent(), itemData);

            // check notify itemClick in readOnly mode
            var notifyClickCalled = false;
            bc._options.readOnly = true;
            bc._notify = function(e, args) {
               if (e === 'itemClick') {
                  notifyClickCalled = true;
               }
            };
            bc._onItemClick(mockEvent(), itemData);
            assert.isFalse(notifyClickCalled, 'itemClick notified in readOnly mode.');
         });
         it('dots', function() {
            var itemData = {
               item: {
                  title: '...'
               }
            };
            bc._children = {
               menuOpener: {
                  open: function(openerOptions) {
                     assert.equal(openerOptions.target, 123);
                     assert.equal(openerOptions.templateOptions.displayProperty, 'test');
                  },
                  close: function() {}
               }
            };
            bc._dotsClick({
               currentTarget: 123,
            }, itemData);
            bc._onOpen();
            assert.isTrue(bc._popupIsOpen);

            bc._dotsClick({
               currentTarget: 123,
            }, itemData);
            bc._onClose();
            assert.isFalse(bc._popupIsOpen);
         });
      });
      it('_onResult', function(done) {
         var args = new entity.Model({
            rawData: data[0]
         });
         bc._notify = function(e, eventArgs) {
            if (e === 'itemClick') {
               assert.equal(bc._options.items[0].get('id'), eventArgs[0].get('id'));
            }
         };
         bc._children = {
            menuOpener: {
               close: function() {
                  done();
               }
            }
         };
         bc._onResult(null, 'itemClick', args);
      });
   });
});
