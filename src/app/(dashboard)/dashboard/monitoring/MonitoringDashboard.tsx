'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { 
  AlertTriangle, 
  Activity, 
  Clock, 
  Calendar,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, boolean>;
  metrics: {
    errorRate: number;
    avgLatency: number;
    queueSize: number;
  };
}

interface MetricsData {
  summary: {
    totalRequests: number;
    errorCount: number;
    errorRate: number;
    avgLatency: number;
    maxLatency: number;
    bookingsToday: number;
  };
  performance: {
    buckets: Array<{
      timestamp: string;
      apiLatency: number;
      errorRate: number;
      count: number;
    }>;
    slowEndpoints: Array<{
      route: string;
      avgDuration: number;
      count: number;
    }>;
  };
}

interface ErrorData {
  errors: Array<{
    id: string;
    level: string;
    message: string;
    url?: string;
    timestamp: string;
    resolved: boolean;
  }>;
  statistics: {
    byLevel: Record<string, number>;
    trends: Array<{ timestamp: string; count: number }>;
    commonErrors: Array<{ message: string; count: number }>;
  };
}

export default function MonitoringDashboard() {
  const [timeRange, setTimeRange] = useState('1h');
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [errors, setErrors] = useState<ErrorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchAllData = useCallback(async () => {
    try {
      const [healthRes, metricsRes, errorsRes] = await Promise.all([
        fetch('/api/admin/monitoring/health'),
        fetch(`/api/admin/monitoring/metrics?range=${timeRange}`),
        fetch(`/api/admin/monitoring/errors?range=${timeRange}&limit=20`)
      ]);

      if (healthRes.ok) {
        setHealth(await healthRes.json());
      }
      if (metricsRes.ok) {
        setMetrics(await metricsRes.json());
      }
      if (errorsRes.ok) {
        setErrors(await errorsRes.json());
      }
      
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchAllData();
      }, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchAllData]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'unhealthy': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'text-red-600 bg-red-100';
      case 'ERROR': return 'text-red-500 bg-red-50';
      case 'WARNING': return 'text-yellow-600 bg-yellow-100';
      case 'INFO': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading monitoring data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Auto-refresh
          </label>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <button
            onClick={fetchAllData}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* System Health Overview */}
      {health && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">System Health</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(health.status)}`}>
              {health.status.toUpperCase()}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(health.checks).map(([check, status]) => (
              <div key={check} className="flex items-center gap-2">
                {status ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="text-sm font-medium capitalize">{check.replace(/([A-Z])/g, ' $1')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Requests"
            value={metrics.summary.totalRequests.toLocaleString()}
            icon={<Activity className="w-6 h-6" />}
            color="blue"
          />
          <MetricCard
            title="Avg Response Time"
            value={`${metrics.summary.avgLatency}ms`}
            icon={<Clock className="w-6 h-6" />}
            color="green"
            subtitle={`Max: ${metrics.summary.maxLatency}ms`}
          />
          <MetricCard
            title="Error Rate"
            value={`${metrics.summary.errorRate}%`}
            icon={<AlertTriangle className="w-6 h-6" />}
            color={metrics.summary.errorRate > 5 ? "red" : "green"}
            subtitle={`${metrics.summary.errorCount} errors`}
          />
          <MetricCard
            title="Bookings Today"
            value={metrics.summary.bookingsToday.toString()}
            icon={<Calendar className="w-6 h-6" />}
            color="purple"
          />
        </div>
      )}

      {/* Performance Charts */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* API Latency Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">API Response Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.performance.buckets}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatTimestamp}
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  labelFormatter={(value) => formatTimestamp(value as string)}
                  formatter={(value: number) => [`${value}ms`, 'Response Time']}
                />
                <Line 
                  type="monotone" 
                  dataKey="apiLatency" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Error Rate Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Rate</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.performance.buckets}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatTimestamp}
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  labelFormatter={(value) => formatTimestamp(value as string)}
                  formatter={(value: number) => [`${value}%`, 'Error Rate']}
                />
                <Line 
                  type="monotone" 
                  dataKey="errorRate" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Slow Endpoints */}
      {metrics && metrics.performance.slowEndpoints.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Slowest Endpoints</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Endpoint
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requests
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {metrics.performance.slowEndpoints.map((endpoint, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {endpoint.route}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        endpoint.avgDuration > 2000 ? 'bg-red-100 text-red-800' :
                        endpoint.avgDuration > 1000 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {endpoint.avgDuration}ms
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {endpoint.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Errors */}
      {errors && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Errors</h3>
            {errors.statistics.byLevel && (
              <div className="flex gap-2">
                {Object.entries(errors.statistics.byLevel).map(([level, count]) => (
                  <span 
                    key={level}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(level)}`}
                  >
                    {level}: {count}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            {errors.errors.slice(0, 10).map((error) => (
              <div key={error.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(error.level)}`}>
                        {error.level}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(error.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium mb-1">
                      {error.message}
                    </p>
                    {error.url && (
                      <p className="text-xs text-gray-500 font-mono">
                        {error.url}
                      </p>
                    )}
                  </div>
                  <div className="ml-4">
                    {error.resolved ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'purple' | 'yellow';
  subtitle?: string;
}

function MetricCard({ title, value, icon, color, subtitle }: MetricCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    red: 'text-red-600 bg-red-100',
    purple: 'text-purple-600 bg-purple-100',
    yellow: 'text-yellow-600 bg-yellow-100',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
