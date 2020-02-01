define([
   'Controls/progress'
], function(progress) {
   describe('Controls.progress:StateIndicator', function() {
      it('calculateColorState 10 sectors, 1 values', function() {
         var psi, data, opts, numSectors, colors;
         psi = new progress.StateIndicator({});

         opts = {scale:10, data:[{value: 0, className:'', title:''}]};
         numSectors = Math.floor(100 / opts.scale);
         colors = psi._setColors(opts.data);
         data = psi._calculateColorState(opts,colors,numSectors);
         assert.deepEqual([], data, 'calculateColorState 10 1 test case 1: WrongResult');

         opts = {scale:10, data:[{value: 1, className:'', title:''}]};
         colors = psi._setColors(opts.data);
         data = psi._calculateColorState(opts,colors,numSectors);
         assert.deepEqual([1], data, 'calculateColorState 10 1 test case 2: WrongResult');


         opts = {scale:10, data:[{value: 19, className:'', title:''}]};
         colors = psi._setColors(opts.data);
         data = psi._calculateColorState(opts,colors,numSectors);
         assert.deepEqual([1, 1], data, 'calculateColorState 10 1 test case 3: WrongResult');

         opts = {scale:10, data:[{value: 20, className:'', title:''}]};
         colors = psi._setColors(opts.data);
         data = psi._calculateColorState(opts,colors,numSectors);
         assert.deepEqual([1,1], data, 'calculateColorState 10 1 test case 4: WrongResult');

         opts = {scale:10, data:[{value: 99, className:'', title:''}]};
         colors = psi._setColors(opts.data);
         data = psi._calculateColorState(opts,colors,numSectors);
         assert.deepEqual([1,1,1,1,1,1,1,1,1,1], data, 'calculateColorState 10 1 test case 5: WrongResult');

         opts = {scale:10, data:[{value: 100, className:'', title:''}]};
         colors = psi._setColors(opts.data);
         data = psi._calculateColorState(opts,colors,numSectors);
         assert.deepEqual([1,1,1,1,1,1,1,1,1,1], data, 'calculateColorState 10 1 test case 6: WrongResult');
      });

      it('calculateColorState 10 sectors, 2 values', function() {
         var psi, data, opts, numSectors, colors;
         psi = new progress.StateIndicator({});

         opts = {scale:10, data:[{value: 0, className:'', title:''}, {value: 0, className:'', title:''}]};
         numSectors = Math.floor(100 / opts.scale);
         colors = psi._setColors(opts.data);
         data = psi._calculateColorState(opts,colors,numSectors);
         assert.deepEqual([], data, 'calculateColorState 10 2 test case 1: WrongResult');

         opts = {scale:10, data:[{value: 1, className:'', title:''}, {value: 0, className:'', title:''}]};
         colors = psi._setColors(opts.data);
         data = psi._calculateColorState(opts,colors,numSectors);
         assert.deepEqual([1], data, 'calculateColorState 10 2 test case 2: WrongResult');

         opts = {scale:10, data:[{value: 1, className:'', title:''}, {value: 1, className:'', title:''}]};
         colors = psi._setColors(opts.data);
         data = psi._calculateColorState(opts,colors,numSectors);
         assert.deepEqual([1,2], data, 'calculateColorState 10 2 test case 3: WrongResult');

         opts = {scale:10, data:[{value: 50, className:'', title:''}, {value: 50, className:'', title:''}]};
         colors = psi._setColors(opts.data);
         data = psi._calculateColorState(opts,colors,numSectors);
         assert.deepEqual([1,1,1,1,1,2,2,2,2,2], data, 'calculateColorState 10 2 test case 4: WrongResult');

         opts = {scale:10, data:[{value: 99, className:'', title:''}, {value: 1, className:'', title:''}]};
         colors = psi._setColors(opts.data);
         data = psi._calculateColorState(opts,colors,numSectors);
         assert.deepEqual([1,1,1,1,1,1,1,1,1,2], data, 'calculateColorState 10 2 test case 5: WrongResult');

         opts = {scale:10, data:[{value: 1, className:'', title:''}, {value: 99, className:'', title:''}]};
         colors = psi._setColors(opts.data);
         data = psi._calculateColorState(opts,colors,numSectors);
         assert.deepEqual([1,2,2,2,2,2,2,2,2,2], data, 'calculateColorState 10 2 test case 6: WrongResult');

         opts = {scale:10, data:[{value: 33, className:'', title:''}, {value: 33, className:'', title:''}]};
         colors = psi._setColors(opts.data);
         data = psi._calculateColorState(opts,colors,numSectors);
         assert.deepEqual([1,1,1,2,2,2], data, 'calculateColorState 10 2 test case 7: WrongResult');
      });

      it('calculateColorState 20 sectors, 3 values', function() {
         var psi, data, opts, numSectors, colors;
         psi = new progress.StateIndicator({});

         opts = {scale:5, data:[{value: 0, className:'', title:''}, {value: 0, className:'', title:''}, {value: 0, className:'', title:''}]};
         numSectors = Math.floor(100 / opts.scale);
         colors = psi._setColors(opts.data);
         data = psi._calculateColorState(opts,colors,numSectors);
         assert.deepEqual([], data, 'calculateColorState 20 3 test case 1: WrongResult');

         opts = {scale:5, data:[{value: 1, className:'', title:''}, {value: 0, className:'', title:''}, {value: 1, className:'', title:''}]};
         colors = psi._setColors(opts.data);
         data = psi._calculateColorState(opts,colors,numSectors);
         assert.deepEqual([1,3], data, 'calculateColorState 20 3 test case 2: WrongResult');

         opts = {scale:5, data:[{value: 1, className:'', title:''}, {value: 1, className:'', title:''}, {value: 1, className:'', title:''}]};
         colors = psi._setColors(opts.data);
         data = psi._calculateColorState(opts,colors,numSectors);
         assert.deepEqual([1,2,3], data, 'calculateColorState 20 3 test case 3: WrongResult');

         opts = {scale:5, data:[{value: 0, className:'', title:''}, {value: 0, className:'', title:''}, {value: 10, className:'', title:''}]};
         colors = psi._setColors(opts.data);
         data = psi._calculateColorState(opts,colors,numSectors);
         assert.deepEqual([3,3], data, 'calculateColorState 20 3 test case 4: WrongResult');

         opts = {scale:5, data:[{value: 34, className:'', title:''}, {value: 33, className:'', title:''}, {value: 33, className:'', title:''}]};
         colors = psi._setColors(opts.data);
         data = psi._calculateColorState(opts,colors,numSectors);
         assert.deepEqual([1,1,1,1,1,1,2,2,2,2,2,2,2,3,3,3,3,3,3,3], data, 'calculateColorState 20 3 test case 5: WrongResult');

         opts = {scale:5, data:[{value: 50, className:'', title:''}, {value: 25, className:'', title:''}, {value: 25, className:'', title:''}]};
         colors = psi._setColors(opts.data);
         data = psi._calculateColorState(opts,colors,numSectors);
         assert.deepEqual([1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,3,3,3,3,3], data, 'calculateColorState 20 3 test case 6: WrongResult');
      });
      it('calculateColorState 13 sectors, 4 values', function() {
         var psi, data, opts, numSectors, colors;
         psi = new progress.StateIndicator({});

         opts = {scale:7.6, data:[{value: 20, className:'', title:''}, {value: 30, className:'', title:''}, {value: 3, className:'', title:''}, {value: 47, className:'', title:''}]};
         numSectors = Math.floor(100 / opts.scale);
         colors = psi._setColors(opts.data);
         data = psi._calculateColorState(opts,colors,numSectors);
         assert.deepEqual([1,1,1,2,2,2,2,3,4,4,4,4,4], data, 'calculateColorState 20 3 test case 1: WrongResult');

      });
   })
});
