import React, { useState } from 'react';
import { X, Crown, Zap, Cloud, FileText, Repeat, Lock, Check } from 'lucide-react';
import { useUserContext } from '../../context/UserContext';

const PaywallModal = ({ onClose, featureName }) => {
  // --- Consumir contexto de usuario para obtener la función de pago ---
  const { handleManageSubscription } = useUserContext();
  
  // --- NUEVO ESTADO DE PROCESAMIENTO ---
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Lista de beneficios, usando las diferencias que establecimos
  const PRO_BENEFITS = [
    { 
        icon: <Cloud size={20} className="text-emerald-500" />, 
        title: 'Sincronización en la Nube',
        description: 'Guarda tus documentos de forma permanente en Supabase. Nunca más perderás tu trabajo.',
    },
    { 
        icon: <FileText size={20} className="text-emerald-500" />, 
        title: 'Archivos Ilimitados',
        description: 'Gestiona múltiples capítulos o borradores sin restricciones de almacenamiento.',
    },
    { 
        icon: <Zap size={20} className="text-amber-500" />, 
        title: 'Corrección y Reescribir con IA',
        description: 'Desbloquea las peticiones a la IA para refactorizar frases complejas y eliminar "paja".',
    },
    { 
        icon: <Repeat size={20} className="text-purple-500" />, 
        title: 'Análisis Avanzado',
        description: 'Acceso total a métricas premium como Show/Tell, Detector de Arcaísmos, y Pleonasmos.',
    },
  ];

  const FREE_LIMITATIONS = [
    { title: "Guardado Local (Riesgo de pérdida)", icon: <Lock size={16} className="text-red-400" /> },
    { title: "Funciones de IA limitadas", icon: <Lock size={16} className="text-red-400" /> },
    { title: "Acceso solo a métricas básicas", icon: <Lock size={16} className="text-red-400" /> },
  ];
  
  // --- MANEJADOR CORREGIDO CON TRABAJO ASÍNCRONO ---
  const handleUpgradeClick = async () => {
    if (!handleManageSubscription || isProcessing) return;

    setIsProcessing(true); // Iniciar estado de carga

    try {
        // Llamamos a la función asíncrona de pago
        await handleManageSubscription(); 

        // NOTA: Si el pago es exitoso, esta línea NO debería alcanzarse, 
        // ya que handleManageSubscription debería haber ejecutado window.location.href.
        // Si llegamos aquí, es que no hubo redirección.
        
    } catch (error) {
        console.error("Fallo al iniciar pago:", error);
        alert("Hubo un error al iniciar el proceso de pago. Inténtalo de nuevo.");
        
    } finally {
        // GARANTÍA: Si la página no se redirige, debemos re-habilitar el botón
        // para que el usuario pueda volver a hacer clic o cerrar el modal.
        setIsProcessing(false); 
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      {/* Contenedor del Modal */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header y Botón de Cerrar */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-50/50 sticky top-0">
          <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <Crown size={28} className="text-indigo-600 fill-indigo-100" />
            Actualiza al Plan PRO
          </h2>
          <button 
            onClick={onClose} 
            disabled={isProcessing} // Deshabilitar si está procesando
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 disabled:opacity-50"
            title="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Columna de Beneficios PRO */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-indigo-700 uppercase tracking-wider border-b border-indigo-100 pb-2">
              Beneficios Exclusivos PRO
            </h3>
            <ul className="space-y-4">
              {PRO_BENEFITS.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 mt-1">{item.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">{item.title}</h4>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna de Precios y Limitaciones FREE */}
          <div className="space-y-6">
            <div className="bg-indigo-600 text-white p-6 rounded-xl shadow-lg text-center">
              <p className="text-sm font-medium mb-2">Empieza tu prueba</p>
              <h4 className="4xl font-black leading-tight">
                €2.90<span className="text-lg font-medium">/mes</span>
              </h4>
              <p className="text-xs mt-1 opacity-80">Cancelación en cualquier momento</p>
            </div>
            
            <div className="text-center">
              <button 
                onClick={handleUpgradeClick} 
                disabled={isProcessing} // Deshabilitar si está procesando
                className="bg-amber-400 text-indigo-900 px-8 py-3 rounded-lg font-bold text-lg hover:bg-amber-300 transition-colors shadow-lg shadow-amber-200 disabled:opacity-70 disabled:cursor-wait"
              >
                {isProcessing ? (
                    'Procesando...' // Muestra estado de carga
                ) : (
                    <>
                      <Crown size={20} className="inline-block mr-2" />
                      Desbloquear Plan PRO
                    </>
                )}
              </button>
              <p className="text-xs text-gray-400 mt-2">
                Estás intentando acceder a "{featureName}"
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100">
                <h4 className="text-md font-semibold text-gray-700 mb-3">Tu Plan Free Incluye:</h4>
                <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-gray-500">
                        <Check size={16} className="text-green-500" />
                        Métricas de Densidad, Ritmo y Puntuación.
                    </li>
                    {FREE_LIMITATIONS.map((item, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-500">
                            {item.icon}
                            {item.title}
                        </li>
                    ))}
                </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaywallModal;