define(['Controls/_list/Controllers/PortionedSearch'], function(PortionedSearch) {
   describe('Controls.Controllers.PortionedSearch', function () {
      let portionedSearchController;
      let searchStopped = false;
      let searchAborted = false;
      let searchReseted = false;
      let serachContinued = false;
      let searchStarted = false;
      let stopSearchDirection = null;
      let clock;

      beforeEach(() => {
         clock = sinon.useFakeTimers();
         portionedSearchController = new PortionedSearch.default({
            searchStartCallback: () => {
               searchStarted = true;
            },
            searchStopCallback: (direction) => {
               searchStopped = true;
               stopSearchDirection = direction;
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
         stopSearchDirection = null;
      });

      it('startSearch', () => {
         portionedSearchController.startSearch();
         assert.isTrue(searchStarted);
         assert.isFalse(searchStopped);

         clock.tick(31000);
         assert.isTrue(searchStopped);
      });

      it('abortSearch', () => {
         portionedSearchController.startSearch();
         assert.isFalse(searchAborted);

         portionedSearchController.abortSearch();
         assert.isTrue(searchAborted);

         clock.tick(31000);
         assert.isFalse(searchStopped);
      });

      it('reset', () => {
         portionedSearchController.startSearch();
         assert.isFalse(searchReseted);

         portionedSearchController.reset();
         assert.isTrue(searchReseted);

         clock.tick(31000);
         assert.isFalse(searchStopped);
      });

      it('shouldSearch', () => {
         portionedSearchController.startSearch();
         assert.isTrue(portionedSearchController.shouldSearch());

         clock.tick(5000);
         assert.isTrue(portionedSearchController.shouldSearch());

         clock.tick(26000);
         assert.isFalse(portionedSearchController.shouldSearch());
      });

      it('continueSearch', () => {
         portionedSearchController.startSearch();
         clock.tick(31000);
         assert.isTrue(searchStopped);
         assert.isTrue(searchStarted);

         portionedSearchController.continueSearch();
         assert.isTrue(serachContinued);

         searchStopped = false;
         searchStarted = false;
         portionedSearchController.startSearch();
         clock.tick(31000);
         assert.isFalse(searchStopped);
         assert.isFalse(searchStarted);

         clock.tick(120000);
         assert.isTrue(searchStopped);
         assert.isFalse(searchStarted);
      });

      it('resetTimer', () => {
         portionedSearchController.startSearch();
         clock.tick(9000);
         assert.isFalse(searchStopped);

         portionedSearchController.resetTimer();
         clock.tick(9000);
         assert.isFalse(searchStopped);

         clock.tick(22000);
         assert.isTrue(searchStopped);
      });

      it('stopSearch', () => {
         portionedSearchController.startSearch();
         clock.tick(9000);
         assert.isFalse(searchStopped);

         portionedSearchController.stopSearch('down');
         assert.isTrue(searchStopped);
         assert.equal(stopSearchDirection, 'down');
      });

      it('destroy', () => {
         portionedSearchController.startSearch();
         portionedSearchController.destroy();

         clock.tick(31000);
         assert.isFalse(searchStopped);
      });
   });
});
