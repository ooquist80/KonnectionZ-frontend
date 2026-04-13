<template>
  <canvas ref="canvasRef" class="particle-bg" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useThemeStore, getThemeCssVars } from '../store/themeStore'

interface Dot {
  x: number
  y: number
  r: number
  vx: number
  vy: number
  depth: number
  hue: number
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
const { activeTheme } = useThemeStore()
let dots: Dot[] = []
let animationId = 0

const layers = [
  { count: 40, speed: 0.15, size: 1, depth: 0.3 },
  { count: 30, speed: 0.3, size: 1.6, depth: 0.6 },
  { count: 20, speed: 0.6, size: 2.4, depth: 1 },
]

function createDots(width: number, height: number) {
  const theme = activeTheme.value
  dots = []
  for (const layer of layers) {
    for (let i = 0; i < layer.count; i++) {
      dots.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * layer.size + 0.5,
        vx: (Math.random() - 0.5) * layer.speed,
        vy: (Math.random() - 0.5) * layer.speed,
        depth: layer.depth,
        hue: Math.random() * theme.hueRange + theme.hueStart,
      })
    }
  }
}

function applyGradient() {
  const theme = activeTheme.value
  document.body.style.background = theme.gradient
  const vars = getThemeCssVars(theme.isLight)
  const root = document.documentElement
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value)
  }
}

function update(width: number, height: number) {
  for (const d of dots) {
    d.x += d.vx
    d.y += d.vy
    if (d.x < 0 || d.x > width) d.vx *= -1
    if (d.y < 0 || d.y > height) d.vy *= -1
  }
}

function draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const theme = activeTheme.value
  const lineBase = theme.isLight ? '0,0,0' : '255,255,255'
  const coreColor = theme.isLight ? '#222' : 'white'

  ctx.clearRect(0, 0, width, height)

  for (let i = 0; i < dots.length; i++) {
    for (let j = i + 1; j < dots.length; j++) {
      const dx = dots[i].x - dots[j].x
      const dy = dots[i].y - dots[j].y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < 120 && dots[i].depth > 0.5 && dots[j].depth > 0.5) {
        ctx.beginPath()
        ctx.strokeStyle = `rgba(${lineBase},${(1 - dist / 120) * 0.2})`
        ctx.moveTo(dots[i].x, dots[i].y)
        ctx.lineTo(dots[j].x, dots[j].y)
        ctx.stroke()
      }
    }
  }

  for (const d of dots) {
    const color = `hsl(${d.hue}, ${theme.saturation}%, ${theme.dotLightness}%)`

    ctx.beginPath()
    ctx.arc(d.x, d.y, d.r * 2, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.shadowColor = color
    ctx.shadowBlur = 20 * d.depth
    ctx.fill()

    ctx.beginPath()
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
    ctx.fillStyle = coreColor
    ctx.shadowBlur = 0
    ctx.fill()
  }
}

function resizeCanvas(canvas: HTMLCanvasElement) {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  resizeCanvas(canvas)
  createDots(canvas.width, canvas.height)
  applyGradient()

  const onResize = () => {
    resizeCanvas(canvas)
    createDots(canvas.width, canvas.height)
  }
  window.addEventListener('resize', onResize)

  watch(activeTheme, () => {
    applyGradient()
    createDots(canvas.width, canvas.height)
  })

  function loop() {
    update(canvas!.width, canvas!.height)
    draw(ctx!, canvas!.width, canvas!.height)
    animationId = requestAnimationFrame(loop)
  }
  loop()

  onUnmounted(() => {
    cancelAnimationFrame(animationId)
    window.removeEventListener('resize', onResize)
  })
})
</script>

<style scoped>
.particle-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}
</style>
