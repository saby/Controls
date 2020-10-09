define([
   'Controls/_list/ScrollController',
   'Controls/_list/ListViewModel',
   'Types/collection'
], function(ScrollControllerLib, ListViewModel, collection) {
   const ScrollController = ScrollControllerLib.default;
   describe('Controls.List.Container', function() {
      let scrollController;
      beforeEach(() => {
         scrollController = new ScrollController({});
      });

      describe('.update()', () => {
         it('should update active element', () => {
            let activeElement = {};
            scrollController.update({
               options: {
                  activeElement: activeElement
               }
            });
            assert.equal(activeElement, scrollController._options.activeElement);
         });

         it('should create virtual scroll', (done) => {
            scrollController._options.viewModel = {};
            let items = new collection.RecordSet({
               keyProperty: 'id',
               rawData: {}
            });
            sinon.stub(scrollController, '_initVirtualScroll').callsFake(() => {
               done();
            });
            scrollController.update({
               options: {
                  collection: new ListViewModel({
                     items: items,
                     keyProperty: 'id'
                  })
               }
            });
         });

      });

      describe('._initVirtualScroll()', () => {
         it('should not create virtual scroll', () => {
            let items = new collection.RecordSet({
               keyProperty: 'id',
               rawData: [{id: 1}]
            });
            let viewModel = new ListViewModel({
               items: items,
               keyProperty: 'id'
            });
            scrollController._initVirtualScroll({
               collection: viewModel,
               virtualScrollConfig: {
                  pageSize: 5
               }
            });
            assert.isUndefined(scrollController._virtualScroll);
         });

         it('should create virtual scroll when pageSise more than items count', () => {
            let items = new collection.RecordSet({
               keyProperty: 'id',
               rawData: [{id: 1},{id: 2},{id: 3},{id: 4}]
            });
            let viewModel = new ListViewModel({
               items: items,
               keyProperty: 'id'
            });
            scrollController._initVirtualScroll({
               collection: viewModel,
               virtualScrollConfig: {
                  pageSize: 3
               }
            });
            assert.isDefined(scrollController._virtualScroll);
         });
      });

   });
});
