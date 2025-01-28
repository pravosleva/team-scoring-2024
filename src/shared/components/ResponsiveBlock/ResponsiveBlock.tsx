import clsx from 'clsx'
import classes from './ResponsiveBlock.module.scss'

type TProps = {
  isLimited?: boolean;
  isPaddedMobile?: boolean;
  style?: React.CSSProperties;
  className?: string;
  hasDesktopFrame?: boolean;
  children: React.ReactNode;
  // zeroPaddingMobile?: boolean;
  isLimitedForDesktop?: boolean;
  // isLastSection?: boolean;
  hasRedBorder?: boolean;
}

export const ResponsiveBlock = ({
  // zeroPaddingMobile,
  children,
  // isLimited,
  isPaddedMobile,
  style,
  className,
  // hasDesktopFrame,
  isLimitedForDesktop,
  // isLastSection,
  hasRedBorder,
}: TProps) => {
  switch (true) {
    case isLimitedForDesktop:
      return (
        <div
          className={clsx(
            classes.base,
            classes.isLimitedForDesktop,
            classes.limitedWidth,
            classes.centered,
            {
              [classes.isPaddedMobile]: isPaddedMobile,
              [classes.redBorder]: hasRedBorder,
            },
            className,
          )}
          style={style || {}}
        >
          {children}
        </div>
      )
    // case isLimited && !isPaddedMobile && !hasDesktopFrame:
    // case isLimited && !isPaddedMobile:
    //   return (
    //     <div
    //       className={clsx(
    //         classes.base,
    //         // { [classes.isLastSection]: isLastSection },
    //         classes.limitedWidth,
    //         classes.centered,
    //       )}
    //     >
    //       {children}
    //     </div>
    //   )
    default:
      return (
        <div
          className={clsx(
            classes.base,
            {
              [classes.redBorder]: hasRedBorder,
            },
            className,
          )}
          style={style || {}}
        >
          {children}
        </div>
      )
  }
}
