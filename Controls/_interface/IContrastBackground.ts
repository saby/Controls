export interface IContrastBackgroundOptions {
    contrastBackground: boolean;
}

/**
 * Интерфейс для контролов, которые поддерживают настройку контрастности фона.
 * @public
 * @author Красильников А.С.
 */
export default interface IContrastBackground {
    readonly '[Controls/_interface/IContrastBackground]': boolean;
}

/**
 * @name Controls/interface/IContrastBackground#contrastBackground
 * @cfg {Boolean} Определяет контрастность фона контрола по отношению к его окружению.
 * @variant true Контрастный фон.
 * @variant false Фон, гармонично сочетающийся с окружением.
 */

/*
 * @name Controls/interface/IContrastBackground#contrastBackground
 * @cfg {Boolean} Determines if control has contrast background.
 * @variant true Control has contrast background.
 * @variant false Control has the harmony background.
 */
