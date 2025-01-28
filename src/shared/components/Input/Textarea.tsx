/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react'
import clsx from 'clsx'
import classes from './Input.module.scss'

interface ITextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  // title: string;
  // showIcon: boolean;
  // color: 'primary' | 'secondary';
  isErrored?: boolean;
  isSuccess?: boolean;
}

// NOTE: See also about forwardRef https://legacy.reactjs.org/docs/forwarding-refs.html
export const Textarea = React.forwardRef(({
  children,
  // color,
  // isErrored,
  isSuccess,
  ...nativeProps
}: ITextareaProps, ref) => {
  return (
    <textarea
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
    </textarea>
  )
})
