import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const Grafica = ({ etiquetas, datos, nombreGrafica, nombreDatos }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        text: `${nombreGrafica ? nombreGrafica : "Grafica"}`,
      },
    },
  };

  const data = {
    labels: etiquetas,
    datasets: [
      {
        label: `${nombreDatos ? nombreDatos : "Datos"}`,
        data: datos,
        backgroundColor: "rgba(37, 99, 235, 0.8)",
      },
    ],
  };

  return <Bar options={options} data={data} />;
};

export default Grafica;
