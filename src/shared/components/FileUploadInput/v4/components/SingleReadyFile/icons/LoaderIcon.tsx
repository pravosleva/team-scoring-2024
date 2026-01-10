import React, { CSSProperties } from 'react'
// import { CSSProperties } from 'styled-components'

export const LoaderIcon = ({ style }: { style?: CSSProperties }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={style}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10 2C5.58172 2 2 5.58172 2 10H0C0 4.47715 4.47715 0 10 0C13.0026 0 15.6766 1.39608 17.5 3.49641V1H19.5V6L18.5 7H13.5V5H16.1529C14.676 3.19177 12.4568 2 10 2ZM10 18C14.4183 18 18 14.4183 18 10H20C20 15.5228 15.5228 20 10 20C6.97702 20 4.31255 18.6596 2.5 16.5505V19H0.5V14L1.5 13H6.5V15H3.81237C5.26572 16.8336 7.47983 18 10 18Z"
      fill="#1F232B"
    />
  </svg>

);
