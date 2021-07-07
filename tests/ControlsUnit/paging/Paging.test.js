/**
 * Created by kraynovdo on 02.03.2018.
 */
define([
   'Controls/paging'
], function(pagingLib) {
   describe('Controls.List.Paging', function() {
      var result = false;
      it('initArrowDefaultStates', function() {
         var pg = new pagingLib.Paging();

         pg._initArrowDefaultStates({});
         assert.equal('disabled', pg._stateBackward, 'Wrong default state');
         assert.equal('disabled', pg._stateForward, 'Wrong default state');


          pg._initArrowDefaultStates({
              arrowState: {
                  begin: "visible",
                  end: "visible",
                  next: "visible",
                  prev: "visible"
              }
          });
         assert.equal('normal', pg._stateBackward, 'Wrong default state');
         assert.equal('normal', pg._stateForward, 'Wrong default state');
      });

      it('initArrowStateBySelectedPage', function() {

         var cfg = {
            pagesCount: 5,
            selectedPage: 1
         };
         var pg = new pagingLib.Paging(cfg);

         pg._initArrowStateBySelectedPage(cfg);
         assert.equal('disabled', pg._stateBackward, 'Wrong arrow state in begin position');
         assert.equal('normal', pg._stateForward, 'Wrong arrow state in begin position');

         cfg = {
            pagesCount: 5,
            selectedPage: 3
         };
         pg._initArrowStateBySelectedPage(cfg);
         assert.equal('normal', pg._stateBackward, 'Wrong arrow state in middle position');
         assert.equal('normal', pg._stateForward, 'Wrong arrow state in middle position');

         cfg = {
            pagesCount: 5,
            selectedPage: 5
         };
         pg._initArrowStateBySelectedPage(cfg);
         assert.equal('normal', pg._stateBackward, 'Wrong arrow state in end position');
         assert.equal('disabled', pg._stateForward, 'Wrong arrow state in end position');
      });

      it('changePage', function() {
         var cfg = {
            selectedPage: 3
         };
         var pg = new pagingLib.Paging(cfg);
         pg.saveOptions(cfg);

         //определяем нотифай, чтоб понять произошел ли он
         pg._notify = function() {
            result = true;
         };

         result = false;
         pg._changePage(1);
         assert.isTrue(result, 'Wasn\'t notify after change page');

         result = false;
         pg._changePage(3);
         assert.isFalse(result, 'Was notify without change page');
      });
      it('life cycle', function() {
         var cfg1 = {
            showDigits: true,
            selectedPage: 3,
            pagesCount: 5
         };
         var cfg2 = {
         };
         var pg = new pagingLib.Paging(cfg1);
         pg.saveOptions(cfg1);
         pg._beforeMount(cfg1);

         assert.equal('normal', pg._stateBackward, 'Wrong arrow state in _beforeMount');
         assert.equal('normal', pg._stateForward, 'Wrong arrow state in _beforeMount');

         cfg1.selectedPage = 5;
         pg._beforeUpdate(cfg1);
         assert.equal('normal', pg._stateBackward, 'Wrong arrow state in _beforeUpdate');
         assert.equal('disabled', pg._stateForward, 'Wrong arrow state in _beforeUpdate');

         pg = new pagingLib.Paging(cfg1);
         pg.saveOptions(cfg1);
         pg._beforeMount(cfg2);
         assert.equal('disabled', pg._stateBackward, 'Wrong default state');
         assert.equal('disabled', pg._stateForward, 'Wrong default state');

         pg = new pagingLib.Paging(cfg1);
         pg.saveOptions(cfg1);
         pg._beforeUpdate(cfg2);
         assert.equal('disabled', pg._stateBackward, 'Wrong default state');
         assert.equal('disabled', pg._stateForward, 'Wrong default state');
      });

      it('click', function() {
         var cfg1 = {
            showDigits: true,
            selectedPage: 3,
            pagesCount: 5
         };

         var pg = new pagingLib.Paging(cfg1);
         pg.saveOptions(cfg1);
         // определяем нотифай, чтоб понять произошел ли он
         pg._notify = function(eName, args) {
            if (eName === 'selectedPageChanged') {
               result = args[0];
            }
         };

         // проверяем клик на цифру
         result = null;
         pg._digitClick({}, 1);
         assert.equal(1, result, 'Wrong page after change page');

         // проверяем клики на стрелки
         result = null;
         pg._arrowClick({}, 'Begin', 'Backward');
         assert.equal(1, result, 'Wrong page after change page');
         pg._arrowClick({}, 'End', 'Forward');
         assert.equal(5, result, 'Wrong page after change page');
         pg._arrowClick({}, 'Prev', 'Backward');
         assert.equal(2, result, 'Wrong page after change page');
         pg._arrowClick({}, 'Next', 'Forward');
         assert.equal(4, result, 'Wrong page after change page');

         // проверяем клики на задизабленные стрелки
         cfg1 = {
            showDigits: true,
            selectedPage: 1,
            pagesCount: 5
         };
         pg._beforeUpdate(cfg1);
         pg.saveOptions(cfg1);

         result = 0;
         pg._arrowClick({}, 'Begin', 'Backward');
         assert.equal(0, result, 'Arrow was clicked in disabled state');
      });
   });


});
