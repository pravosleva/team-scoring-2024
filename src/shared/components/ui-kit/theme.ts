import { createTheme } from '@mui/material/styles'

// NOTE: See also https://mui.com/material-ui/customization/theme-components/

// Augment the palette to include a salmon color
declare module '@mui/material/styles' {
  interface Palette {
    salmon: Palette['primary'];
  }

  interface PaletteOptions {
    salmon?: PaletteOptions['primary'];
  }
}

// Update the Button's color options to include a salmon option
declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    salmon: true;
  }
}

// Theme customization goes here as usual, including tonalOffset and/or
// contrastThreshold as the augmentColor() function relies on these

let _theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          width: '100%',
          borderRadius: '8px',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
        input: {
          boxShadow: 'none',
        },
      },
    },
  },
})

_theme = createTheme(_theme, {
  // Custom colors created with augmentColor go here
  palette: {
    salmon: _theme.palette.augmentColor({
      color: {
        main: '#FF5733',
      },
      name: 'salmon',
    }),
  },
});

export const theme = _theme
