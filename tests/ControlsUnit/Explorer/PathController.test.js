define([
   'Controls/_explorer/PathController',
   'Controls/_breadcrumbs/HeadingPath/Back',
   'Types/entity',
   'Controls/_explorer/HeadingPathBack'
], function(
   PathController,
   PathBack,
   entity,
   HeadingPathBack
) {
   describe('Controls.Explorer._PathController', function() {
      var items = [{
         id: 0,
         title: 'first',
         counterCaption: 1
      }, {
         id: 1,
         title: 'second',
         counterCaption: 2
      }].map(function(item) {
         return new entity.Model({
            keyProperty: 'id',
            rawData: item
         });
      });
      describe('_beforeMount', function() {
         it('without header', function() {
            var instance = new PathController();
            instance._beforeMount({
               itemsPromise: new Promise((res) => {
                  res(null);
               })
            });
            assert.isNotOk(instance._header);
         });
         it('with header, first item has title', function() {
            var
               instance = new PathController(),
               header = [{
                  title: '123'
               }];
            instance._beforeMount({
               header: header,
               itemsPromise: new Promise((res) => {
                  res(null);
               })
            });
            assert.isOk(instance._header);
         });
         it('with header, first item has template', function() {
            var
               instance = new PathController(),
               header = [{
                  template: function() {
                     return '<div>123</div>';
                  }
               }];
            instance._beforeMount({
               header: header,
               itemsPromise: new Promise((res) => {
                  res(null);
               })
            });
            assert.isOk(instance._header);
         });
         it('with header, first item doesn\'t have neither title nor template', function() {
            var
               instance = new PathController(),
               header = [{
                  align: 'right',
                  width: '100px'
               }, {
                  title: 'second'
               }];
            instance._beforeMount({
               header: header,
               items: items,
               itemsPromise: new Promise((res) => {
                  res(items);
               }),
               displayProperty: 'title'
            });
            assert.deepEqual(instance._header, [{
               template: HeadingPathBack,
               templateOptions: {
                  items: items,
                  displayProperty: 'title',
                  itemsAndHeaderPromise: instance._itemsAndHeaderPromise,
                  backButtonStyle: undefined,
                  backButtonIconStyle: undefined,
                  backButtonFontColorStyle: undefined,
                  showArrowOutsideOfBackButton: false,
                  showActionButton: false
               },
               align: 'right',
               width: '100px',
               isBreadCrumbs: true
            }, {
               title: 'second'
            }]);
         });
      });
      describe('needShadow', function() {
         var needShadow = PathController._private.needShadow;
         it('there is no header, we need shadow', function() {
            assert.isTrue(needShadow(undefined, undefined));
         });
         it('there is header, we do not need shadow', function() {
            assert.isFalse(needShadow(undefined, [{title:"title"}]));
         });
         it('there is header, we do not need shadow', function() {
            assert.isFalse(needShadow([{title:"backButton"}], [{title:""}]));
         });

      });
      describe('_beforeUpdate', function() {
         it('old items + update header', async function() {
            var
               cfg = {
                  items: items,
                  header: [{}],
                  itemsPromise: new Promise((res) => {
                     res(items);
                  })
               },
               newCfg = {
                  items: items,
                  header: [{}, {}],
                  itemsPromise: new Promise((res) => {
                     res(items);
                  })
               },
               newCfg2 = {
                  items: items,
                  header: [],
                  itemsPromise: new Promise((res) => {
                     res(items);
                  })
               },
               instance = new PathController(cfg);
            instance.saveOptions(cfg);
            await instance._beforeMount(cfg);
            assert.equal(1, instance._header.length);
            instance._beforeUpdate(newCfg);
            assert.equal(2, instance._header.length);
            instance._beforeUpdate(newCfg2);
            assert.deepEqual(instance._header, []);
         });
         it('new same items', async function() {
            var
               headerInst,
               cfg,
               instance = new PathController(),
               header = [{
                  align: 'right',
                  width: '100px'
               }, {
                  title: 'second'
               }];
            cfg = {
               items: items,
               header: header,
               itemsPromise: new Promise((res) => {
                  res(items);
               }),
               displayProperty: 'title'
            };
            instance._header = [];
            instance.saveOptions(cfg);
            await instance._beforeMount(cfg);
            headerInst = instance._header;
            instance._beforeUpdate({
               header: header,
               items: items.slice(),
               displayProperty: 'title'
            });
            assert.notEqual(instance._header, headerInst);
         });

         it('new different items', function() {

            var
               instance = new PathController(),
               header = [{
                  align: 'right',
                  width: '100px'
               }, {
                  title: 'second'
               }];
            instance._header = [];
            instance.saveOptions({
               items: items
            });
            instance._beforeUpdate({
               header: header,
               items: items.slice(0,1),
               displayProperty: 'title'
            });
            assert.deepEqual(instance._header, [{
               template: HeadingPathBack,
               templateOptions: {
                  displayProperty: 'title',
                  items: items.slice(0,1),
                  backButtonStyle: undefined,
                  backButtonIconStyle: undefined,
                  backButtonFontColorStyle: undefined,
                  showArrowOutsideOfBackButton: false,
                  showActionButton: false,
                  itemsAndHeaderPromise: instance._itemsAndHeaderPromise
               },
               align: 'right',
               width: '100px',
               isBreadCrumbs: true
            }, {
               title: 'second'
            }]);
         });


         it('new different items with same id', async function() {
            let items = [{
                  id: 0,
                  title: 'first',
                  counterCaption: 1
               }, {
                  id: 1,
                  title: 'second',
                  counterCaption: 2
               }].map(function(item) {
                  return new entity.Model({
                     keyProperty: 'id',
                     rawData: item
                  });
               }),
               itemsNew = [{
                  id: 0,
                  title: 'first',
                  counterCaption: 1
               }, {
                  id: 1,
                  title: 'first',
                  counterCaption: 2
               }].map(function(item) {
                  return new entity.Model({
                     keyProperty: 'id',
                     rawData: item
                  });
               }),
               header = [{
                  align: 'right',
                  width: '100px'
               }, {
                  title: 'second'
               }],
               cfg = {
                  items: items,
                  header: header,
                  displayProperty: 'title',
                  itemsPromise: new Promise((res) => {
                     res(items);
                  })
               },
               instance = new PathController();
            await instance._beforeMount(cfg);
            var headerInst = instance._header;
            instance.saveOptions({
               items: items,
               itemsPromise: new Promise((res) => {
                  res(items);
               })
            });
            instance._beforeUpdate({
               header: header,
               items: itemsNew,
               displayProperty: 'title'
            });
            assert.notEqual(instance._header, headerInst);
            assert.deepEqual(instance._header, [{
               template: HeadingPathBack,
               templateOptions: {
                  backButtonStyle: undefined,
                  backButtonIconStyle: undefined,
                  backButtonFontColorStyle: undefined,
                  showArrowOutsideOfBackButton: false,
                  showActionButton: false,
                  displayProperty: 'title',
                  items: itemsNew,
                  itemsAndHeaderPromise: instance._itemsAndHeaderPromise
               },
               align: 'right',
               width: '100px',
               isBreadCrumbs: true
            }, {
               title: 'second'
            }]);
         });

         it('new different items with same title', async function() {
            let items = [{
                  id: 0,
                  title: 'first',
                  counterCaption: 1
               }, {
                  id: 1,
                  title: 'first',
                  counterCaption: 2
               }].map(function(item) {
                  return new entity.Model({
                     keyProperty: 'id',
                     rawData: item
                  });
               }),
               header = [{
                  align: 'right',
                  width: '100px'
               }, {
                  title: 'second'
               }],
               cfg = {
                  items: items,
                  header: header,
                  displayProperty: 'title',
                  itemsPromise: new Promise((res) => {
                     res(items);
                  })
               },
               instance = new PathController();
            await instance._beforeMount(cfg);
            var headerInst = instance._header;
            instance.saveOptions({
               items: items
            });
            instance._beforeUpdate({
               header: header,
               items: items.slice(0, 1),
               displayProperty: 'title'
            });
            assert.notEqual(instance._header, headerInst);
            assert.deepEqual(instance._header, [{
               template: HeadingPathBack,
               templateOptions: {
                  backButtonStyle: undefined,
                  backButtonIconStyle: undefined,
                  backButtonFontColorStyle: undefined,
                  showArrowOutsideOfBackButton: false,
                  showActionButton: false,
                  items: items.slice(0, 1),
                  displayProperty: 'title',
                  itemsAndHeaderPromise: instance._itemsAndHeaderPromise
               },
               align: 'right',
               width: '100px',
               isBreadCrumbs: true
            }, {
               title: 'second'
            }]);
         });
      });
      it('_onBackButtonClick', function() {
         var instance = new PathController();
         instance.saveOptions({
            items: items,
            keyProperty: 'id',
            parentProperty: 'parent',
            root: null
         });
         instance._notify = function(e, args) {
            if (e === 'itemClick') {
               assert.equal(instance._options.items[instance._options.items.length - 2].get('parent'), args[0].get('parent'));
            }
         };
         instance._onBackButtonClick({
            stopPropagation: function() {

            }
         });
      });
      it('_onArrowClick', function() {
         var
            instance = new PathController(),
            onarrowActivatedFired = false;
         instance._notifyHandler = function(e) {
            if (e === 'arrowClick') {
               onarrowActivatedFired = true;
            }
         };
         instance._notifyHandler('arrowClick');
         assert.isTrue(onarrowActivatedFired);
      });
   });
});
