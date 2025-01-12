"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreVertical, Edit, Trash } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ExportImportButtons } from "@/components/ExportImportButtons";

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

export default function Dashboard() {
  const { userId } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    bloodSugar: "",
    age: "",
    type: "food",
    description: "",
    condition: "normal"
  });

  const [records, setRecords] = useState<BloodSugarRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCondition, setFilterCondition] = useState<string>("all");
  const [editingRecord, setEditingRecord] = useState<BloodSugarRecord | null>(null);
  const [editFormData, setEditFormData] = useState({
    date: "",
    time: "",
    bloodSugar: "",
    age: "",
    type: "food",
    description: "",
    condition: "normal"
  });

  // Handle auth
  useEffect(() => {
    if (!userId) {
      router.push('/sign-in');
    }
  }, [userId, router]);

  // Fetch records
  useEffect(() => {
    const fetchRecords = async () => {
      if (!userId) return;
      
      try {
        const response = await fetch('/api/blood-sugar');
        if (response.ok) {
          const data = await response.json();
          setRecords(data);
        }
      } catch (error) {
        console.error('Error fetching records:', error);
      }
    };

    fetchRecords();
  }, [userId]);

  const getStatus = (value: number, age: string) => {
    if (!age) return "Tidak dapat ditentukan";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/blood-sugar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          bloodSugar: Number(formData.bloodSugar)
        }),
      });

      if (response.ok) {
        const newRecord = await response.json();
        setRecords(prev => [...prev, newRecord]);
        setFormData({
          date: "",
          time: "",
          bloodSugar: "",
          age: "",
          type: "food",
          description: "",
          condition: "normal"
        });
      }
    } catch (error) {
      console.error('Error saving record:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

    try {
      const response = await fetch(`/api/blood-sugar/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setRecords(prev => prev.filter(record => record.id !== id));
      }
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  const handleEditClick = (record: BloodSugarRecord) => {
    setEditingRecord(record);
    setEditFormData({
      date: record.date,
      time: record.time,
      bloodSugar: record.bloodSugar.toString(),
      age: record.age,
      type: record.type,
      description: record.description,
      condition: record.condition
    });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    try {
      const response = await fetch(`/api/blood-sugar/${editingRecord.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editFormData,
          bloodSugar: Number(editFormData.bloodSugar)
        }),
      });

      if (response.ok) {
        const updatedRecord = await response.json();
        setRecords(prev => prev.map(record => 
          record.id === updatedRecord.id ? updatedRecord : record
        ));
        setEditingRecord(null);
      }
    } catch (error) {
      console.error('Error updating record:', error);
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || record.type === filterType;
    const matchesCondition = filterCondition === "all" || record.condition === filterCondition;
    return matchesSearch && matchesType && matchesCondition;
  });

  const handleImport = (importedData: any[]) => {
    // Konversi data yang diimpor ke format yang sesuai
    const formattedData = importedData.map(item => ({
      date: item.date,
      time: item.time,
      bloodSugar: Number(item.bloodSugar),
      age: item.age,
      type: item.type,
      description: item.description,
      condition: item.condition
    }));

    // Kirim data ke API
    const saveImportedData = async () => {
      try {
        const response = await fetch('/api/blood-sugar/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ records: formattedData }),
        });

        if (response.ok) {
          // Refresh data setelah import berhasil
          const updatedRecords = await response.json();
          setRecords(updatedRecords);
        }
      } catch (error) {
        console.error('Error importing records:', error);
      }
    };

    saveImportedData();
  };

  return (
    <div>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 pt-20">
          <div className="max-w-4xl mx-auto space-y-8">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6 text-green-400">RiseBar Tracker Gula Darah</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Tanggal</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Waktu</Label>
                    <Input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Kadar Gula Darah (mg/dL)</Label>
                    <Input
                      type="number"
                      value={formData.bloodSugar}
                      onChange={(e) => setFormData({ ...formData, bloodSugar: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Usia</Label>
                    <Input
                      type="text"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Jenis</Label>
                  <RadioGroup
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="food" id="food" />
                      <Label htmlFor="food">Makanan</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="drink" id="drink" />
                      <Label htmlFor="drink">Minuman</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Deskripsi Makanan/Minuman</Label>
                  <Textarea
                    id="description"
                    placeholder="Masukkan deskripsi makanan atau minuman"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Kondisi</Label>
                  <Select
                    value={formData.condition}
                    onValueChange={(value) => setFormData({ ...formData, condition: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kondisi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Sewaktu (Tanpa Puasa)</SelectItem>
                      <SelectItem value="fasting">Puasa</SelectItem>
                      <SelectItem value="after-meal">Setelah Makan</SelectItem>
                      <SelectItem value="before-sleep">Sebelum Tidur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" variant="green" className="w-full">
                  Simpan Data
                </Button>
              </form>
            </Card>

            {records.length > 0 && (
              <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Riwayat Gula Darah</h2>
                  <div className="flex items-center gap-4">
                    <ExportImportButtons 
                      data={records}
                      onImport={handleImport}
                    />
                    <Input
                      placeholder="Cari..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Waktu</TableHead>
                        <TableHead>Nilai</TableHead>
                        <TableHead>Jenis</TableHead>
                        <TableHead>Deskripsi</TableHead>
                        <TableHead>Kondisi</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[100px]">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{record.date}</TableCell>
                          <TableCell>{record.time}</TableCell>
                          <TableCell>{record.bloodSugar} mg/dL</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {record.type === 'food' ? 'Makanan' : 'Minuman'}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {record.description}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {record.condition === 'normal' && 'Sewaktu'}
                              {record.condition === 'fasting' && 'Puasa'}
                              {record.condition === 'after-meal' && 'Setelah Makan'}
                              {record.condition === 'before-sleep' && 'Sebelum Tidur'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={getStatus(record.bloodSugar, record.age) === "Normal" ? "default" : "destructive"}
                            >
                              {getStatus(record.bloodSugar, record.age)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditClick(record)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(record.id)}
                                  className="text-red-600"
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  Hapus
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}

            <Dialog 
              open={!!editingRecord} 
              onOpenChange={(open) => {
                if (!open) setEditingRecord(null);
              }}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Data</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEdit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tanggal</Label>
                      <Input
                        type="date"
                        value={editFormData.date}
                        onChange={(e) => setEditFormData(prev => ({
                          ...prev,
                          date: e.target.value
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Waktu</Label>
                      <Input
                        type="time"
                        value={editFormData.time}
                        onChange={(e) => setEditFormData(prev => ({
                          ...prev,
                          time: e.target.value
                        }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Kadar Gula Darah (mg/dL)</Label>
                      <Input
                        type="number"
                        value={editFormData.bloodSugar}
                        onChange={(e) => setEditFormData(prev => ({
                          ...prev,
                          bloodSugar: e.target.value
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Usia</Label>
                      <Input
                        type="text"
                        value={editFormData.age}
                        onChange={(e) => setEditFormData(prev => ({
                          ...prev,
                          age: e.target.value
                        }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Jenis</Label>
                    <RadioGroup
                      value={editFormData.type}
                      onValueChange={(value) => setEditFormData(prev => ({
                        ...prev,
                        type: value
                      }))}
                    >
                      <div className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="food" id="edit-food" />
                          <Label htmlFor="edit-food">Makanan</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="drink" id="edit-drink" />
                          <Label htmlFor="edit-drink">Minuman</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>Kondisi</Label>
                    <Select
                      value={editFormData.condition}
                      onValueChange={(value) => setEditFormData(prev => ({
                        ...prev,
                        condition: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kondisi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Sewaktu (Tanpa Puasa)</SelectItem>
                        <SelectItem value="fasting">Puasa</SelectItem>
                        <SelectItem value="after-meal">Setelah Makan</SelectItem>
                        <SelectItem value="before-sleep">Sebelum Tidur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Deskripsi</Label>
                    <Textarea
                      value={editFormData.description}
                      onChange={(e) => setEditFormData(prev => ({
                        ...prev,
                        description: e.target.value
                      }))}
                    />
                  </div>

                  <Button type="submit" variant="green" className="w-full">
                    Simpan Perubahan
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </main>
    </div>
  );
}