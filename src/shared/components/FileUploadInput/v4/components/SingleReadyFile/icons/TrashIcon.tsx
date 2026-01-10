import React, { CSSProperties } from 'react'
// import { CSSProperties } from 'styled-components'

export const TrashIcon = ({ style }: { style?: CSSProperties }) => (
  <svg
    width="16"
    height="20"
    viewBox="0 0 16 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={style}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7 2.00002H0V4.00002H1V18C1 19.1046 1.89543 20 3 20H13C14.1046 20 15 19.1046 15 18V4.00002H16V2.00002H9V1.52588e-05H7V2.00002ZM3 4.00002V18H13V4.00002H3ZM5 15V7.00002H7V15H5ZM9 15V7.00002H11V15H9Z"
      fill="#FFFFFF"
    />
  </svg>

);

