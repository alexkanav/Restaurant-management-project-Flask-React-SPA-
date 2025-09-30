import React, { useState, useEffect, useMemo } from 'react';
import Chart from '../components/Chart';
import { toast } from 'react-toastify';
import { sendToServer } from '../utils/api';


export default function Statistics() {
  const [salesData, setSalesData] = useState(null);
  const [dishesData, setDishesData] = useState(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const { data } = await sendToServer("admin/api/statistics", null, "GET");

        if (data.salesSummary && data.dishesStats) {
          setSalesData({
            date: data.salesSummary.date,
            totalSales: data.salesSummary.totalSales,
            orders: data.salesSummary.orders,
            returningCustomers: data.salesSummary.returningCustomers,
            avgCheckSize: data.salesSummary.avgCheckSize,
          });

          setDishesData({
            dishes: data.dishesStats.dishes,
            orders: data.dishesStats.orders,
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

  const pieColors = [
    '#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F',
    '#EDC948', '#B07AA1', '#FF9DA7', '#9C755F', '#BAB0AC'
  ];

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
        backgroundColor: pieColors,
      }
    ];
  }, [dishesData]);

  if (!salesData || !dishesData) {
    return <div className="loading">Завантаження статистики...</div>;
  }

  return (
    <div className="statistics-content">
      <div className="chart-block">
        <div className="chart-title">Денний дохід та середній чек</div>
        <Chart chartType="bar" labels={salesData.date} datasets={salesSummaryChart} />
      </div>

      <div className="chart-block">
        <div className="chart-title">Частота відвідування клієнтів</div>
        <Chart chartType="line" labels={salesData.date} datasets={visitFrequencyChart} />
      </div>

      <div className="chart-block">
        <div className="chart-title">Популярні страви</div>
        <Chart chartType="pie" labels={dishesData.dishes} datasets={dishesStatsChart} />
      </div>
    </div>
  );
}
