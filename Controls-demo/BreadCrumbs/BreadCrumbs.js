define('Controls-demo/BreadCrumbs/BreadCrumbs', [
   'Core/Control',
   'wml!Controls-demo/BreadCrumbs/BreadCrumbs/BreadCrumbs',
   'Types/entity',
], function(
   Control,
   template,
   entity
) {
   var BreadCrumbs = Control.extend({
      _template: template,
      _styles: ['Controls-demo/BreadCrumbs/BreadCrumbs/BreadCrumbs'],
      items: null,
      items1: null,
      items2: null,
      items3: null,
      info: '',
      _arrowActivated: false,
      _beforeMount: function() {
         this.items = [
            {
               id: 1,
               title: 'Настолько длинное название папки что оно не влезет в максимальный размер 1',
               secondTitle: 'тест1',
               parent: null
            },
            {
               id: 2,
               title: 'Notebooks 2',
               secondTitle: 'тест2',
               parent: 1
            },
            {
               id: 3,
               title: 'Smartphones 3',
               secondTitle: 'тест3',
               parent: 2
            },
            {
               id: 4,
               title: 'Record1',
               secondTitle: 'тест4',
               parent: 3
            },
            {
               id: 5,
               title: 'Record2',
               secondTitle: 'тест5',
               parent: 4
            },
            {
               id: 6,
               title: 'Record3eqweqweqeqweqweedsadeqweqewqeqweqweqw',
               secondTitle: 'тест6',
               parent: 5
            }
         ].map(function(item) {
            return new entity.Model({
               rawData: item,
               keyProperty: 'id'
            });
         });
         this.items1 = [{
            id: 1,
            title: 'Настолько длинное название папки что оно не влезет в максимальный размер 1',
            secondTitle: 'тест1'
         }].map(function(item) {
            return new entity.Model({
               rawData: item,
               keyProperty: 'id'
            });
         });
         this.items2 = [{
            id: 1,
            title: 'Настолько длинное название папки что оно не влезет в максимальный размер 1',
            secondTitle: 'тест1'
         }, {
            id: 6,
            title: 'Record3eqweqweqeqweqweedsadeqweqewqeqweqweqw',
            secondTitle: 'тест6'
         }].map(function(item) {
            return new entity.Model({
               rawData: item,
               keyProperty: 'id'
            });
         });
         this.items3 = [{ id: 5, title: 'Recor' },
            {
               id: 6,
               title: 'Record3eqweqweqeqweqweedsadeqweqewqeqweqweqw',
               secondTitle: 'тест6'
            }].map(function(item) {
            return new entity.Model({
               rawData: item,
               keyProperty: 'id'
            });
         });
         this.items4 = [
            {
               id: 1,
               title: 'Record3eqweqweqeqweqweedsadeqweqewqeqwqewqeqweqweqw',
               secondTitle: 'тест6'
            }].map(function(item) {
            return new entity.Model({
               rawData: item,
               keyProperty: 'id'
            });
         });
      },
      _onItemClick: function(e, item) {
         this.info = '' + item.getId();
         this._arrowActivated = false;
      },

      _resetCrumbs: function() {
         this.items = [
            {
               id: 1,
               title: 'Настолько длинное название папки что оно не влезет в максимальный размер 1',
               secondTitle: 'тест1',
               parent: null
            },
            {
               id: 2,
               title: 'Notebooks 2',
               secondTitle: 'тест2',
               parent: 1
            },
            {
               id: 3,
               title: 'Smartphones 3',
               secondTitle: 'тест3',
               parent: 2
            },
            {
               id: 4,
               title: 'Record1',
               secondTitle: 'тест4',
               parent: 3
            },
            {
               id: 5,
               title: 'Record2',
               secondTitle: 'тест5',
               parent: 4
            },
            {
               id: 6,
               title: 'Record3eqweqweqeqweqweedsadeqweqewqeqweqweqw',
               secondTitle: 'тест6',
               parent: 5
            }
         ].map(function(item) {
            return new entity.Model({
               rawData: item,
               keyProperty: 'id'
            });
         });
         this.info = '';
         this._arrowActivated = false;
      },

      _onArrowActivated: function() {
         this.info = '';
         this._arrowActivated = true;
      }
   });

   return BreadCrumbs;
});
