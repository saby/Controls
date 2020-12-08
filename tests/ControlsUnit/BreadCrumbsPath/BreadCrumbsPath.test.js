define([
   'Controls/_breadcrumbs/MultilinePath',
   'Controls/_breadcrumbs/HeadingPath',
   'Controls/_breadcrumbs/Path',
   'Controls/_breadcrumbs/Utils',
   'Controls/_breadcrumbs/resources/FontLoadUtil',
   'Core/Deferred',
   'Types/entity'
], function(
    MultilinePath,
   HeadingPath,
   Path,
   BreadCrumbsUtil,
   FontLoadUtil,
   Deferred,
   entity
) {
   describe('Controls.BreadCrumbs.HeadingPath', function() {
      HeadingPath = HeadingPath.default;
      BreadCrumbsUtil = BreadCrumbsUtil.default;

      var path, data, drawBreadCrumbs;

      let stubFontLoadUtil;
      beforeEach(function() {
         stubFontLoadUtil = sinon.stub(FontLoadUtil, 'waitForFontLoad').callsFake(() => {
            return Deferred.success();
         });
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
         path = new HeadingPath();
         path.saveOptions({
            items: data.map(function(item) {
               return new entity.Model({
                  rawData: item
               });
            }),
            keyProperty: 'id',
            parentProperty: 'parent',
            root: null
         });
      });
      afterEach(function() {
         path = null;
         stubFontLoadUtil.restore();
      });
      describe('_afterMount', function() {
         afterEach(function() {
            BreadCrumbsUtil.drawBreadCrumbs = drawBreadCrumbs;
         });
      });

      it('_onBackButtonClick', function() {
         path._notify = function(e, args) {
            if (e === 'itemClick') {
               assert.equal(path._options.items[path._options.items.length - 2].get('parent'), args[0].get('parent'));
            }
         };
         path._onBackButtonClick({
            stopPropagation: function() {
            }
         });
      });

      it('_onHomeClick', function() {
         path._notify = function(e, args) {
            if (e === 'itemClick') {
               assert.equal(data[0].parent, args[0].get('id'));
            }
         };
         path._onHomeClick();
      });

      it('_onArrowClick', function() {
         var eventFired = false;
         path._notifyHandler = function(e) {
            if (e === 'arrowClick') {
               eventFired = true;
            }
         };
         path._notifyHandler('arrowClick');
         assert.isTrue(eventFired);
      });
   });

   describe('Controls.BreadCrumbs.Path', function() {

      var breadCrumbsPath = new Path.default({
            displayProperty: 'title',
            keyProperty: 'id'
         }),
         items = [
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
            }
         ],
         drawBreadCrumbs;
         drawBreadCrumbs = BreadCrumbsUtil.drawBreadCrumbs;
         BreadCrumbsUtil.drawBreadCrumbs = function() {

         };
         breadCrumbsPath.calculateBreadcrumbsUtil =  BreadCrumbsUtil;

      it('bread crumbs path update', function() {
         breadCrumbsPath._calculateBreadCrumbsToDraw([]);
         assert.equal(breadCrumbsPath._visibleItems.length, 0);
      });

      BreadCrumbsUtil.drawBreadCrumbs = drawBreadCrumbs;
   });
   describe('Controls.BreadCrumbs.MultilinePath', function() {
      var MultilinePathCrumbs = new MultilinePath.default();
      var Util = BreadCrumbsUtil.default;
      MultilinePathCrumbs.ARROW_WIDTH = 10;
      MultilinePathCrumbs.DOTS_WIDTH = 20;
      BreadCrumbsUtil.ARROW_WIDTH = 10;
      BreadCrumbsUtil.DOTS_WIDTH = 20;
      BreadCrumbsUtil.getMinWidth = () => {
         return 30;
      };
      // 2 крошки
      var options1 = {
         containerWidth: 100,
         displayProperty: 'title'
      };
      var options2 = {
         containerWidth: 350,
         displayProperty: 'title'
      };
      var options3 = {
         containerWidth: 320,
         displayProperty: 'title'
      };
      var items1 = [
         {
            id: 1,
            title: 'Очень длинное название',
            secondTitle: 'тест1',
            parent: null
         },
         {
            id: 2,
            title: 'Длинное название второй папки',
            secondTitle: 'тест2',
            parent: 1
         }
      ].map((item) => {
         return new entity.Model({
            rawData: item,
            keyProperty: 'id'
         });
      });
      // несколько крошек
      var items2 = [
         {
            id: 1,
            title: 'Очень длинное название',
            secondTitle: 'тест1',
            parent: null
         },
         {
            id: 2,
            title: 'Длинное название второй папки',
            secondTitle: 'тест2',
            parent: 1
         },
         {
            id: 2,
            title: 'Длинное название папки',
            secondTitle: 'тест2',
            parent: 1
         },
         {
            id: 2,
            title: 'Длинное название папки',
            secondTitle: 'тест2',
            parent: 1
         }
      ].map((item) => {
         return new entity.Model({
            rawData: item,
            keyProperty: 'id'
         });
      });
      it('2 crumbs', function() {
         BreadCrumbsUtil.getItemsWidth = () => {
            return [50, 50];
         };
         MultilinePathCrumbs._width = 100;
         MultilinePathCrumbs._calculateBreadCrumbsToDraw(items1, options1);
         assert.isTrue(MultilinePathCrumbs._visibleItemsFirst.length === 2);
         assert.isTrue(MultilinePathCrumbs._visibleItemsSecond.length === 0);
      });
      it('несколько крошек, причем последняя не влезает в первый контейнер без сокращения', function() {
         BreadCrumbsUtil.getItemsWidth = () => {
            return [100, 100, 100, 100];
         };
         MultilinePathCrumbs._width = 350;
         MultilinePathCrumbs._calculateBreadCrumbsToDraw(items2, options2);
         assert.isTrue(MultilinePathCrumbs._visibleItemsFirst.length === 4);
         // последняя крошка сократилась, а не упала вниз.
         assert.isTrue(MultilinePathCrumbs._visibleItemsSecond.length === 0);
      });
      it('несколько крошек, причем последняя не влезает в первый контейнер с сокращением', function() {
         BreadCrumbsUtil.getItemsWidth = () => {
            return [100, 100, 100, 100];
         };
         MultilinePathCrumbs._width = 320;
         MultilinePathCrumbs._calculateBreadCrumbsToDraw(items2, options3);
         assert.isTrue(MultilinePathCrumbs._visibleItemsFirst.length === 3);
         assert.isTrue(MultilinePathCrumbs._visibleItemsSecond.length === 1);
      });

      it('path caption', () => {
         const hPath = new HeadingPath();
         const record = {
            get: () => '123'
         };
         const items = ['111', record];
         let result = hPath._getCounterCaption(items);
         assert.equal(result, '123');

         result = hPath._getCounterCaption([]);
         assert.equal(result, undefined);
      });
   });
});
