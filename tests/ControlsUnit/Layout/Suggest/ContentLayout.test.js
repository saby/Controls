define(['Controls/_suggestPopup/Layer/__ContentLayer'], function(__ContentLayer) {

   describe('Controls._suggestPopup.Layer.__ContentLayer', function() {


      var getComponentObject = function() {
         var self = {};
         self._options = {};
         self._options.suggestTemplate = {};
         self._options.footerTemplate = {};
         return self;
      };

      var getContainer = function(size) {
         return {
            style: {height: ''},
            getBoundingClientRect: function() {
               return {
                  toJSON: function() {
                     return size;
                  }
               };
            }
         };
      };

      var getContainerIE = function(size) {
         return {
            style: {height: ''},
            getBoundingClientRect: function() {
               return {
                  __proto__: size
               };
            }
         };
      };

      var getDropDownContainer = function(height) {
         return {
            getBoundingClientRect: function() {
               return {
                  bottom: 0,
                  top: 0,
                  height: height
               };
            }
         };
      };

      it('Suggest::close', function() {
         var suggestComponent = new __ContentLayer.default();
         var closed = false;

         suggestComponent._notify = function(event) {
            if (event === 'close') {
               closed = true;
            }
         };
         suggestComponent.close();
         assert.isTrue(closed);
      });

      it('Suggest::_private.calcHeight', function() {
         var self = getComponentObject();

         self._container = getContainer({
            top: 100,
            bottom: 0,
            height: 400
         });
         self._options.target = getContainer({
            bottom: 324,
            top: 300
         });
         self._height = 'auto';
         assert.equal(__ContentLayer.default._private.calcHeight(self, getDropDownContainer(900)), 'auto');
         assert.equal(__ContentLayer.default._private.calcHeight(self, getDropDownContainer(400)), '300px');
         self._height = '76px';
         assert.equal(__ContentLayer.default._private.calcHeight(self, getDropDownContainer(900)), 'auto');
      });

      it('Suggest::_private.getSizes', function() {
         var self = getComponentObject();

         self._container = getContainerIE({
            top: 100,
            bottom: 0,
            height: 400
         });
         self._options.target = getContainerIE({
            bottom: 324,
            top: 300
         });
         self._height = 'auto';
         var sizes = __ContentLayer.default._private.getSizes(self, getDropDownContainer(900));
         assert.deepEqual(sizes.suggest, {top: 100, bottom: 0, height: 400});
         assert.deepEqual(sizes.container, {bottom: 324, top: 300});
      });

      it('Suggest::_private.updateHeight', function() {
         var self = getComponentObject();
         self._height = '200px';
         self._forceUpdate = function() {};
         __ContentLayer.default._private.calcHeight = function() {
            return '400px';
         }
         __ContentLayer.default._private.updateHeight(self, false);
         assert.equal(self._height, '400px');
      });

      it('Suggest::_private.updateMaxHeight', function() {
         var self = getComponentObject();
         self._forceUpdate = function() {};
         __ContentLayer.default._private.getDropDownContainerSize = function() {
            return {height: 500};
         };
         self._container = getContainerIE({top: 40});

         __ContentLayer.default._private.updateMaxHeight(self);
         assert.equal(self._maxHeight, '460px');
      });

      it('Suggest::_afterUpdate', function() {
         const layer = new __ContentLayer.default();
         const sandbox = sinon.createSandbox();
         let resizeStarted = false;

         layer.saveOptions({
            showContent: true
         });
         layer._controlResized = true;

         sandbox.replace(layer, '_children', {
            resize: {
               start: () => {
                  resizeStarted = true;
               }
            }
         });
         sandbox.replace(__ContentLayer.default._private, 'updateHeight', () => {});
         sandbox.replace(__ContentLayer.default._private, 'determineOpenDirection', () => {});
         __ContentLayer.default._private.getScrollContainerSize = function() {return {top: 0}};
         layer._container = getContainer({top: 0});
         layer._showContent = false;

         layer._afterUpdate();
         assert.isTrue(resizeStarted);
         assert.isTrue(layer._showContent);

         sandbox.restore();
      });

      it('updateMaxHeight when resized', function() {
         const layer = new __ContentLayer.default();
         let maxHeightUpdated = false;
         const updateMaxHeight = __ContentLayer.default._private.updateMaxHeight;
         layer._container = getContainer({top: 0});
         __ContentLayer.default._private.getDropDownContainerSize = () => {
            return {height: 500};
         };
         __ContentLayer.default._private.updateMaxHeight = (self) => {
            maxHeightUpdated = true;
            updateMaxHeight(self);
         };
         __ContentLayer.default._private.determineOpenDirection = () => {};
         layer._resize();
         assert.isTrue(maxHeightUpdated);
      });
   });

});
