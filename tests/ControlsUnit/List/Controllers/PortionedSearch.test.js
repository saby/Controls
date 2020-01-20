define(['Controls/_list/Controllers/PortionedSearch'], function(PortionedSearch) {
   describe('Controls.Controllers.PortionedSearch', function () {
      let portionedSearchController;
      let searchStopped = false;
      let searchAborted = false;
      let searchReseted = false;
      let serachContinued = false;
      let clock;

      beforeEach(() => {
         clock = sinon.useFakeTimers();
         portionedSearchController = new PortionedSearch.default({
            searchStopCallback: () => {
               searchStopped = true;
            },
            searchResetCallback: () => {
               searchReseted = true;
            },
            searchContinueCallback: () => {
               serachContinued = true;
            },
            searchAbortCallback: () => {
               searchAborted = true;
            }
         });
      });

      afterEach(() => {
         clock.restore();
         searchStopped = false;
         searchAborted = false;
         searchReseted = false;
         serachContinued = false;
         portionedSearchController = null;
      });

      it('startSearch', () => {
         portionedSearchController.startSearch();
         assert.isFalse(searchStopped);

         clock.tick(11000);
         assert.isTrue(searchStopped);
      });

      it('abortSearch', () => {
         portionedSearchController.startSearch();
         assert.isFalse(searchAborted);

         portionedSearchController.abortSearch();
         assert.isTrue(searchAborted);

         clock.tick(11000);
         assert.isFalse(searchStopped);
      });

      it('reset', () => {
         portionedSearchController.startSearch();
         assert.isFalse(searchReseted);

         portionedSearchController.reset();
         assert.isTrue(searchReseted);

         clock.tick(11000);
         assert.isFalse(searchStopped);
      });

      it('shouldSearch', () => {
         portionedSearchController.startSearch();
         assert.isTrue(portionedSearchController.shouldSearch());

         clock.tick(5000);
         assert.isTrue(portionedSearchController.shouldSearch());

         clock.tick(11000);
         assert.isFalse(portionedSearchController.shouldSearch());
      });

      it('continueSearch', () => {
         portionedSearchController.startSearch();
         clock.tick(11000);
         assert.isTrue(searchStopped);

         portionedSearchController.continueSearch();
         assert.isTrue(serachContinued);

         searchStopped = false;
         portionedSearchController.startSearch();
         clock.tick(11000);
         assert.isFalse(searchStopped);
      });

      it('resetTimer', () => {
         portionedSearchController.startSearch();
         clock.tick(9000);
         assert.isFalse(searchStopped);

         portionedSearchController.resetTimer();
         clock.tick(9000);
         assert.isFalse(searchStopped);

         clock.tick(9000);
         assert.isTrue(searchStopped);
      });
   });
});
