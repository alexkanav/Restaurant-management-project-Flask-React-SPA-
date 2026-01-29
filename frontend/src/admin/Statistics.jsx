import React, { useState, useEffect, useMemo } from 'react';
import { Chart, Spinner } from '../components';
import { toast } from 'react-toastify';
import { sendToServer } from '../utils/api';
import { config } from '../config';


export default function Statistics() {
  const [salesData, setSalesData] = useState(null);
  const [dishesData, setDishesData] = useState(null);
  const startDate = config.start_date
  const endDate = config.end_date

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const { data } = await sendToServer('/api/admin/statistics', { startDate, endDate }, 'GET');
        if (data.sales_summary && data.dish_order_stats) {
          setSalesData({
            dates: data.sales_summary.dates,
            totalSales: data.sales_summary.total_sales,
            orders: data.sales_summary.orders,
            returningCustomers: data.sales_summary.returning_customers,
            avgCheckSize: data.sales_summary.avg_check_sizes,
          });

          setDishesData({
            dishes: data.dish_order_stats.dishes,
            orders: data.dish_order_stats.orders,
          });
        } else {
          throw new Error("Statistics data is incomplete");
        }
      } catch (error) {
        console.error("Error fetching Statistics:", error);
        toast.error("Помилка завантаження статистики.");
      }
    };

    fetchStatistics();
  }, []);

  const salesSummaryChart = useMemo(() => {
    if (!salesData) return null;

    return [
      {
        type: 'bar',
        barPercentage: 1,
        label: 'Дохід, грн.',
        data: salesData.totalSales,
        borderColor: '#ff7f0e',
        yAxisID: 'yLeft',
        backgroundColor: '#ff7f0e',
      },
      {
        type: 'bar',
        barPercentage: 1,
        label: 'Середній чек, грн.',
        data: salesData.avgCheckSize,
        borderColor: '#3360f8',
        yAxisID: 'yRight',
        backgroundColor: '#3360f8',
      }
    ];
  }, [salesData]);

  const visitFrequencyChart = useMemo(() => {
    if (!salesData) return null;

    return [
      {
        type: 'line',
        tension: 0.4,
        label: 'Відвідали.',
        data: salesData.orders,
        borderColor: '#ff7f0e',
        yAxisID: 'yLeft',
        backgroundColor: '#ff7f0e',
      },
      {
        type: 'line',
        tension: 0.4,
        label: 'Повернулись.',
        data: salesData.returningCustomers,
        borderColor: '#3360f8',
        yAxisID: 'yLeft',
        backgroundColor: '#3360f8',
      }
    ];
  }, [salesData]);

  const dishesStatsChart = useMemo(() => {
    if (!dishesData) return null;

    return [
      {
        label: 'Популярні страви',
        data: dishesData.orders,
        backgroundColor: config.PIE_COLORS,
      }
    ];
  }, [dishesData]);

  if (!salesData || !dishesData)
    return <Spinner />;

  return (
    <div className="dashboard-content">
      <div className="dashboard-block">
        <div className="chart-title">Денний дохід та середній чек</div>
        <Chart chartType="bar" labels={salesData.dates} datasets={salesSummaryChart} />
      </div>

      <div className="dashboard-block">
        <div className="chart-title">Частота відвідування клієнтів</div>
        <Chart chartType="line" labels={salesData.dates} datasets={visitFrequencyChart} />
      </div>

      <div className="chart-pie">
        <div className="chart-title">Популярні страви</div>
        <Chart chartType="pie" labels={dishesData.dishes} datasets={dishesStatsChart} />
      </div>
    </div>
  );
}
