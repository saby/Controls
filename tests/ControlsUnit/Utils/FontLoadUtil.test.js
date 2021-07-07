define(['Controls/_breadcrumbs/resources/FontLoadUtil'], function(FontLoadUtil) {

   describe('Controls/_breadcrumbs/resources/FontLoadUtil', function() {

      it('waitForFontLoad should load font once', function() {

         return new Promise(function(resolve) {

            FontLoadUtil.waitForFontLoad('test', () => true).addCallback(function() {
               assert.isTrue(FontLoadUtil.__loadedFonts.test);
               resolve();
            });
         });
      });
   });
});
