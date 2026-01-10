import React, { CSSProperties } from 'react'
// import { CSSProperties } from 'styled-components'

export const PlusIcon = ({ style }: { style?: CSSProperties }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={style}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6.99992 0.333313C7.46016 0.333313 7.83325 0.706409 7.83325 1.16665V6.16665H12.8333C13.2935 6.16665 13.6666 6.53974 13.6666 6.99998C13.6666 7.46022 13.2935 7.83331 12.8333 7.83331H7.83325V12.8333C7.83325 13.2936 7.46016 13.6666 6.99992 13.6666C6.53968 13.6666 6.16658 13.2936 6.16658 12.8333V7.83331H1.16659C0.706348 7.83331 0.333252 7.46022 0.333252 6.99998C0.333252 6.53974 0.706348 6.16665 1.16659 6.16665H6.16658V1.16665C6.16658 0.706409 6.53968 0.333313 6.99992 0.333313Z"
      fill="white"
    />
  </svg>

);
