// Halaman Statistik
"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useAuth } from '@clerk/nextjs';
import {
  BarChart as RechartsBarChart,
  Bar as RechartsBar,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
  CartesianGrid as RechartsCartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line as RechartsLine,
  PieChart as RechartsPieChart,
  Pie as RechartsPie,
  Cell
} from 'recharts';
import { Navbar } from "@/components/Navbar";

interface BloodSugarRecord {
  id: string;
  date: string;
  time: string;
  bloodSugar: number;
  age: string;
  type: string;
  description: string;
  condition: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const StatisticsPage: React.FC = () => {
  const { userId } = useAuth();
  const [records, setRecords] = useState<BloodSugarRecord[]>([]);
  const [timeRangeData, setTimeRangeData] = useState<any[]>([]);
  const [conditionData, setConditionData] = useState<any[]>([]);

  useEffect(() => {
    const fetchRecords = async () => {
      if (!userId) return;
      
      try {
        const response = await fetch('/api/blood-sugar');
        if (response.ok) {
          const data = await response.json();
          setRecords(data);
          processTimeRangeData(data);
          processConditionData(data);
        }
      } catch (error) {
        console.error('Error fetching records:', error);
      }
    };

    fetchRecords();
  }, [userId]);

  const processTimeRangeData = (records: BloodSugarRecord[]) => {
    const timeRanges = records.reduce((acc: any, record) => {
      const hour = parseInt(record.time.split(':')[0]);
      let timeRange = '';
      
      if (hour >= 4 && hour < 10) timeRange = 'Pagi (04:00-10:00)';
      else if (hour >= 10 && hour < 15) timeRange = 'Siang (10:00-15:00)';
      else if (hour >= 15 && hour < 18) timeRange = 'Sore (15:00-18:00)';
      else if (hour >= 18 && hour < 22) timeRange = 'Malam (18:00-22:00)';
      else timeRange = 'Dini Hari (22:00-04:00)';

      if (!acc[timeRange]) {
        acc[timeRange] = {
          name: timeRange,
          avgBloodSugar: 0,
          count: 0,
          readings: []
        };
      }

      acc[timeRange].readings.push(record.bloodSugar);
      acc[timeRange].count += 1;
      
      return acc;
    }, {});

    const processedData = Object.values(timeRanges).map((range: any) => ({
      ...range,
      avgBloodSugar: Math.round(
        range.readings.reduce((a: number, b: number) => a + b, 0) / range.count
      )
    }));

    setTimeRangeData(processedData);
  };

  const processConditionData = (records: BloodSugarRecord[]) => {
    const conditions = records.reduce((acc: any, record) => {
      if (!acc[record.condition]) {
        acc[record.condition] = {
          name: record.condition === 'normal' ? 'Sewaktu' :
                record.condition === 'fasting' ? 'Puasa' :
                record.condition === 'after-meal' ? 'Setelah Makan' : 'Sebelum Tidur',
          value: 0
        };
      }
      acc[record.condition].value += 1;
      return acc;
    }, {});

    setConditionData(Object.values(conditions));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-28 max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        {/* Trend Waktu */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6 pt-5">Trend Berdasarkan Waktu</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart
                data={timeRangeData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <RechartsCartesianGrid strokeDasharray="3 3" />
                <RechartsXAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <RechartsYAxis />
                <RechartsTooltip />
                <RechartsLegend />
                <RechartsLine
                  type="monotone"
                  dataKey="avgBloodSugar"
                  name="Rata-rata Gula Darah"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Distribusi Kondisi */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Distribusi Kondisi Pengukuran</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <RechartsPie
                  data={conditionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {conditionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </RechartsPie>
                <RechartsTooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Statistik per Jenis */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Perbandingan Makanan vs Minuman</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={records.reduce((acc: any[], record) => {
                  const existingDay = acc.find(item => item.date === record.date);
                  if (existingDay) {
                    existingDay[record.type] += 1;
                  } else {
                    acc.push({
                      date: record.date,
                      food: record.type === 'food' ? 1 : 0,
                      drink: record.type === 'drink' ? 1 : 0
                    });
                  }
                  return acc;
                }, [])}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <RechartsCartesianGrid strokeDasharray="3 3" />
                <RechartsXAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                <RechartsYAxis />
                <RechartsTooltip />
                <RechartsLegend />
                <RechartsBar dataKey="food" name="Makanan" fill="#82ca9d" />
                <RechartsBar dataKey="drink" name="Minuman" fill="#8884d8" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StatisticsPage; 