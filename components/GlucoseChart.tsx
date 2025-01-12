'use client'

import { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'
import prisma from '../lib/prisma'

export function GlucoseChart() {
  const chartRef = useRef<HTMLCanvasElement | null>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/entries')
      const entries = await response.json()

      if (chartRef.current) {
        const ctx = chartRef.current.getContext('2d')
        if (ctx) {
          if (chartInstance.current) {
            chartInstance.current.destroy()
          }

          chartInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
              labels: entries.map((entry: any) => entry.date.split('T')[0]),
              datasets: [
                {
                  label: 'Glucose Level',
                  data: entries.map((entry: any) => entry.glucose),
                  borderColor: 'rgb(75, 192, 192)',
                  tension: 0.1,
                },
              ],
            },
            options: {
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Glucose (mg/dL)',
                  },
                },
              },
            },
          })
        }
      }
    }

    fetchData()

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [])

  return <canvas ref={chartRef} />
}

