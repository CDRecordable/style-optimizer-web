import React from 'react';
import { Maximize2, ArrowUp, ArrowDown, Minus } from 'lucide-react';

// Tarjeta contenedora genérica
export function DashboardCard({ title, icon, children, onViewDetail }) {
    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col h-fit transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 text-gray-700">
                    <div className="p-2 bg-gray-50 rounded-lg text-indigo-600">
                        {icon}
                    </div>
                    <h3 className="font-bold text-gray-800">{title}</h3>
                </div>
                {onViewDetail && (
                    <button 
                        onClick={onViewDetail} 
                        className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-full transition-colors"
                        title="Ver detalles"
                    >
                        <Maximize2 size={18} />
                    </button>
                )}
            </div>
            {/* Quitamos 'flex-grow' para evitar espacios vacíos gigantes */}
            <div className="mb-2">{children}</div>
            
            {onViewDetail && (
                <div className="mt-4 pt-3 border-t border-gray-50">
                    <button 
                        onClick={onViewDetail} 
                        className="w-full text-center text-xs font-bold uppercase tracking-wide text-indigo-600 hover:text-indigo-800 transition-colors flex items-center justify-center gap-1"
                    >
                        Ver detalles <span>&rarr;</span>
                    </button>
                </div>
            )}
        </div>
    );
}

export function MetricCard({ icon, label, value, color, subtext, onClick }) {
    const colorClasses = { 
        blue: "bg-blue-100 text-blue-700", 
        indigo: "bg-indigo-100 text-indigo-700", 
        red: "bg-red-100 text-red-700", 
        green: "bg-green-100 text-green-700", 
        orange: "bg-orange-100 text-orange-700", 
        teal: "bg-teal-100 text-teal-700", 
        gray: "bg-gray-100 text-gray-700",
        pink: "bg-pink-100 text-pink-700" 
    };
    
    return (
        <div 
            onClick={onClick}
            className={`relative bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-start space-x-4 ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group' : ''}`}
        >
            <div className={`p-3 rounded-lg flex-shrink-0 ${colorClasses[color] || colorClasses.blue}`}>
                {React.cloneElement(icon, { size: 24 })}
            </div>
            <div className="flex-grow min-w-0">
                <p className="text-gray-500 text-sm font-medium truncate">{label}</p>
                <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
                {subtext && <p className="text-xs text-gray-400 mt-1 truncate">{subtext}</p>}
            </div>
            {onClick && (
                <div className="absolute top-4 right-4 text-gray-300 group-hover:text-indigo-500 transition-colors">
                    <Maximize2 size={16} />
                </div>
            )}
        </div>
    );
}

export function Badge({ color, text, count }) {
    const colors = { 
        purple: "bg-purple-50 text-purple-700 border-purple-100 ring-purple-500/10", 
        orange: "bg-orange-50 text-orange-700 border-orange-100 ring-orange-500/10", 
        blue: "bg-blue-50 text-blue-700 border-blue-100 ring-blue-500/10", 
        red: "bg-red-50 text-red-700 border-red-100 ring-red-500/10", 
        gray: "bg-gray-50 text-gray-700 border-gray-100 ring-gray-500/10",
        teal: "bg-teal-50 text-teal-700 border-teal-100 ring-teal-500/10"
    };
    
    const defaultColor = "bg-gray-50 text-gray-700 border-gray-100";

    return (
        <span className={`px-2.5 py-1 rounded-md text-xs border ring-1 ring-inset ${colors[color] || defaultColor} flex items-center gap-1.5 font-medium`}>
            {text} 
            {count !== undefined && (
                <span className="bg-white/50 px-1.5 rounded text-[10px] font-bold min-w-[1.2rem] text-center">
                    {count}
                </span>
            )}
        </span>
    );
}

export function ComparisonCard({ title, label, valOld, valNew, inverse = false, suffix = "" }) {
    const diff = valNew - valOld;
    const percentChange = valOld !== 0 ? ((diff / valOld) * 100).toFixed(0) : 0;
    const isZero = valOld === 0 && valNew === 0;
    
    let Icon = Minus;
    let badgeColor = "bg-gray-100 text-gray-500";
  
    if (!isZero && diff !== 0) {
      if (diff > 0) {
        const isGood = !inverse;
        badgeColor = isGood ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700";
        Icon = ArrowUp;
      } else {
        const isGood = inverse;
        badgeColor = isGood ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700";
        Icon = ArrowDown;
      }
    }

    if (title.includes("Longitud") && diff !== 0) {
        badgeColor = "bg-blue-100 text-blue-700";
    }
  
    return (
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-full">
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</h4>
          <div className="flex items-end justify-between mt-3">
             <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-mono mb-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span> ANTES: {valOld}{suffix}
                </span>
                <span className="text-3xl font-bold text-gray-900 tracking-tight">{valNew}{suffix}</span>
             </div>
             
             {!isZero && diff !== 0 && (
               <div className={`flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${badgeColor}`}>
                 <Icon size={14} className="mr-1" />
                 {Math.abs(percentChange)}%
               </div>
             )}
             
             {(diff === 0 || isZero) && (
               <div className="flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-400">
                 <Minus size={14} /> 0%
               </div>
             )}
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-4 border-t pt-3 border-gray-50 flex items-center gap-1">
            {label}
        </p>
      </div>
    );
}

// --- TOOLTIP PERSONALIZADO (AÑADIDO) ---
export const CustomBarTooltip = ({ active, payload, label, unit, labelPrefix = "Frase" }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 text-white text-xs p-2 rounded shadow-xl border border-slate-700 z-50">
          <p className="font-bold text-slate-300 mb-1">{labelPrefix} {label}</p>
          <p className="text-sm">
            <span className="font-bold text-white">{data.realValue || data.value || data.count || data.len}</span> {unit}
          </p>
          {data.alert && <p className="text-xs text-yellow-300 mt-1 font-bold uppercase">{data.alert}</p>}
        </div>
      );
    }
    return null;
};