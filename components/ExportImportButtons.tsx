"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, Upload, FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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

// Interface baru untuk data import
interface ImportBloodSugarData {
  date: string;
  time: string;
  bloodSugar: number;
  age: string;
  type: string;
  description: string;
  condition: string;
}

interface ExportImportProps {
  data: BloodSugarRecord[];
  onImport: (data: ImportBloodSugarData[]) => void;
}

export function ExportImportButtons({ data, onImport }: ExportImportProps) {
  const formatCondition = (condition: string) => {
    switch (condition) {
      case 'normal': return 'Sewaktu';
      case 'fasting': return 'Puasa';
      case 'after-meal': return 'Setelah Makan';
      case 'before-sleep': return 'Sebelum Tidur';
      default: return condition;
    }
  };

  const formatType = (type: string) => {
    return type === 'food' ? 'Makanan' : 'Minuman';
  };

  const getStatus = (value: number, age: string) => {
    const ageNum = parseInt(age);
    if (ageNum < 6) {
      if (value < 100) return "Rendah";
      if (value > 200) return "Tinggi";
      return "Normal";
    } else if (ageNum <= 12) {
      if (value < 70) return "Rendah";
      if (value > 150) return "Tinggi";
      return "Normal";
    } else {
      if (value < 70) return "Rendah";
      if (value > 130) return "Tinggi";
      return "Normal";
    }
  };

  const exportToExcel = () => {
    // Format data untuk excel
    const formattedData = data.map(record => ({
      'Tanggal': record.date,
      'Waktu': record.time,
      'Gula Darah (mg/dL)': record.bloodSugar,
      'Status': getStatus(record.bloodSugar, record.age),
      'Usia': record.age,
      'Jenis': formatType(record.type),
      'Kondisi': formatCondition(record.condition),
      'Deskripsi': record.description
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat Gula Darah");
    
    // Atur lebar kolom
    const wscols = [
      { wch: 12 }, // Tanggal
      { wch: 8 },  // Waktu
      { wch: 15 }, // Gula Darah
      { wch: 10 }, // Status
      { wch: 6 },  // Usia
      { wch: 10 }, // Jenis
      { wch: 15 }, // Kondisi
      { wch: 30 }, // Deskripsi
    ];
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook, "riwayat-gula-darah.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(16);
    doc.text("Riwayat Data Gula Darah", 14, 15);
    doc.setFontSize(10);
    doc.text(`Diekspor pada: ${new Date().toLocaleString('id-ID')}`, 14, 25);

    // Tabel
    const tableColumn = [
      "Tanggal", 
      "Waktu", 
      "Gula Darah", 
      "Status",
      "Usia", 
      "Jenis", 
      "Kondisi", 
      "Deskripsi"
    ];
    
    const tableRows = data.map(record => [
      record.date,
      record.time,
      `${record.bloodSugar} mg/dL`,
      getStatus(record.bloodSugar, record.age),
      record.age,
      formatType(record.type),
      formatCondition(record.condition),
      record.description
    ]);

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      styles: { fontSize: 8, cellPadding: 1.5 },
      headStyles: { fillColor: [76, 175, 80] },
      columnStyles: {
        0: { cellWidth: 20 }, // Tanggal
        1: { cellWidth: 15 }, // Waktu
        2: { cellWidth: 20 }, // Gula Darah
        3: { cellWidth: 15 }, // Status
        4: { cellWidth: 10 }, // Usia
        5: { cellWidth: 15 }, // Jenis
        6: { cellWidth: 20 }, // Kondisi
        7: { cellWidth: 'auto' } // Deskripsi
      },
      theme: 'grid'
    });

    doc.save("riwayat-gula-darah.pdf");
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      // Format data kembali ke struktur yang diharapkan
      const formattedData: ImportBloodSugarData[] = jsonData.map((item: any) => ({
        date: item['Tanggal'],
        time: item['Waktu'],
        bloodSugar: parseFloat(item['Gula Darah (mg/dL)']),
        age: item['Usia'].toString(),
        type: item['Jenis'] === 'Makanan' ? 'food' : 'drink',
        condition: item['Kondisi'] === 'Sewaktu' ? 'normal' :
                  item['Kondisi'] === 'Puasa' ? 'fasting' :
                  item['Kondisi'] === 'Setelah Makan' ? 'after-meal' : 'before-sleep',
        description: item['Deskripsi'] || ''
      }));
      
      onImport(formattedData);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={exportToExcel}
      >
        <FileSpreadsheet className="h-4 w-4" />
        Excel
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={exportToPDF}
      >
        <FileText className="h-4 w-4" />
        PDF
      </Button>
      
      <div className="relative">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleImport}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Import
        </Button>
      </div>
    </div>
  );
} 