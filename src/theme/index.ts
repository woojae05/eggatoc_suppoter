import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  colors: {
    primary: {
      50: '#f7f7f7',
      100: '#e3e3e3',
      200: '#c8c8c8',
      300: '#a4a4a4',
      400: '#818181',
      500: '#666666',
      600: '#515151',
      700: '#434343',
      800: '#383838',
      900: '#1b1b1b', // RGB(27,27,27)
    },
    background: {
      50: '#fdfcfc',
      100: '#faf5f4', // RGB(250,245,244)
      200: '#f5f0ef',
      300: '#f0e9e7',
      400: '#e8ddd9',
      500: '#dfd0c9',
      600: '#d4bfb6',
      700: '#c7a89f',
      800: '#b5917f',
      900: '#a67c52',
    },
  },
  styles: {
    global: {
      body: {
        bg: 'background.100', // RGB(250,245,244)
        color: 'primary.900', // RGB(27,27,27)
        fontFamily: 'Inter, system-ui, sans-serif',
      },
    },
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '600',
        borderRadius: 'lg',
      },
      variants: {
        solid: {
          bg: 'primary.900',
          color: 'white',
          _hover: {
            bg: 'primary.800',
            transform: 'translateY(-1px)',
            boxShadow: 'lg',
          },
          _active: {
            transform: 'translateY(0)',
          },
        },
        outline: {
          borderColor: 'primary.900',
          color: 'primary.900',
          _hover: {
            bg: 'primary.50',
            borderColor: 'primary.800',
          },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'white',
          boxShadow: 'sm',
          borderRadius: 'xl',
          border: '1px solid',
          borderColor: 'background.200',
        },
      },
    },
    Input: {
      variants: {
        outline: {
          field: {
            borderColor: 'background.300',
            _hover: {
              borderColor: 'primary.300',
            },
            _focus: {
              borderColor: 'primary.900',
              boxShadow: '0 0 0 1px rgb(27, 27, 27)',
            },
          },
        },
      },
    },
  },
})

export default theme