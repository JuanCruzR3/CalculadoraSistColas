import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:ml-64">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Teoría de Colas
        </h1>
        
        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          <p className="text-lg leading-relaxed">
            Este proyecto fue desarrollado por Juan Cruz Rodriguez, estudiante de carrera Ingeniería en Sistemas de 
            Información en la Universidad Abierta Interamericana.
          </p>
          
          <p className="text-lg leading-relaxed">
            El objetivo de este proyecto es simular un sistema de colas, para poder analizar y estudiar el 
            comportamiento de los sistemas de espera.
          </p>
          
          <p className="text-lg leading-relaxed">
            La Teoría de Colas es una rama de las matemáticas que estudia la formación de líneas de espera, es decir, el 
            estudio de los sistemas de espera.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Modelos Disponibles
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">M/M/1</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Sistema con un servidor, llegadas Poisson y servicio exponencial.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">M/M/2</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Sistema con dos servidores en paralelo, llegadas Poisson y servicio exponencial.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">M/M/1/N</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Sistema M/M/1 con capacidad limitada a N clientes.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">M/G/1</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Sistema con un servidor, llegadas Poisson y distribución general de servicio.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">M/D/1</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Sistema con un servidor, llegadas Poisson y servicio determinístico.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;