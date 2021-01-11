define([
   'Controls/_breadcrumbs/Utils',
   'Controls/_breadcrumbs/resources/FontLoadUtil',
   'Core/Deferred',
   'Controls/sizeUtils'
], function(
   BreadCrumbsUtil,
   FontLoadUtil,
   Deferred,
   sizeUtil
) {
   describe('Controls.BreadCrumbs.Utils', function() {
      var data, sandbox;
      BreadCrumbsUtil = BreadCrumbsUtil.default;

      const ARROW_WIDTH = 16;
      const BREAD_CRUMB_MIN_WIDTH = 36;
      const DOTS_WIDTH = 24;

      function stubWidthUtil() {
         const stub = sandbox.stub(sizeUtil.getWidth, 'getWidth');
         stub.withArgs('<span class="controls-BreadCrumbsView__arrow icon-size icon-DayForwardBsLine"></span>').returns(ARROW_WIDTH);
         stub.withArgs('<div class="controls-BreadCrumbsView__title_min"></div>').returns(BREAD_CRUMB_MIN_WIDTH);
         stub.withArgs('<div class="controls-BreadCrumbsView__crumb"><span class="controls-BreadCrumbsView__arrow icon-size icon-DayForwardBsLine controls-BreadCrumbsView__arrow_enabled"></span><div class="controls-BreadCrumbsView__titleWrapper"><div class="controls-BreadCrumbsView__title controls-BreadCrumbsView__title_enabled">...</div></div></div>').returns(DOTS_WIDTH);
      }
      let stubFontLoadUtil;
      beforeEach(function() {
         stubFontLoadUtil = sinon.stub(FontLoadUtil, 'waitForFontLoad').callsFake(() => {
            return Deferred.success();
         });
         data = [
            {
               id: 2,
               title: 'Notebooks 2'
            },
            {
               id: 3,
               title: 'Smartphones 3'
            },
            {
               id: 4,
               title: 'Record1'
            },
            {
               id: 5,
               title: 'Record2'
            },
            {
               id: 6,
               title: 'Record3eqweqweqeqweqweedsadeqweqewqeqweqweqw'
            }
         ];
         sandbox = sinon.createSandbox();
         stubWidthUtil();
      });

      afterEach(function() {
         sandbox.restore();
         stubFontLoadUtil.restore();
      });
   });
});
