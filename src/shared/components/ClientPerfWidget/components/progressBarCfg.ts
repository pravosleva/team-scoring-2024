export const progressBarCfg = {
  first: {
    theme: {
      dynamic: ['#2280fa', '#2cc194', '#ffb703', '#e46046'],
      bg: 'lightgray',
    },
    limits: {
      warning: 80,
      danger: 100,
    },
  },
  second: {
    theme: {
      dynamic: ['#2280fa', '#2cc194', '#ffb703', '#e46046'],
      bg: 'lightgray',
    },
    limits: {
      warning: 80,
      danger: 100,
    },
  }
}
export const [colorSubZero, colorNormal, colorWarning, colorDanger] = progressBarCfg.first.theme.dynamic
