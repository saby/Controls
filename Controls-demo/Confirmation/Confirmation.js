define('Controls-demo/Confirmation/Confirmation',
   [
      'UI/Base',
      'wml!Controls-demo/Confirmation/Confirmation',
      'Controls-demo/Confirmation/resources/detailsComponent'
   ],
   function(Base, template) {
      'use strict';

      var MESSAGE = 'Message';
      var DETAILS = 'Details';
      var BG = '#409eff';
      var InfoBox = Base.Control.extend({
         _template: template,
         _blocks: null,
         _result: '',

         _beforeMount: function() {
            this._onResultHandler = this._onResultHandler.bind(this);
            this._blocks = [{
               caption: 'Type',
               items: [{
                  caption: 'OK',
                  test_name: 'ok',
                  background: BG,
                  cfg: {
                     message: MESSAGE,
                     details: 'Controls-demo/Confirmation/resources/detailsComponent',
                     type: 'ok'
                  }
               }, {
                  caption: 'YESNO',
                  test_name: 'yesno',
                  background: BG,
                  cfg: {
                     message: MESSAGE,
                     details: DETAILS,
                     type: 'yesno'
                  }
               }, {
                  caption: 'YESNOCANCEL',
                  test_name: 'yesnocancel',
                  background: BG,
                  cfg: {
                     message: MESSAGE,
                     details: DETAILS,
                     type: 'yesnocancel',
                     primaryAction: 'no'
                  }
               }]
            },
            {
               caption: 'Style',
               items: [{
                  caption: 'DEFAULT',
                  test_name: 'default',
                  background: BG,
                  cfg: {
                     message: MESSAGE,
                     details: DETAILS,
                     style: 'default'
                  }
               }, {
                  caption: 'SUCCESS',
                  test_name: 'success',
                  background: '#00d407',
                  cfg: {
                     message: MESSAGE,
                     details: DETAILS,
                     style: 'success'
                  }
               }, {
                  caption: 'ERROR',
                  test_name: 'error',
                  background: '#dc0000',
                  cfg: {
                     message: MESSAGE,
                     details: DETAILS,
                     style: 'danger'
                  }
               }, {
                  caption: 'PRIMARY',
                  test_name: 'primary',
                  background: '#D94700',
                  cfg: {
                     message: MESSAGE,
                     details: DETAILS,
                     style: 'primary'
                  }
               }]
            },
            {
               caption: 'Button caption',
               items: [{
                  caption: 'ONE BUTTON',
                  test_name: 'one_button',
                  background: BG,
                  cfg: {
                     message: MESSAGE,
                     details: DETAILS,
                     okCaption: 'Custom ok',
                     type: 'ok'
                  }
               }, {
                  caption: 'THREE BUTTON',
                  test_name: 'three_button',
                  background: BG,
                  cfg: {
                     message: MESSAGE,
                     details: DETAILS,
                     yesCaption: 'My yes',
                     noCaption: 'My no',
                     cancelCaption: 'My cancel',
                     type: 'yesnocancel'
                  }
               }]
            },
            {
               caption: 'Size 350px',
               items: [{
                  caption: 'Heading < 100, Comment < 160',
                  background: BG,
                  cfg: {
                     message: 'Advertisers study how people learn so that they can ‘teach’ them to respond to their advertising',
                     details: 'If advertisements are to he learned, there is a need for lots of repetition.',
                     type: 'yesnocancel'
                  }
               },
               {
                  caption: 'Heading < 100, No Comment',
                  background: BG,
                  cfg: {
                     message: 'Advertisers study how people learn so that they can ‘teach’ them to respond to their advertising',
                     type: 'yesno'
                  },
               }
               ]
            },
            {
               caption: 'Size 400px',
               items: [{
                  caption: 'Heading > 100, No Comment',
                  background: BG,
                  cfg: {
                     message: 'Advertisers study how people learn so that they can ‘teach’ them to respond to' +
                           ' their advertising. They want us to be interested, to try something, and then to do it again.',
                     type: 'ok'
                  }
               }, {
                  caption: 'Heading < 100, Comment > 160',
                  background: BG,
                  cfg: {
                     message: 'Advertisers study how people learn so that they can ‘teach’ them to respond to their advertising',
                     details: ' For example, the highly successful ‘Weston Tea Country’ advertising for different tea has led to' +
                           ' ‘DAEWOO Country’ for automobile dealers and ‘Cadbury Country’ for chocolate bars.',
                     type: 'yesno'
                  }
               }]
            }];
         },

         _open: function(e, cfg) {
            var self = this;
            this._children.popupOpener.open(cfg).addCallback(function(res) {
               self._result = res;
               self._forceUpdate();
            });
         },

         _onResultHandler: function(event, result) {
            this._resultHandler = result;
            this._forceUpdate();
         }

      });

      return InfoBox;
   });
