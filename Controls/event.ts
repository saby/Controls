/**
 * Библиотека контролов, позволяющих организовать работу событий сверху вниз.
 * @library Controls/event
 * @public
 * @author Крайнов Д.О.
 * @deprecated Использование библиотеки допускается только для <a href="/doc/platform/developmentapl/interface-development/controls/tools/autoresize/">авторесайза</a>.
 * В остальных случаях использовать библиотеку не рекомендуется, поскольку это приведёт к неконтролируемому потоку распространения данных. 
 */

/*
 * event library
 * @library Controls/event
 * @public
 * @author Крайнов Д.О.
 * @deprecated
 */

import Register = require('Controls/_event/Register');
import Registrar = require('Controls/_event/Registrar');

import {register as RegisterUtil, unregister as UnregisterUtil} from 'Controls/_event/ListenerUtils';
export {default as Listener} from 'Controls/_event/Listener';
export {default as RegisterClass} from 'Controls/_event/RegisterClass';
export {
   Register,
   Registrar,
   RegisterUtil,
   UnregisterUtil
};
