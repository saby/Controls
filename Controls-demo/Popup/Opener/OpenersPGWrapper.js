define('Controls-demo/Popup/Opener/OpenersPGWrapper',
   [
      'Core/Control',
      'Core/Deferred',
      'Core/core-merge',
      'Core/library',
      'Controls-demo/PropertyGrid/propertyGridUtil',
      'wml!Controls-demo/Popup/Opener/OpenersPGWrapper',
      'wml!Controls-demo/PropertyGrid/PropertyGridTemplate',
      'wml!Controls-demo/PropertyGrid/Types/booleanOrNull',
      'wml!Controls-demo/PropertyGrid/Types/string',
      'wml!Controls-demo/PropertyGrid/Types/array',
      'wml!Controls-demo/PropertyGrid/Types/number',
      'wml!Controls-demo/PropertyGrid/Types/datetime',
      'wml!Controls-demo/PropertyGrid/Types/boolean',
      'wml!Controls-demo/PropertyGrid/Types/functionOrString',
      'wml!Controls-demo/PropertyGrid/Types/function',
      'wml!Controls-demo/PropertyGrid/Types/enum',
      'wml!Controls-demo/PropertyGrid/Types/object',


      'json!Controls-demo/PropertyGrid/pgtext',
   ],

   function(Control, Deferred, cMerge, libHelper, propertyGridUtil, template, myTmpl, booleanOrNull, stringTmpl, arrayTmpl, numberTmpl,
      datetimeTmpl, booleanTmpl, functOrString, functionTmpl, enumTmpl, objTmpl) {
      'use strict';

      var PGWrapper = Control.extend({
         _template: template,
         _styles: ['Controls-demo/Filter/Button/PanelVDom', 'Controls-demo/Input/resources/VdomInputs', 'Controls-demo/Wrapper/Wrapper'],
         _metaData: null,
         dataTemplates: null,
         myEvent: '',
         _my: myTmpl,
         _demoName: '',
         _dialogRes: undefined,
         _result: undefined,
         _popupOptions: null,
         _nameOpener: '',
         _exampleControlOptions: {},
         _beforeMount: function(opts) {
            this.dataTemplates = {
               'Boolean|null': booleanOrNull,
               'String': stringTmpl,
               'Array': arrayTmpl,
               'Number': numberTmpl,
               'DateTime': datetimeTmpl,
               'Boolean': booleanTmpl,
               'function|String': functOrString,
               'function': functionTmpl,
               'enum': enumTmpl,
               'Object': objTmpl,
            };
            this._dialogRes= opts.dialogResult;
            this._demoName = propertyGridUtil.getDemoName(opts.content);

            opts.componentOpt._version = 0;
            opts.componentOpt.getVersion = function() { return this._version; };
            this._exampleControlOptions = opts.componentOpt;

            this._nameOpener = opts.nameOpener;
            var def = new Deferred();
            this.description = cMerge(opts.description, opts.dataObject);
            if (typeof opts.content === 'string') {
               libHelper.load(opts.content).then(function() {
                  def.callback();
               });
               return def;
            }
         },
         _afterMount: function(opts) {
            var self = this,
               container = this._children[opts.nameOpener]._container;
            this._exampleControlOptions.target = container,

            container.controlNodes.forEach(function(config) {
               var notOrigin = config.control._notify;

               config.control._notify = function(event, arg) {
                  self.myEvent += event + ' ';
                  if (event === opts.eventType) {
                     opts.componentOpt[opts.nameOption] = arg[0];
                  }
                  var result = notOrigin.apply(this, arguments);
                  self._forceUpdate();
                  self._children.PropertyGrid._forceUpdate();
                  return result;
               };
            });
         },
         _openHandler: function(event) {
            var self = this;
            this._exampleControlOptions.target = event.target;
            var res = this._children[this._nameOpener].open(this._exampleControlOptions);
            if(this._dialogRes) {
               res.addCallback(function (result) {
                  self._result = '' + result;
               });
            }
         },
         _valueChangedHandler: function(event, option, newValue) {
            this._exampleControlOptions[option] = newValue;
            this._exampleControlOptions._version++;
            this._notify('optionsChanged', [this._options]);
         },
         reset: function() {
            this.myEvent = '';
         }
      });
      return PGWrapper;
   });
