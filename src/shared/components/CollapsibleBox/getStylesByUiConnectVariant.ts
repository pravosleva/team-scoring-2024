import { TUiConnectVariant } from './types'

type TBorderRadiusResult = {
  values: {
    collapsed: {
      border: {
        width: [number, number, number, number];
        radius: [number, number, number, number];
        color: [string, string, string, string];
        style: [string, string, string, string];
      };
    };
    opened: {
      border: {
        width: [number, number, number, number];
        radius: [number, number, number, number];
        color: [string, string, string, string];
        style: [string, string, string, string];
      };
    };
  };
  output: {
    collapsed: {
      border: {
        width: string;
        radius: string;
        color: string;
        style: string;
      };
    };
    opened: {
      border: {
        width: string;
        radius: string;
        color: string;
        style: string;
      };
    };
  }
}

export const getStylesByUiConnectVariant = ({ codes }: {
  codes?: TUiConnectVariant[];
}): TBorderRadiusResult => {
  const res: TBorderRadiusResult = {
    values: {
      collapsed: {
        border: {
          width: [2, 2, 2, 2],
          radius: [28, 28, 28, 28],
          color: ['#959eaa', '#959eaa', '#959eaa', '#959eaa'],
          style: ['solid', 'solid', 'solid', 'solid'],
        },
      },
      opened: {
        border: {
          width: [2, 2, 2, 2],
          radius: [20, 20, 20, 20],
          color: ['#959eaa', '#959eaa', '#959eaa', '#959eaa'],
          style: ['solid', 'solid', 'solid', 'solid'],
        },
      },
    },
    output: {
      collapsed: {
        border: {
          width: '2px',
          radius: '28px 28px 28px 28px',
          color: 'lightgray lightgray lightgray lightgray',
          style: 'solid solid solid solid',
        },
      },
      opened: {
        border: {
          width: '2px',
          radius: '20px 20px 20px 20px',
          color: 'lightgray lightgray lightgray lightgray',
          style: 'solid solid solid solid',
        }
      },
    },
  }
  switch (true) {
    case !codes:
      // Nothing...
      break
    case codes?.includes('top'):
      res.values.collapsed.border.radius[0] = 0
      res.values.collapsed.border.radius[1] = 0
      res.values.opened.border.radius[0] = 0
      res.values.opened.border.radius[1] = 0

      res.values.collapsed.border.width[0] = 0
      res.values.opened.border.width[0] = 0

      res.values.collapsed.border.color[0] = 'transparent'
      res.values.opened.border.color[0] = 'transparent'

      res.values.collapsed.border.style[0] = 'none'
      res.values.opened.border.style[0] = 'none'
      break
    default:
      break
  }
  res.output.collapsed.border.radius = res.values.collapsed.border.radius.map((n) => `${n}px`).join(' ')
  res.output.opened.border.radius = res.values.opened.border.radius.map((n) => `${n}px`).join(' ')

  res.output.collapsed.border.width = res.values.collapsed.border.width.map((n) => `${n}px`).join(' ')
  res.output.opened.border.width = res.values.opened.border.width.map((n) => `${n}px`).join(' ')

  res.output.collapsed.border.color = res.values.collapsed.border.color.join(' ')
  res.output.opened.border.color = res.values.opened.border.color.join(' ')
  return res
}
