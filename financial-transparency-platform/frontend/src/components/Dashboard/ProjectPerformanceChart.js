import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import Badge from '../UI/Badge';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ProjectPerformanceChart = ({ data }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            return `${label}: ${formatCurrency(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Projects'
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Amount'
        },
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      }
    },
    elements: {
      bar: {
        borderRadius: 4
      }
    }
  };

  const chartData = {
    labels: data?.projects?.map(project => project.name) || [],
    datasets: [
      {
        label: 'Budget Allocated',
        data: data?.projects?.map(project => project.budgetAllocated) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1
      },
      {
        label: 'Amount Spent',
        data: data?.projects?.map(project => project.amountSpent) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1
      }
    ]
  };

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'primary';
      case 'on_hold':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getUtilizationColor = (utilization) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (!data || !data.projects || data.projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No project data</h3>
          <p className="mt-1 text-sm text-gray-500">Project performance will appear here when projects are created.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
      
      {/* Project details table */}
      <div className="mt-6">
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spent
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilization
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.projects.map((project, index) => {
                const utilization = project.budgetAllocated > 0 
                  ? (project.amountSpent / project.budgetAllocated) * 100 
                  : 0;
                
                return (
                  <tr key={project.id || index} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{project.name}</div>
                        {project.department && (
                          <div className="text-xs text-gray-500">{project.department}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                      {formatCurrency(project.budgetAllocated)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatCurrency(project.amountSpent)}
                    </td>
                    <td className={`px-3 py-2 whitespace-nowrap text-sm text-right font-medium ${getUtilizationColor(utilization)}`}>
                      {formatPercentage(utilization / 100)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-center">
                      <Badge variant={getStatusVariant(project.status)}>
                        {project.status?.replace('_', ' ') || 'Unknown'}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              project.progress >= 100 ? 'bg-green-600' :
                              project.progress >= 75 ? 'bg-blue-600' :
                              project.progress >= 50 ? 'bg-yellow-600' :
                              'bg-gray-400'
                            }`}
                            style={{ width: `${Math.min(project.progress || 0, 100)}%` }}
                          />
                        </div>
                        <span className="ml-2 text-xs text-gray-600">
                          {project.progress || 0}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary statistics */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500">Total Projects</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">
            {data.projects.length}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500">Avg Utilization</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">
            {formatPercentage(
              data.projects.reduce((sum, project) => {
                const utilization = project.budgetAllocated > 0 
                  ? (project.amountSpent / project.budgetAllocated) * 100 
                  : 0;
                return sum + utilization;
              }, 0) / (data.projects.length * 100)
            )}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500">Completed</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">
            {data.projects.filter(p => p.status?.toLowerCase() === 'completed').length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPerformanceChart;
