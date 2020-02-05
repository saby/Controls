import {TemplateFunction} from 'UI/Base';
export interface ICaptionOptions {
   caption?: string | TemplateFunction;
}

/**
 * Текст заголовка.
 *
 * @interface Controls/_interface/ICaption
 * @public
 * @author Красильников А.С.
 */

/*
 * Caption text.
 *
 * @interface Controls/_interface/ICaption
 * @public
 * @author Красильников А.С.
 */
export default interface ICaption {
   readonly '[Controls/_interface/ICaption]': boolean;
}
/**
 * @name Controls/_interface/ICaption#caption
 * @cfg {String} Определяет текст заголовка контрола.
 * @remark Вы можете передать разметку в заголовок.
 * @example
 * **Пример 1.** Кнопка с заголовком.
 * <pre>
 *    <Controls.buttons:Button caption="Hello Wasaby"/>
 * </pre>
 * **Пример 2.** В заголовок кнопки встроена разметка.
 * Разметка изменяет цвет текста.
 * В качестве текста выводится число, разделённое на триады.
 * <pre>
 *    <Controls.buttons:Button>
 *        <ws:caption>
 *            <span style="color: red"> 
 *                <Controls.decorator:Number number="{{ 150350.050 }}" />
 *            </span>
 *        </ws:caption>
 *    </Controls.buttons:Button>
 * </pre>
 * **Пример 3.** В заголовок кнопки передан шаблон.
 * <pre>
 *    <Controls.buttons:Button caption="wml!MyControl/Template"/>
 * </pre>
 */

/*
 * @name Controls/_interface/ICaption#caption
 * @cfg {String} Control caption text.
 * @remark You can submit the markup to the caption.
 * @example
 * Control has caption 'Dialog'.
 * <pre>
 *    <ControlsDirectory.Control caption="Dialog"/>
 * </pre>
 * Control has markup caption.
 * <pre>
 *    <ControlsDirectory.Control caption="captionTemplate"/>
 * </pre>
 * captionTemplate
 * <pre>
 *    <span class='customDialog'>
 *       Dialog
 *    </span>
 * </pre>
 */
