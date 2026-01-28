import { useBreakpoints } from '@vueuse/core'

export const useScreen = () => {
  const breakpoints = useBreakpoints({
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  })

  const isMobile = breakpoints.smaller('md')
  const isTablet = breakpoints.between('md', 'lg')
  const isDesktop = breakpoints.greaterOrEqual('md')

  return {
    isMobile,
    isDesktop,
    isTablet,
    breakpoints
  }
}
