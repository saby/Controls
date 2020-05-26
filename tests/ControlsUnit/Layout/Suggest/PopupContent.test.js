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
               },
               showContent: true
            };

         layer.saveOptions({
            showContent: false
         });

         layer._beforeUpdate({showContent: true});
         assert.isFalse(layer._shouldScrollToBottom);
         assert.isTrue(layer._pendingShowContent);

         layer._showContent = false;
         layer._beforeUpdate(optionsReverseList);
         assert.isTrue(layer._shouldScrollToBottom);
         assert.isFalse(layer._showContent);
         assert.isTrue(layer._pendingShowContent);
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

         layer._showContent = false;
         layer._afterUpdate(oldOptions);

         assert.isTrue(resized);
         assert.isFalse(resultSended);
         assert.isFalse(layer._showContent);

         layer._showContent = true;
         layer._afterUpdate(oldOptions);

         assert.isTrue(resultSended);

         resultSended = false;
         layer._positionFixed = true;
         layer._pendingShowContent = true;
         layer._afterUpdate(oldOptions);
         assert.isFalse(resultSended);
         assert.isTrue(layer._showContent);
         assert.isNull(layer._pendingShowContent);

         layer.saveOptions(oldOptions);
         layer._showContent = true;
         layer._positionFixed = false;
         layer._afterUpdate(oldOptions);
         assert.isTrue(resultSended);
         assert.isTrue(layer._positionFixed);
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

});
