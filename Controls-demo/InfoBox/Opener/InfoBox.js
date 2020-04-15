define('Controls-demo/InfoBox/Opener/InfoBox',
   [
      'Core/Control',
      'Controls/context',
      'wml!Controls-demo/InfoBox/resources/content',
      'wml!Controls-demo/InfoBox/Opener/InfoBox',
      'css!Controls-demo/InfoBox/Opener/InfoBox'
   ],
   function(Control, context, contentTpl, template) {
      'use strict';

      var message = 'MESSAGE';
      var InfoBox = Control.extend({
         _template: template,
         _theme: ['Controls/Classes'],
         _blocks: null,
         _icons: null,
         _cfgRight: null,
         _cfgLeft: null,
         _cfgTop: null,
         _cfgBottom: null,
         _beforeMount: function() {
            this._cfgRight = {
               message: message,
               targetSide: 'right',
               alignment: 'start'
            };
            this._cfgLeft = {
               message: message,
               targetSide: 'left',
               alignment: 'start'
            };
            this._cfgTop = {
               message: message,
               targetSide: 'top',
               alignment: 'start'
            };
            this._cfgBottom = {
               message: message,
               targetSide: 'bottom',
               alignment: 'start'
            };
            this._blocks = [{
               header: 'Position',
               items: [{
                  text: 'TOP START',
                  cfg: {
                     message: message,
                     targetSide: 'top',
                     alignment: 'start'
                  }
               }, {
                  text: 'TOP CENTER',
                  cfg: {
                     message: message,
                     targetSide: 'top',
                     alignment: 'center'
                  }
               }, {
                  text: 'TOP END',
                  cfg: {
                     message: message,
                     targetSide: 'top',
                     alignment: 'end'

                  }
               }, {
                  text: 'BOTTOM START',
                  cfg: {
                     message: message,
                     targetSide: 'bottom',
                     alignment: 'start'
                  }
               }, {
                  text: 'BOTTOM CENTER',
                  cfg: {
                     message: message,
                     targetSide: 'bottom',
                     alignment: 'center'
                  }
               }, {
                  text: 'BOTTOM END',
                  cfg: {
                     message: message,
                     targetSide: 'bottom',
                     alignment: 'end'
                  }
               }, {
                  text: 'LEFT START',
                  cfg: {
                     message: message,
                     targetSide: 'left',
                     alignment: 'start'
                  }
               }, {
                  text: 'LEFT CENTER',
                  cfg: {
                     message: message,
                     targetSide: 'left',
                     alignment: 'center'
                  }
               }, {
                  text: 'LEFT END',
                  cfg: {
                     message: message,
                     targetSide: 'left',
                     alignment: 'end'
                  }
               }, {
                  text: 'RIGHT START',
                  cfg: {
                     message: message,
                     targetSide: 'right',
                     alignment: 'start'
                  }
               }, {
                  text: 'RIGHT CENTER',
                  cfg: {
                     message: message,
                     targetSide: 'right',
                     alignment: 'center'
                  }
               }, {
                  text: 'RIGHT END',
                  cfg: {
                     message: message,
                     targetSide: 'right',
                     alignment: 'end'
                  }
               }]
            }, {
               header: 'Style',
               items: [{
                  text: 'UNACCENTED',
                  cfg: {
                     message: message,
                     style: 'unaccented'
                  }
               }, {
                  text: 'DANGER',
                  cfg: {
                     message: message,
                     style: 'danger'
                  }
               }, {
                  text: 'WARNING',
                  cfg: {
                     message: message,
                     style: 'warning'

                  }
               }, {
                  text: 'SUCCESS',
                  cfg: {
                     message: message,
                     style: 'success'

                  }
               }, {
                  text: 'SECONDARY',
                  cfg: {
                     message: message,
                     style: 'secondary'

                  }
               }, {
                  text: 'INFO',
                  cfg: {
                     message: message,
                     style: 'info'
                  }
               }]
            }, {
               header: 'Float',
               items: [{
                  text: 'TRUE',
                  cfg: {
                     message: 'American classical artists have long been known for their remarkable virtuosity.\n' +
                        ' Every year the level of their music art is getting higher.\n' +
                        ' Never before have so many unusually gifted American conductors organized\n' +
                        ' lots of the country’s most prominent orchestras.',
                     floatCloseButton: true
                  }
               }, {
                  text: 'FALSE',
                  cfg: {
                     message: 'American classical artists have long been known for their remarkable virtuosity.\n' +
                        ' Every year the level of their music art is getting higher.\n' +
                        ' Never before have so many unusually gifted American conductors organized\n' +
                        ' lots of the country’s most prominent orchestras.',
                     floatCloseButton: false
                  }
               }]
            }, {
               header: 'Content',
               items: [{
                  text: 'CUSTOM',
                  cfg: {
                     template: contentTpl,
                     templateOptions: {
                        message: message
                     }
                  }
               }]
            }];
            this._icons = [{
               items: [
                  {
                     cfg: {
                        size: 'small',
                        iconSize: 's',
                        inlineHeight: 'xs',
                        targetSide: 'left',
                        alignment: 'center',
                        message: 'Small left-center'
                     }
                  },
                  {
                     cfg: {
                        size: 'small',
                        iconSize: 's',
                        inlineHeight: 'xs',
                        targetSide: 'top',
                        alignment: 'center',
                        message: 'Small top-center'
                     }
                  },
                  {
                     cfg: {
                        size: 'small',
                        iconSize: 's',
                        inlineHeight: 'xs',
                        targetSide: 'bottom',
                        alignment: 'center',
                        message: 'Small bottom-center'
                     }
                  },
                  {
                     cfg: {
                        size: 'small',
                        iconSize: 's',
                        inlineHeight: 'xs',
                        targetSide: 'right',
                        alignment: 'center',
                        message: 'Small right-center'
                     }
                  }
               ]
            },
            {
               items: [
                  {
                     cfg: {
                        size: 'medium',
                        iconSize: 'm',
                        targetSide: 'left',
                        inlineHeight: 'm',
                        alignment: 'center',
                        style: 'warning',
                        message: 'Medium left-center'
                     }
                  },
                  {
                     cfg: {
                        size: 'medium',
                        iconSize: 'm',
                        inlineHeight: 'm',
                        targetSide: 'top',
                        alignment: 'center',
                        style: 'success',
                        message: 'Medium top-center'
                     }
                  },
                  {
                     cfg: {
                        size: 'medium',
                        inlineHeight: 'm',
                        iconSize: 'm',
                        targetSide: 'bottom',
                        alignment: 'center',
                        style: 'danger',
                        message: 'Medium bottom-center'
                     }
                  },
                  {
                     cfg: {
                        size: 'medium',
                        iconSize: 'm',
                        targetSide: 'right',
                        alignment: 'center',
                        style: 'info',
                        message: 'Medium right-center'
                     }
                  },
               ]
            },
            {
               items: [
                  {
                     cfg: {
                        size: 'large',
                        iconSize: 'l',
                        inlineHeight: 'xl',
                        targetSide: 'left',
                        alignment: 'center',
                        message: 'Large left-center'
                     }
                  },
                  {
                     cfg: {
                        size: 'large',
                        iconSize: 'l',
                        targetSide: 'top',
                        inlineHeight: 'xl',
                        alignment: 'center',
                        message: 'Large top-center'
                     }
                  },
                  {
                     cfg: {
                        size: 'large',
                        iconSize: 'l',
                        inlineHeight: 'xl',
                        targetSide: 'bottom',
                        alignment: 'center',
                        message: 'Large bottom-center'
                     }
                  },
                  {
                     cfg: {
                        size: 'large',
                        iconSize: 'l',
                        inlineHeight: 'xl',
                        targetSide: 'right',
                        alignment: 'center',
                        message: 'Large right-center'
                     }
                  },
               ]
            }
            ];
         },

         _open: function(e, cfg) {
            if (!this._context.isTouch.isTouch) {
               cfg.target = e.target;
               this._children.IBOpener.open(cfg);
            }
         },
         _openTouch: function(e, cfg) {
            cfg.target = e.target;
            this._children.IBOpener.open(cfg);
         }
      });

      InfoBox.contextTypes = function() {
         return {
            isTouch: context.TouchContextField
         };
      };

      return InfoBox;
   });
