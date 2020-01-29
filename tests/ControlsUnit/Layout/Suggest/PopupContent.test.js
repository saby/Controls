define(['Controls/_suggestPopup/Layer/__PopupContent', 'wml!Controls/_suggestPopup/Layer/__PopupContent', 'Core/Deferred'], function(PopupContent, popupContentTemplate, Deferred) {

   function removeConfigFromMarkup(markup) {
      var result = markup.replace(/ ?(ws-delegates-tabfocus|ws-creates-context|__config|config|tabindex|name)=".+?"/g, '');
      return result.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
   }

   function getMarkup(template, templateArgs) {
      var result = template(templateArgs);
      var def = new Deferred();

      if (result && result.then) {
         result.then(function(res) {
            def.callback(removeConfigFromMarkup(res));
         });
         return def;
      } else {
         return Deferred.success(removeConfigFromMarkup(result));
      }
   }

   describe('Controls._suggestPopup.Layer.__PopupContent', function() {
      it('_beforeUpdate', function() {
         let layer = new PopupContent.default(),
            optionsReverseList = {
               stickyPosition: {
                  direction: {
                     vertical: 'top'
                  }
               }
            };

         layer._beforeUpdate({});
         assert.isFalse(layer._shouldScrollToBottom);

         layer._beforeUpdate(optionsReverseList);
         assert.isTrue(layer._shouldScrollToBottom);
      });

      it('afterUpdate', function() {
         var options = {
            showContent: true
         };

         var oldOptions = {
            showContent: false
         };

         var layer = new PopupContent.default();
         var resized = false;
         var resultSended = false;

         layer.saveOptions(options);
         layer._notify = function(eventName) {
            if (eventName === 'controlResize') {
               resized = true;
            }

            if (eventName === 'sendResult') {
               resultSended = true;
            }
         };

         layer._afterUpdate(oldOptions);

         assert.isTrue(resized);
         assert.isTrue(resultSended);

         resultSended = false;
         layer._positionFixed = true;
         layer._afterUpdate(oldOptions);
         assert.isFalse(resultSended);

         layer.saveOptions(oldOptions);
         layer._positionFixed = false;
         layer._afterUpdate(oldOptions);
         assert.isFalse(resultSended);
      });

      it('resize', function() {
         let
            isScrollToBottom = false,
            layer = new PopupContent.default();

         layer._children = {
            scrollContainer: {
               scrollToBottom: () => {isScrollToBottom = true;}
            }
         };

         layer.resize();
         assert.isFalse(isScrollToBottom);

         layer._reverseList = true;
         layer.resize();
         assert.isTrue(isScrollToBottom);
      });

      it('_private.getSuggestWidth', function() {
         var originGetBorderWidth = PopupContent.default._private.getBorderWidth;
         PopupContent.default._private.getBorderWidth = function() {
            return 2;
         }

         var target = {
            offsetWidth: 50
         }
         var container = {};

         assert.equal(PopupContent.default._private.getSuggestWidth(target, container), 48);
         PopupContent.default._private.getBorderWidth = originGetBorderWidth;
      });

      it('_beforePaint', function() {
         const layer = new PopupContent.default();
         let isScrollToBottom = false;

         layer._children = {
            scrollContainer: {
               scrollToBottom: () => {isScrollToBottom = true;}
            }
         };

         layer._beforePaint();
         assert.isFalse(isScrollToBottom);

         layer._shouldScrollToBottom = true;
         layer._beforePaint();
         assert.isTrue(isScrollToBottom);
      });

   });

   describe('Controls._suggestPopup.Layer.__PopupContent template tests', function() {

      it('showContent:false', function(done) {
         var standardMarkup = '<div class="controls-Suggest__suggestionsContainer controls-Suggest__suggestionsContainer_popup controls-Suggest__suggestionsContainer_popup_shadow_ controls-Suggest__suggestionsContainer_hidden"><div class="controls-Scroll ws-flexbox ws-flex-column controls-Suggest__scrollContainer" hasMarkup="true" data-component="Controls/scroll:Container"><span class="controls-Scroll__content controls-BlockLayout__blockGroup controls-Scroll__content_hideNativeScrollbar controls-Scroll__content_hidden"></span><div></div></div></div>';

         getMarkup(popupContentTemplate, {_options: {showContent: false, target: {offsetWidth: ''}, content: '', stickyPosition: {direction: {vertical: ''}}}}).addCallback(function(res) {
            assert.equal(res, standardMarkup);
            done();
         });
      });

      it('showContent:true', function(done) {
         var standardMarkup = '<div class="controls-Suggest__suggestionsContainer controls-Suggest__suggestionsContainer_popup controls-Suggest__suggestionsContainer_popup_shadow_"><div class="controls-Scroll ws-flexbox ws-flex-column controls-Suggest__scrollContainer" hasMarkup="true" data-component="Controls/scroll:Container"><span class="controls-Scroll__content controls-BlockLayout__blockGroup controls-Scroll__content_hideNativeScrollbar controls-Scroll__content_hidden"></span><div></div></div></div>';

         getMarkup(popupContentTemplate, {_options: {showContent: true, target: {offsetWidth: ''},  content: '', stickyPosition: {direction: {vertical: ''}}}}).addCallback(function(res) {
            assert.equal(res, standardMarkup);
            done();
         });
      });

      it('target.offsetWidth:300px', function(done) {
         var standardMarkup = '<div class="controls-Suggest__suggestionsContainer controls-Suggest__suggestionsContainer_popup controls-Suggest__suggestionsContainer_popup_shadow_ controls-Suggest__suggestionsContainer_hidden"><div class="controls-Scroll ws-flexbox ws-flex-column controls-Suggest__scrollContainer" hasMarkup="true" data-component="Controls/scroll:Container"><span class="controls-Scroll__content controls-BlockLayout__blockGroup controls-Scroll__content_hideNativeScrollbar controls-Scroll__content_hidden"></span><div></div></div></div>';

         getMarkup(popupContentTemplate, {_options: {target: {offsetWidth: 300}, content: '', stickyPosition: {direction: {vertical: ''}}}}).addCallback(function(res) {
            assert.equal(res, standardMarkup);
            done();
         });
      });

      it('verticalAling', function(done) {
         var standardMarkup = '<div class="controls-Suggest__suggestionsContainer controls-Suggest__suggestionsContainer_popup controls-Suggest__suggestionsContainer_popup_shadow_top controls-Suggest__suggestionsContainer_hidden"><div class="controls-Scroll ws-flexbox ws-flex-column controls-Suggest__scrollContainer" hasMarkup="true" data-component="Controls/scroll:Container"><span class="controls-Scroll__content controls-BlockLayout__blockGroup controls-Scroll__content_hideNativeScrollbar controls-Scroll__content_hidden"></span><div></div></div></div>';

         getMarkup(popupContentTemplate, {_options: {target: {offsetWidth: 300}, content: '', stickyPosition: {direction: {vertical: 'top'}}}}).addCallback(function(res) {
            assert.equal(res, standardMarkup);
            done();
         });
      });

   });

});
