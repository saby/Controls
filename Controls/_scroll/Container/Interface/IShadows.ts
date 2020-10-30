export const enum SHADOW_VISIBILITY {
   HIDDEN = 'hidden',
   VISIBLE = 'visible',
   AUTO = 'auto'
}

export interface IShadowsOptions {
    topShadowVisibility: SHADOW_VISIBILITY;
    bottomShadowVisibility: SHADOW_VISIBILITY;
    leftShadowVisibility: SHADOW_VISIBILITY;
    rightShadowVisibility: SHADOW_VISIBILITY;
}

export interface IShadowsVisibilityByInnerComponents {
    top?: SHADOW_VISIBILITY;
    bottom?: SHADOW_VISIBILITY;
    left?: SHADOW_VISIBILITY;
    right?: SHADOW_VISIBILITY;
}

export interface IVirtualContentState {
    top?: boolean;
    bottom?: boolean;
}

export function getDefaultOptions(): IShadowsOptions {
    return {
        topShadowVisibility: SHADOW_VISIBILITY.AUTO,
        bottomShadowVisibility: SHADOW_VISIBILITY.AUTO,
        leftShadowVisibility: SHADOW_VISIBILITY.AUTO,
        rightShadowVisibility: SHADOW_VISIBILITY.AUTO
    };
}

/**
 * Интерфейс для контролов со скролбарами.
 *
 * @interface Controls/_scroll/Interface/IShadows
 * @public
 * @author Миронов А.Ю.
 */

export interface IShadows {
    readonly '[Controls/_scroll/Container/Interface/IShadows]': boolean;
}

/**
 * @typedef {String} shadowVisibility
 * @variant auto Видимость зависит от состояния скролируемой области. Тень отображается только с той стороны
 * в которую можно скролить.
 * контент, то на этой границе отображается тень.
 * @variant visible Тень всегда видима.
 * @variant hidden Тень всегда скрыта.
 */

/**
 * @name Controls/_scroll/Interface/IShadows#topShadowVisibility
 * @cfg {shadowVisibility} Устанавливает режим отображения тени сверху.
 * @default auto
 * @demo Controls-demo/Scroll/Container/TopShadowVisibility/Index
 */

/**
 * @name Controls/_scroll/Interface/IShadows#bottomShadowVisibility
 * @cfg {shadowVisibility} Устанавливает режим отображения тени снизу.
 * @demo Controls-demo/Scroll/Container/BottomShadowVisibility/Index
 */
