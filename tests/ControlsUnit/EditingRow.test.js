define(['Controls/_list/EditInPlace/EditingRow'], function(EditingRow) {
   describe('Controls.List.EditInPlace.EditingRow', function() {
      it('_onKeyDown', function() {
         var
            editingRow = new EditingRow.default({}),
            testEvents = [
               {
                  isStopped: false,
                  nativeEvent: {
                     keyCode: 13
                  },
                  target: {
                     closest: function() {
                        return false;
                     }
                  },
                  stopPropagation: function() {
                     this.isStopped = true;
                  }
               },
               {
                  isStopped: false,
                  nativeEvent: {
                     keyCode: 13
                  },
                  target: {
                     closest: function() {
                        return true;
                     }
                  },
                  stopPropagation: function() {
                     this.isStopped = true;
                  }
               },
               {
                  isStopped: false,
                  nativeEvent: {
                     keyCode: 9
                  },
                  target: {
                     closest: function() {
                        return false;
                     }
                  },
                  stopPropagation: function() {
                     this.isStopped = true;
                  }
               },
               {
                  isStopped: false,
                  nativeEvent: {
                     keyCode: 27
                  },
                  target: {
                     closest: function() {
                        return false;
                     }
                  },
                  stopPropagation: function() {
                     this.isStopped = true;
                  }
               }
            ],
            testResults = [true, false, false, true];
         testEvents.forEach(function(testEvent, index) {
            editingRow._onKeyDown(testEvent);
            assert.equal(testEvent.isStopped, testResults[index], 'Invalid call stopPropagation on step #' + index);
         });
      });
   });
});
