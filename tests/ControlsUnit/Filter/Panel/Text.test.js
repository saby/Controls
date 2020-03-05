define(['Controls/_filterPopup/Panel/Text'
], function(Text) {
   describe('Controls/_filterPopup/Panel/Text', function() {

      describe('life hooks', function() {

         it('_beforeMount', function() {
            var textControl = new Text();
            var textValue;
            var controlValue;

            textControl.saveOptions({ caption: 'test', value: true });
            textControl._notify = function(eventName, value) {
               if (eventName === 'valueChanged') {
                  controlValue = value[0];
               } else {
                  textValue = value[0];
               }
            };

            textControl._afterMount();

            assert.equal(controlValue, true);
            assert.equal(textValue, 'test');
         });

      });

   });
});
