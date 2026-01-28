<template>
  <div class="radar-chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import {
  Chart,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip
} from 'chart.js'

// 註冊 Chart.js 組件
Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip)

const props = defineProps({
  data: {
    type: Array,
    required: true,
    validator: (val) => val.length === 5
  },
  labels: {
    type: Array,
    default: () => ['地緣', '特質', '共鳴', '契合', '星運']
  },
  animated: {
    type: Boolean,
    default: true
  }
})

const chartCanvas = ref(null)
let chartInstance = null

function createChart() {
  if (!chartCanvas.value) return

  const ctx = chartCanvas.value.getContext('2d')

  chartInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: props.labels,
      datasets: [
        {
          label: '緣分指數',
          data: props.data,
          backgroundColor: 'rgba(46, 98, 86, 0.25)',
          borderColor: 'rgba(46, 98, 86, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(46, 98, 86, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(46, 98, 86, 1)',
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0 // 直線連接
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: props.animated
        ? {
            duration: 1500,
            easing: 'easeOutQuart'
          }
        : false,
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: {
            stepSize: 20,
            color: 'rgba(92, 75, 61, 0.6)',
            backdropColor: 'transparent',
            font: {
              size: 11
            }
          },
          grid: {
            color: 'rgba(46, 98, 86, 0.2)',
            lineWidth: 1
          },
          angleLines: {
            color: 'rgba(46, 98, 86, 0.3)',
            lineWidth: 1
          },
          pointLabels: {
            color: 'rgba(56, 39, 16, 1)',
            font: {
              size: 14,
              weight: 'bold'
            }
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(56, 39, 16, 0.9)',
          titleColor: 'rgba(237, 201, 32, 1)',
          bodyColor: 'rgba(252, 250, 242, 1)',
          borderColor: 'rgba(46, 98, 86, 0.5)',
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          callbacks: {
            label: (context) => `${context.parsed.r} 分`
          }
        }
      }
    }
  })
}

function updateChart() {
  if (chartInstance) {
    chartInstance.data.datasets[0].data = props.data
    chartInstance.update()
  }
}

onMounted(() => {
  createChart()
})

watch(
  () => props.data,
  () => {
    updateChart()
  },
  { deep: true }
)
</script>

<style scoped>
.radar-chart-container {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  aspect-ratio: 1 / 1;
}
</style>
