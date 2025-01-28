/* eslint-disable @typescript-eslint/ban-ts-comment */
import { memo, forwardRef } from 'react'
import clsx from 'clsx'
import classes from './Input.module.scss'

interface IInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // title: string;
  // showIcon: boolean;
  // color: 'primary' | 'secondary';
  isErrored?: boolean;
  isSuccess?: boolean;
}

// NOTE: See also about forwardRef https://legacy.reactjs.org/docs/forwarding-refs.html
export const Input = memo(forwardRef(({
  children,
  // color,
  // isErrored,
  isSuccess,
  ...nativeProps
}: IInputProps, ref) => {
  return (
    <input
      // @ts-ignore
      ref={ref}
      className={
        clsx(
          // 'focus:outline-none',
          // // 'focus:outline-offset-4',
          // 'focus:outline-2',
          // 'focus:ring',
          // 'focus:ring-slate-300',

          // 'caret-blue-400',
          classes.spInput,
          'py-2',
          'px-4',
          {
            [classes.borderedGreen]: isSuccess,
          },
        )
      }
      {...nativeProps}
    >
      {children}
    </input>
  )
}))
