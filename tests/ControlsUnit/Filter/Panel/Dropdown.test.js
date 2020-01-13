define(['Controls/filterPopup'], function(filterPopup) {
   describe('filterPopup:Dropdown', function() {

      var sandbox;
      var dropDown;

      beforeEach(() => {
         dropDown = new filterPopup.Dropdown();
      });

      before(() => {
         sandbox = sinon.createSandbox();
      });

      afterEach(() => {
         sandbox.restore();
         dropDown = null;
      });

      after(() => {
         sandbox = null;
      });

      it('_selectedKeysChangedHandler', function() {
         let selectedKeysEventFired = false;
         let eventResult;

         dropDown._notify = function(event, value) {
            selectedKeysEventFired = true;
            return 'testResult';
         };


         eventResult = dropDown._selectedKeysChangedHandler();

         assert.equal(eventResult, 'testResult');
         assert.isTrue(selectedKeysEventFired);
      });

      it('_dropDownOpen', function() {
         const notifyStub = sandbox.stub(dropDown, '_notify');
         dropDown._dropDownOpen({});
         assert.isTrue(notifyStub.withArgs('dropDownOpen').calledOnce);
      });

      it('_dropDownClose', function() {
         const notifyStub = sandbox.stub(dropDown, '_notify');
         dropDown._dropDownClose({});
         assert.isTrue(notifyStub.withArgs('dropDownClose').calledOnce);
      });

   });
});
