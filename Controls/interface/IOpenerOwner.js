/* eslint-disable */
define('Controls/interface/IOpenerOwner', [], function() {

   /**
    * Интерфейс для контролов, имеющих {@link /doc/platform/developmentapl/interface-development/ui-library/focus/#control-opener опенер}.
    * Более подробно информация изложена в документе {@link /doc/platform/developmentapl/interface-development/ui-library/focus/ Работа с фокусами}.
    *
    * @interface Controls/interface/IOpenerOwner
    * @public
    * @author Шипин А.А.
    */
   /*
    * Interface for controls that has opener. Opener means control that initiates opening of current control. It needs for mechanism of focuses.
    * For detailed information, refer {@link /doc/platform/developmentapl/interface-development/ui-library/focus/ Mechanism of focuses}.
    *
    * @interface Controls/interface/IOpenerOwner
    * @public
    * @author Шипин А.А.
    */

   /**
    * @name Controls/interface/IOpenerOwner#opener
    * @cfg {Core/Control} Контрол, который инициирует открытие текущего контрола, реализующий интерфейс IHasOpener.
    */
   /*
    * @name Controls/interface/IOpenerOwner#opener
    * @cfg {Core/Control} Control that opens current control expended by IHasOpener interface.
    */

});
