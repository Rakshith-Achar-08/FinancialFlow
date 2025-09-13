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
import { formatCurrency } from '../../utils/formatters';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const VendorAnalysisChart = ({ data }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Total Spent: ${formatCurrency(context.parsed.y)}`;
          },
          afterLabel: function(context) {
            const vendor = data?.vendors?.[context.dataIndex];
            if (vendor) {
              return [
                `Transactions: ${vendor.transactionCount}`,
                `Avg per Transaction: ${formatCurrency(vendor.averageTransaction)}`
              ];
            }
            return [];
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Vendors'
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
          text: 'Total Amount Spent'
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
    labels: data?.vendors?.map(vendor => vendor.name) || [],
    datasets: [
      {
        data: data?.vendors?.map(vendor => vendor.totalSpent) || [],
        backgroundColor: data?.vendors?.map((_, index) => {
          const colors = [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(14, 165, 233, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(251, 191, 36, 0.8)',
            'rgba(248, 113, 113, 0.8)'
          ];
          return colors[index % colors.length];
        }) || [],
        borderColor: data?.vendors?.map((_, index) => {
          const colors = [
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
          ];
          return colors[index % colors.length];
        }) || [],
        borderWidth: 1
      }
    ]
  };

  if (!data || !data.vendors || data.vendors.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No vendor data</h3>
          <p className="mt-1 text-sm text-gray-500">Vendor analysis will appear here when transactions are recorded.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
      
      {/* Vendor details table */}
      <div className="mt-6">
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transactions
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg/Transaction
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.vendors.map((vendor, index) => (
                <tr key={vendor.id || index} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ 
                          backgroundColor: chartData.datasets[0].backgroundColor[index] 
                        }}
                      />
                      <div>
                        <div className="font-medium">{vendor.name}</div>
                        {vendor.type && (
                          <div className="text-xs text-gray-500">{vendor.type}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                    {formatCurrency(vendor.totalSpent)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                    {vendor.transactionCount}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatCurrency(vendor.averageTransaction)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
                    {vendor.rating ? (
                      <div className="flex items-center justify-center">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(vendor.rating)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-1 text-xs">
                          {vendor.rating.toFixed(1)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorAnalysisChart;
