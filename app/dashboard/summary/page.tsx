"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@clerk/nextjs';
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

interface DailyStats {
  date: string;
  totalRecords: number;
  avgBloodSugar: number;
  minBloodSugar: number;
  maxBloodSugar: number;
  food: number;
  drink: number;
}

// Pastikan komponen dideklarasikan sebagai function component React
const SummaryPage: React.FC = () => {
  const { userId } = useAuth();
  const [records, setRecords] = useState<BloodSugarRecord[]>([]);
  const [processedData, setProcessedData] = useState<DailyStats[]>([]);

  useEffect(() => {
    const fetchRecords = async () => {
      if (!userId) return;
      
      try {
        const response = await fetch('/api/blood-sugar');
        if (response.ok) {
          const data = await response.json();
          setRecords(data);
          processData(data);
        }
      } catch (error) {
        console.error('Error fetching records:', error);
      }
    };

    fetchRecords();
  }, [userId]);

  const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateStr).toLocaleDateString('id-ID', options);
  };

  const processData = (records: BloodSugarRecord[]) => {
    const dailyData = records.reduce((acc: Record<string, any>, record) => {
      const date = record.date;
      if (!acc[date]) {
        acc[date] = {
          date: formatDate(date),
          totalRecords: 0,
          avgBloodSugar: 0,
          minBloodSugar: Infinity,
          maxBloodSugar: -Infinity,
          food: 0,
          drink: 0,
          readings: []
        };
      }
      
      acc[date].totalRecords += 1;
      acc[date].readings.push(record.bloodSugar);
      acc[date][record.type] += 1;
      acc[date].minBloodSugar = Math.min(acc[date].minBloodSugar, record.bloodSugar);
      acc[date].maxBloodSugar = Math.max(acc[date].maxBloodSugar, record.bloodSugar);
      
      return acc;
    }, {});

    const processedStats = Object.values(dailyData).map((day: any) => ({
      ...day,
      avgBloodSugar: Math.round(
        day.readings.reduce((a: number, b: number) => a + b, 0) / day.readings.length
      ),
      minBloodSugar: day.minBloodSugar === Infinity ? 0 : day.minBloodSugar,
      maxBloodSugar: day.maxBloodSugar === -Infinity ? 0 : day.maxBloodSugar
    })).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setProcessedData(processedStats);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 pt-28">
          <div className="max-w-4xl mx-auto space-y-8">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Ringkasan Data</h2>
              
              {/* Statistik Hari Ini */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Pengukuran</h3>
                  <p className="text-2xl font-bold">{processedData[0]?.totalRecords || 0}</p>
                </Card>
                <Card className="p-4">
                  <h3 className="text-sm font-medium text-gray-500">Rata-rata</h3>
                  <p className="text-2xl font-bold">{processedData[0]?.avgBloodSugar || 0} mg/dL</p>
                </Card>
                <Card className="p-4">
                  <h3 className="text-sm font-medium text-gray-500">Minimum</h3>
                  <p className="text-2xl font-bold">{processedData[0]?.minBloodSugar || 0} mg/dL</p>
                </Card>
                <Card className="p-4">
                  <h3 className="text-sm font-medium text-gray-500">Maximum</h3>
                  <p className="text-2xl font-bold">{processedData[0]?.maxBloodSugar || 0} mg/dL</p>
                </Card>
              </div>

              {/* Tabel Ringkasan */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Total Pengukuran</TableHead>
                      <TableHead>Rata-rata</TableHead>
                      <TableHead>Min</TableHead>
                      <TableHead>Max</TableHead>
                      <TableHead>Makanan</TableHead>
                      <TableHead>Minuman</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedData.map((day) => (
                      <TableRow key={day.date}>
                        <TableCell>{day.date}</TableCell>
                        <TableCell>{day.totalRecords}</TableCell>
                        <TableCell>{day.avgBloodSugar} mg/dL</TableCell>
                        <TableCell>{day.minBloodSugar} mg/dL</TableCell>
                        <TableCell>{day.maxBloodSugar} mg/dL</TableCell>
                        <TableCell>{day.food}</TableCell>
                        <TableCell>{day.drink}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
};

// Pastikan untuk mengekspor komponen sebagai default
export default SummaryPage; 