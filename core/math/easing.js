export const Easing = {
  linear: t => t,
  
  quadIn: t => t * t,
  quadOut: t => t * (2 - t),
  quadInOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  
  cubicIn: t => t * t * t,
  cubicOut: t => (--t) * t * t + 1,
  cubicInOut: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  
  quartIn: t => t * t * t * t,
  quartOut: t => 1 - (--t) * t * t * t,
  quartInOut: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
  
  quintIn: t => t * t * t * t * t,
  quintOut: t => 1 + (--t) * t * t * t * t,
  quintInOut: t => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,
  
  sineIn: t => 1 - Math.cos(t * Math.PI / 2),
  sineOut: t => Math.sin(t * Math.PI / 2),
  sineInOut: t => 0.5 * (1 - Math.cos(Math.PI * t)),
  
  expoIn: t => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
  expoOut: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  expoInOut: t => {
    if (t === 0 || t === 1) return t
    if (t < 0.5) return 0.5 * Math.pow(2, 20 * t - 10)
    return 1 - 0.5 * Math.pow(2, -20 * t + 10)
  },
  
  circIn: t => 1 - Math.sqrt(1 - t * t),
  circOut: t => Math.sqrt(1 - (--t) * t),
  circInOut: t => t < 0.5 
    ? 0.5 * (1 - Math.sqrt(1 - 4 * t * t))
    : 0.5 * (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1),
  
  elasticIn: t => {
    if (t === 0 || t === 1) return t
    return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * (2 * Math.PI / 3))
  },
  elasticOut: t => {
    if (t === 0 || t === 1) return t
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1
  },
  elasticInOut: t => {
    if (t === 0 || t === 1) return t
    if (t < 0.5) {
      return -0.5 * Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * (2 * Math.PI / 4.5))
    }
    return 0.5 * Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * (2 * Math.PI / 4.5)) + 1
  },
  
  backIn: t => {
    const c1 = 1.70158
    const c3 = c1 + 1
    return c3 * t * t * t - c1 * t * t
  },
  backOut: t => {
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
  },
  backInOut: t => {
    const c1 = 1.70158
    const c2 = c1 * 1.525
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2
  },
  
  bounceIn: t => 1 - Easing.bounceOut(1 - t),
  bounceOut: t => {
    const n1 = 7.5625
    const d1 = 2.75
    if (t < 1 / d1) {
      return n1 * t * t
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375
    }
  },
  bounceInOut: t => t < 0.5 
    ? 0.5 * (1 - Easing.bounceOut(1 - 2 * t))
    : 0.5 * (1 + Easing.bounceOut(2 * t - 1))
}

export function ease(t, easing = 'linear') {
  const fn = typeof easing === 'function' ? easing : Easing[easing]
  return fn ? fn(t) : t
}
