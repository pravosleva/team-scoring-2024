// import React, { useState, useEffect, useRef, useCallback, MutableRefObject } from "react"
// import { getCurrentPercentage } from '~/utils/forecast-tools/getCurrentPercentage'
import styles from './ProgressBar.module.scss'

type TProps = {
  value: number
  width?: string
}

export const ProgressBar = ({ value, width = '100px' }: TProps) => {
  return (
    <div
      className={styles['progress-bar']}
      style={{
        width,
      }}
    >
      <div
        className={styles["before-like"]}
        style={{
          width: value <= 100 ? `${Math.abs(value).toFixed(0)}%` : '100%',
          // backgroundColor: !!value && value > 100 ? '#e46046' : '#2280fa',
          // content: `"${value} %"`,
        }}
      />
    </div>
  )
}
