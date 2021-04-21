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
            var instance = new PathController.default();
            instance._beforeMount({
               itemsPromise: new Promise((res) => {
                  res(null);
               })
            });
            assert.isNotOk(instance._header);
         });
         it('with header, first item has title', function() {
            var
               instance = new PathController.default(),
               header = [{
                  title: '123'
               }];
            instance._beforeMount({
               header: header,
               itemsPromise: new Promise((res) => {
                  res(null);
               })
            });
            assert.deepEqual(instance._header, [{
               title: '123'
            }]);
         });
         it('with header, first item has caption', function() {
            var
               instance = new PathController.default(),
               header = [{
                  caption: '123'
               }];
            instance._beforeMount({
               header: header,
               itemsPromise: new Promise((res) => {
                  res(null);
               })
            });
            assert.deepEqual(instance._header, [{
               caption: '123'
            }]);
         });
         it('with header, first item has template', function() {
            var
               instance = new PathController.default(),
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
               instance = new PathController.default(),
               header = [{
                  align: 'right',
                  width: '100px'
               }, {
                  title: 'second'
               }];
            instance._beforeMount({
               header: header,
               items: items,
               displayProperty: 'title'
            });
            assert.deepEqual(instance._header, [{
               template: HeadingPathBack.default,
               templateOptions: {
                  items: items,
                  displayProperty: 'title',
                  backButtonStyle: undefined,
                  backButtonCaption: undefined,
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
         const needShadow = PathController.default._isNeedShadow;
         it('there is no header, we need shadow', function() {
            assert.isTrue(needShadow(undefined));
         });
         it('there is header, we do not need shadow', function() {
            assert.isFalse(needShadow([{ caption: 'title' }]));
         });
         it('there is header, we do not need shadow', function() {
            assert.isFalse(needShadow([{ caption: '' }]));
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
               instance = new PathController.default(cfg);
            instance.saveOptions(cfg);
            await instance._beforeMount(cfg);
            assert.equal(1, instance._header.length);
            instance._beforeUpdate(newCfg);
            assert.equal(2, instance._header.length);
            instance._beforeUpdate(newCfg2);
            assert.deepEqual(instance._header, []);
         });
         it('new same items', async function() {
            const header = [
               {
                  align: 'right',
                  width: '100px'
               },
               {
                  title: 'second'
               }
            ];
            const cfg = {
               items: items,
               header: header,
               displayProperty: 'title'
            };

            const instance = new PathController.default();
            instance._header = [];
            instance.saveOptions(cfg);

            instance._beforeMount(cfg);
            const headerInst = instance._header;

            instance._beforeUpdate({
               header: header,
               items: items.slice(),
               displayProperty: 'title'
            });
            assert.equal(instance._header, headerInst);
         });

         it('new different items', function() {

            var
               instance = new PathController.default(),
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
               items: items.slice(0, 1),
               displayProperty: 'title'
            });
            assert.deepEqual(instance._header, [{
               template: HeadingPathBack.default,
               templateOptions: {
                  displayProperty: 'title',
                  items: items.slice(0, 1),
                  backButtonStyle: undefined,
                  backButtonCaption: undefined,
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
               },
               instance = new PathController.default();
            await instance._beforeMount(cfg);
            const headerInst = instance._header;
            instance.saveOptions({
               items: items,
            });
            instance._beforeUpdate({
               header: header,
               items: itemsNew,
               displayProperty: 'title'
            });
            assert.notEqual(instance._header, headerInst);
            assert.deepEqual(instance._header, [{
               template: HeadingPathBack.default,
               templateOptions: {
                  backButtonStyle: undefined,
                  backButtonCaption: undefined,
                  backButtonIconStyle: undefined,
                  backButtonFontColorStyle: undefined,
                  showArrowOutsideOfBackButton: false,
                  showActionButton: false,
                  displayProperty: 'title',
                  items: itemsNew
               },
               align: 'right',
               width: '100px',
               isBreadCrumbs: true
            }, {
               title: 'second'
            }]);
         });

         it('new different items with same title', function() {
            const header = [
               {
                  align: 'right',
                  width: '100px'
               },
               {
                  title: 'second'
               }
            ];
            const cfg = {
               items: items,
               header: header,
               displayProperty: 'title',
            };
            const instance = new PathController.default();

            instance._beforeMount(cfg);
            const headerInst = instance._header;

            instance.saveOptions({
               items: items
            });
            instance._beforeUpdate({
               header: header,
               items: items.slice(0, 1),
               displayProperty: 'title'
            });
            assert.notEqual(instance._header, headerInst);
            assert.deepEqual(instance._header, [
               {
                  template: HeadingPathBack.default,
                  templateOptions: {
                     backButtonStyle: undefined,
                     backButtonCaption: undefined,
                     backButtonIconStyle: undefined,
                     backButtonFontColorStyle: undefined,
                     showArrowOutsideOfBackButton: false,
                     showActionButton: false,
                     items: items.slice(0, 1),
                     displayProperty: 'title'
                  },
                  align: 'right',
                  width: '100px',
                  isBreadCrumbs: true
               },
               {
                  title: 'second'
               }
            ]);
         });
      });

      it('_onBackButtonClick', function() {
         var instance = new PathController.default();
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
         instance.goBack({
            stopPropagation: function() {

            }
         });
      });
      it('_onArrowClick', function() {
         var
            instance = new PathController.default(),
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
