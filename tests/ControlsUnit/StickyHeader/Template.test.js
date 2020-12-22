define(
   [
      'Controls/scroll',
      'Env/Env',
      'ControlsUnit/resources/TemplateUtil',
      'Controls/_scroll/StickyHeader/Utils',
      'Controls/_scroll/StickyHeader',
      'UI/Base'
   ],
   function(scroll, Env, TemplateUtil, StickyHeaderUtils, _StickyHeaderLib, UIBase) {

      'use strict';

      const _StickyHeader = _StickyHeaderLib.default;

      describe('Controls.StickyHeader.Template', function() {
         var ctrl, template, inst, compat;

         before(function() {
            compat = Env.constants.compat;
            Env.constants.compat = true;
         });

         beforeEach(function() {
            inst = new UIBase.Control();
            inst._stickyHeadersHeight = {
               top: 0,
               bottom: 0
            };
            inst._context = {
               stickyHeader: new scroll._stickyHeaderContext({shadowPosition: ''})
            };
            inst._options = {
               fixedZIndex: 2,
               position: 'top'
            };
            inst._model = {};
         });

         after(function() {
            Env.constants.compat = compat;
         });

         describe('StickyHeader', function() {
            beforeEach(function() {
               ctrl = new scroll.StickyHeader({});
               ctrl._container = {
                  offsetParent: true
               };
               template = TemplateUtil.clearTemplate(ctrl._template);
            });

            it('The browser does not support sticky', function() {
               inst._isStickySupport = false;
               inst._options.theme = 'default';
               inst._options.content = TemplateUtil.content;

               assert.equal(template(inst), '<div class="controls-background-default_theme-default"><div>testing the template</div></div>');
            });
         });

         describe('_StickyHeader', function() {
            beforeEach(function() {
               ctrl = new _StickyHeader({});
               inst._options = _StickyHeader.getDefaultOptions();
               inst._container = {};
               inst._updateStyles = ctrl._updateStyles;
               inst._updateStyle = ctrl._updateStyle;
               inst._updateShadowStyles = ctrl._updateShadowStyles;
               inst._updateObserversStyles = ctrl._updateObserversStyles;
               inst._getStyle = ctrl._getStyle;
               inst._isShadowVisible = ctrl._isShadowVisible;
               inst._isShadowVisibleByScrollState = ctrl._isShadowVisibleByScrollState;
               inst._getObserverStyle = ctrl._getObserverStyle;
               inst._options.shadowVisibility = 'visible';
               inst._reverseOffsetStyle = ctrl._reverseOffsetStyle;
               inst._getBottomShadowStyle = ctrl._getBottomShadowStyle;
               inst._getNormalizedContainer = ctrl._getNormalizedContainer;
               inst._getComputedStyle = () => {
                  return {};
               };
               inst._scrollState = {};
               template = TemplateUtil.clearTemplate(ctrl._template);
            });

            it('On the desktop platform', function() {
               inst._isMobilePlatform = false;
               inst._model.fixedPosition = 'top';
               inst._options.theme = 'default';
               inst._options.content = function() {
                  return ''
               };
               inst._scrollState = {
                  hasUnrenderedContent: {
                     top: false,
                     bottom: false
                 }
               };
               inst._isStickySupport = true;

               inst._updateStyles(inst._options);

               assert.equal(template(inst), '<div class="controls-StickyHeader controls-background-default_theme-default controls-StickyHeader__background controls-StickyHeader_position" style="top: 0px;z-index: 2;">' +
                  '<div class="controls-StickyHeader__observationTargetTop" style="top: -2px;"></div>' +
                  '<div class="controls-StickyHeader__observationTargetBottom" style="bottom: -2px;"></div>' +
                  '</div>');
            });

            it('On the mobile platform', function() {
               var sandbox = sinon.createSandbox();

               sandbox.stub(StickyHeaderUtils, 'getGapFixSize').returns(1);
               inst._model.fixedPosition = 'top';
               sandbox.replace(inst, '_getComputedStyle', function() {
                  return {'padding-top': '0px'};
               });
               inst._container = {style: {paddingTop: ''}};
               inst._options.theme = 'default';
               inst._options.content = function() {
                  return ''
               };
               inst._scrollState = {
                  hasUnrenderedContent: {
                     top: false,
                     bottom: false
                 }
               };
               inst._isStickySupport = true;

               inst._updateStyles(inst._options);

               assert.equal(template(inst), '<div class="controls-StickyHeader controls-background-default_theme-default controls-StickyHeader__background controls-StickyHeader_position" style="top: -1px;padding-top:1px;margin-top: -1px;z-index: 2;">' +
                  '<div class="controls-StickyHeader__observationTargetTop" style="top: -2px;"></div>' +
                  '<div class="controls-StickyHeader__observationTargetBottom" style="bottom: -2px;"></div>' +
                  '</div>');
               sandbox.restore();
            });

            it('Move the header', function() {
               inst._options.theme = 'default';
               inst._options.content = function() {
                  return ''
               };
               inst._scrollState = {
                  hasUnrenderedContent: {
                     top: false,
                     bottom: false
                 }
               };
               inst._isStickySupport = true;

               inst._updateStyles(inst._options);

               assert.equal(template(inst), '<div class="controls-StickyHeader controls-background-default_theme-default controls-StickyHeader__background controls-StickyHeader_position" style="top: 0px;">' +
                  '<div class="controls-StickyHeader__observationTargetTop" style="top: -2px;"></div>' +
                  '<div class="controls-StickyHeader__observationTargetBottom" style="bottom: -2px;"></div>' +
                  '</div>');
            });

            it('Move the bottom', function() {
               inst._options.position = 'bottom';
               inst._options.theme = 'default';
               inst._options.content = function() {
                  return ''
               };
               inst._scrollState = {
                  hasUnrenderedContent: {
                     top: false,
                     bottom: false
                 }
               };
               inst._isStickySupport = true;

               inst._updateStyles(inst._options);

               assert.equal(template(inst), '<div class="controls-StickyHeader controls-background-default_theme-default controls-StickyHeader__background controls-StickyHeader_position" style="bottom: 0px;">' +
                  '<div class="controls-StickyHeader__observationTargetTop" style="top: -2px;"></div>' +
                  '<div class="controls-StickyHeader__observationTargetBottom" style="bottom: -2px;"></div>' +
                  '</div>');
            });

            it('Added content', function() {
               inst._options.content = TemplateUtil.content;
               inst._options.theme = 'default';
               inst._scrollState = {
                  hasUnrenderedContent: {
                     top: false,
                     bottom: false
                 }
               };
               inst._isStickySupport = true;

               inst._updateStyles(inst._options);

               assert.equal(template(inst), '<div class="controls-StickyHeader controls-background-default_theme-default controls-StickyHeader__background controls-StickyHeader_position" style="top: 0px;">' +
                  '<div class="controls-StickyHeader__observationTargetTop" style="top: -2px;"></div>' +
                  '<div class="controls-StickyHeader__content">testing the template</div>' +
                  '<div class="controls-StickyHeader__observationTargetBottom" style="bottom: -2px;"></div>' +
                  '</div>');
            });

            it('The header is fixed, but there should be no shadow', function() {
               inst._scrollState.verticalPosition = 'end';
               inst._isFixed = true;
               inst._isShadowVisibleByController = true;
               inst._model.fixedPosition = 'top';
               inst._options.fixedZIndex = 1;
               inst._options.content = TemplateUtil.content;
               inst._options.theme = 'default';
               inst._scrollState = {
                  hasUnrenderedContent: {
                     top: true,
                     bottom: true
                 }
               };
               inst._isStickySupport = true;

               inst._updateStyles(inst._options);

               assert.equal(template(inst), '<div class="controls-StickyHeader controls-background-default_theme-default controls-StickyHeader__background controls-StickyHeader_position" style="top: 0px;z-index: 1;">' +
                  '<div class="controls-StickyHeader__observationTargetTop" style="top: -2px;"></div>' +
                  '<div class="controls-StickyHeader__content">testing the template</div>' +
                  '<div class="controls-StickyHeader__observationTargetBottom" style="bottom: -2px;"></div>' +
                  '<div class="controls-Scroll__shadow controls-StickyHeader__shadow-bottom controls-Scroll__shadow_horizontal"></div>' +
                  '</div>');
            });

            it('The header is fixed, the shadow should be', function() {
               inst._scrollState.verticalPosition = 'start';
               inst._isFixed = true;
               inst._isShadowVisibleByController = true;
               inst._scrollState = {
                  hasUnrenderedContent: {
                     top: true,
                     bottom: true
                 }
               };
               inst._isStickySupport = true;
               inst._model.fixedPosition = 'bottom';
               inst._options.fixedZIndex = 2;
               inst._options.position = 'bottom';
               inst._options.content = TemplateUtil.content;
               inst._options.theme = 'default';

               inst._updateStyles(inst._options);

               assert.equal(template(inst), '<div class="controls-StickyHeader controls-background-default_theme-default controls-StickyHeader__background controls-StickyHeader_position" style="bottom: 0px;z-index: 2;">' +
                  '<div class="controls-Scroll__shadow controls-StickyHeader__shadow-top controls-Scroll__shadow_horizontal"></div>' +
                  '<div class="controls-StickyHeader__observationTargetTop" style="top: -2px;"></div>' +
                  '<div class="controls-StickyHeader__content">testing the template</div>' +
                  '<div class="controls-StickyHeader__observationTargetBottom" style="bottom: -2px;"></div>' +
                  '</div>');
            });
         });
      });
   }
);
