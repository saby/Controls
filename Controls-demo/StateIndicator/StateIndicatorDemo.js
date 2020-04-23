define('Controls-demo/StateIndicator/StateIndicatorDemo', [
   'Core/Control',
   'wml!Controls-demo/StateIndicator/StateIndicatorDemo',
   'wml!Controls-demo/StateIndicator/template/template',
], function(Control, template, popupTemplate) {
   'use strict';


   function parseData(str){
      var dataArray = JSON.parse('['+str+']');
      var data = {value: 0, className: "", title: ""};
      if (dataArray.length === 3){
         data.value = typeof dataArray[0] == "number" ? dataArray[0] : 0;
         data.className = typeof dataArray[1] == "string" ? dataArray[1] : "";
         data.title = typeof dataArray[2] == "string" ? dataArray[2] : "";
      }
      return data;
   };
   function StringToNumArray(str) {
      return str.split(',').map(Number);
   };

   function StringToStrArray(str) {
      return str.split(',').map(String);
   };

   var Index = Control.extend(
      {
         _template: template,
         _styles: ['Controls-demo/StateIndicator/StateIndicatorDemo'],
         _popupTemplate: popupTemplate,
         _popupTemplateOptions: {},
         _item:'',
         _eventName: 'no event',
         _data1:'',
         _data2:'',
         _data3:'',
         _data4:'',
         _data: [],
         _scale: 10,

         _beforeMount: function() {
            this._data = [
               {value: 25, className: '', title: 'Выполнено'},
               {value: 36, className: '', title: 'В работе'},
               {value: 2, className: '', title: 'Не выполнено'}
            ];
            this._data0 = '25,"","Выполнено"';
            this._data1 = '36,"","В работе"';
            this._data2 = '2,"","Не выполнено"';
            this._data3 = '';

            this._popupTemplateOptions = {data: this._data};
         },
         changeScale: function(e, scale){
            this._scale = scale;
            this._eventName = 'ScaleChanged';
         },

         changeData0: function(e, newData){
            var data = parseData(newData);
            this._data = this._data.slice();
            this._data[0] = data;
            this._eventName = 'DataChanged';
         },
         changeData1: function(e, newData){
            var data = parseData(newData);
            this._data = this._data.slice();
            this._data[1] = data;
            this._eventName = 'DataChanged';
         },
         changeData2: function(e, newData){
            var data = parseData(newData);
            this._data = this._data.slice();
            this._data[2] = data;
            this._eventName = 'DataChanged';
         },
         changeData3: function(e, newData){
            var data = parseData(newData);
            this._data = this._data.slice();
            this._data[3] = data;
            this._eventName = 'DataChanged';
         },

         reset: function() {
            this._eventName = 'no event';
         },
         _mouseEnterHandler: function(e, _item){
            var config = {
               trigger: 'hover',
               name: 'legend',
               target: _item,
               position: 'tc',
               showDelay: 1000,
               template: popupTemplate,
               templateOptions: {data: this._data}
            };
            this._children.IBOpener.open(config);
         }

      });




   return Index;
});
