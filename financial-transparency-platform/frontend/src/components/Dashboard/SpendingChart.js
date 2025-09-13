import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

ChartJS.register(ArcElement, Tooltip, Legend);

const SpendingChart = ({ data }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 20,
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const dataset = data.datasets[0];
                const value = dataset.data[i];
                const total = dataset.data.reduce((sum, val) => sum + val, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.borderColor[i],
                  lineWidth: dataset.borderWidth,
                  hidden: isNaN(value),
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '60%'
  };

  const chartData = {
    labels: data?.categories || [],
    datasets: [
      {
        data: data?.amounts || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',   // Blue
          'rgba(16, 185, 129, 0.8)',   // Green
          'rgba(245, 158, 11, 0.8)',   // Yellow
          'rgba(239, 68, 68, 0.8)',    // Red
          'rgba(139, 92, 246, 0.8)',   // Purple
          'rgba(236, 72, 153, 0.8)',   // Pink
          'rgba(14, 165, 233, 0.8)',   // Light Blue
          'rgba(34, 197, 94, 0.8)',    // Light Green
          'rgba(251, 191, 36, 0.8)',   // Light Yellow
          'rgba(248, 113, 113, 0.8)'   // Light Red
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(14, 165, 233, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(248, 113, 113, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  if (!data || !data.categories || data.categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No spending data</h3>
          <p className="mt-1 text-sm text-gray-500">Spending breakdown will appear here when transactions are recorded.</p>
        </div>
      </div>
    );
  }

  const total = data.amounts?.reduce((sum, amount) => sum + amount, 0) || 0;

  return (
    <div className="relative">
      <div className="h-64">
        <Doughnut data={chartData} options={options} />
      </div>
      
      {/* Center text showing total */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(total)}
          </div>
          <div className="text-sm text-gray-500">
            Total Spent
          </div>
        </div>
      </div>

      {/* Summary table below chart */}
      {data.categories && data.categories.length > 0 && (
        <div className="mt-6">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    %
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.categories.map((category, index) => {
                  const amount = data.amounts[index];
                  const percentage = total > 0 ? (amount / total) * 100 : 0;
                  
                  return (
                    <tr key={category} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ 
                              backgroundColor: chartData.datasets[0].backgroundColor[index] 
                            }}
                          />
                          {category}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(amount)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                        {formatPercentage(percentage / 100)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpendingChart;
