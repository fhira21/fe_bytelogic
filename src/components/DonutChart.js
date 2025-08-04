import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const DonutChart = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    axios
      .get('http://be.bytelogic.orenjus.com/api/employee/evaluation-summary', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        const progressValue = response.data.github_progress || 0; // pastikan key sesuai backend
        setProgress(progressValue);
      })
      .catch((error) => {
        console.error("Error fetching progress:", error);
      });
  }, []);

  const data = {
    datasets: [
      {
        data: [progress, 100 - progress],
        backgroundColor: [ '#3B82F6'],
        cutout: '75%',
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="relative w-full max-w-[200px] h-[200px] md:h-[180px] mx-auto">
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default DonutChart;
