import { onMounted, ref, watch } from 'vue';
import { Chart } from 'chart.js';

export default {
  name: 'StatsChart',
  props: {
    statistics: { type: Object, required: true },
  },
  template: `<div class="stats-chart-card">
    <canvas ref="chartCanvas"></canvas>
  </div>`,
  setup(props, { expose }) {
    const chartCanvas = ref(null);
    let chart = null;

    const createChart = () => {
      if (!chartCanvas.value) return;
      if (chart) chart.destroy();

      const ctx = chartCanvas.value.getContext('2d');
      chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Schools', 'Active', 'Inactive', 'Students', 'Admins'],
          datasets: [{
            label: 'Platform Overview',
            data: [
              props.statistics.schools || 0,
              props.statistics.activeSchools || 0,
              props.statistics.inactiveSchools || 0,
              props.statistics.students || 0,
              props.statistics.schoolAdministrators || 0,
            ],
            backgroundColor: [
              'rgba(37, 89, 214, 0.7)',
              'rgba(22, 132, 90, 0.7)',
              'rgba(198, 83, 61, 0.7)',
              'rgba(92, 52, 220, 0.7)',
              'rgba(60, 120, 180, 0.7)',
            ],
            borderColor: [
              '#2559d6',
              '#16845a',
              '#c6533d',
              '#5c34dc',
              '#3c78b4',
            ],
            borderWidth: 2,
            borderRadius: 6,
            barPercentage: 0.4,
            categoryPercentage: 0.6,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: 'Platform Overview',
              font: { size: 16, weight: '600' },
            },
          },
          scales: {
          y: {
            beginAtZero: true,
            max: 10,
            ticks: { stepSize: 5 },
            title: { display: true, text: 'Count', font: { weight: '600' } },
          },
            x: {
              title: { display: true, text: 'Metric', font: { weight: '600' } },
            },
          },
        },
      });
    };

    onMounted(createChart);

    watch(() => props.statistics, createChart, { deep: true });

    expose({ chart, update: createChart });

    return { chartCanvas };
  },
};
