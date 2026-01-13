import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Activity, Flame, Dumbbell } from 'lucide-react';
import { getSummaryHistory } from '../services/summaryService';

const DAYS_OF_WEEK = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function Calendar({ data }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [internalSummaries, setInternalSummaries] = useState([]);
  const [loading, setLoading] = useState(!data);

  const summaries = data || internalSummaries;

  // Fetch summaries on mount if data is not provided
  useEffect(() => {
    if (data) {
        setLoading(false);
        return;
    }
    const fetchSummaries = async () => {
      try {
        const result = await getSummaryHistory();
        setInternalSummaries(result);
      } catch (error) {
        console.error("Failed to load calendar data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummaries();
  }, [data]);

  // Calendar Logic helpers
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isSameDay = (d1, d2) => {
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear();
  };

  const getSummaryForDate = (date) => {
    return summaries.find(s => {
        const summaryDate = new Date(s.date || s.createdAt);
        return isSameDay(summaryDate, date);
    });
  };

  // Generate calendar grid
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getFirstDayOfMonth(year, month);
  
  const days = [];
  // Padding for start of month
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  // Days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  // Selected Day Data
  const selectedSummary = getSummaryForDate(selectedDate);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Calendar Card - Gradient Background */}
      <div className="bg-gradient-to-br from-teal-400 to-blue-500 rounded-b-[30px] p-6 text-white shadow-xl z-10">
        
        {/* Month Navigation */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={handlePrevMonth} className="p-1 hover:bg-white/20 rounded-full transition">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold tracking-widest uppercase">
            {MONTH_NAMES[month]} {year}
          </h2>
          <button onClick={handleNextMonth} className="p-1 hover:bg-white/20 rounded-full transition">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 mb-4 text-center">
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="text-sm font-medium opacity-80">{day}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-y-2 text-center">
          {days.map((date, index) => {
            if (!date) return <div key={`empty-${index}`} />;
            
            const isSelected = isSameDay(date, selectedDate);
            const hasData = getSummaryForDate(date);
            
            return (
              <div key={index} className="flex flex-col items-center justify-center">
                <button
                  onClick={() => setSelectedDate(date)}
                  className={`w-8 h-8 flex items-center justify-center text-sm rounded-full transition-all duration-200 
                    ${isSelected 
                      ? 'bg-white text-teal-600 font-bold shadow-lg transform scale-110' 
                      : 'hover:bg-white/10'
                    }`}
                >
                  {date.getDate()}
                </button>
                {/* Dot indicator for data */}
                {hasData && !isSelected && (
                  <div className="w-1 h-1 bg-white/60 rounded-full mt-1"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Events / Details Section */}
      <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
        <h3 className="text-gray-400 text-sm font-semibold mb-4 uppercase tracking-wider">
            {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
        </h3>

        {loading ? (
           <div className="flex justify-center py-10 text-gray-400">Cargando historial...</div>
        ) : selectedSummary ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Card Summary */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-100 text-orange-500 rounded-xl">
                        <Flame className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase">Consumido</p>
                        <p className="text-xl font-bold text-gray-800">{selectedSummary.consumed} kcal</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-500 rounded-xl">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase">Restante</p>
                        <p className="text-xl font-bold text-gray-800">{selectedSummary.remaining} kcal</p>
                    </div>
                </div>
            </div>

             <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 text-purple-500 rounded-xl">
                        <Dumbbell className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase">Ejercicio</p>
                        <p className="text-xl font-bold text-gray-800">{selectedSummary.exercise} kcal</p>
                    </div>
                </div>
            </div>

            <div className={`p-4 rounded-xl text-center text-sm font-medium ${
                selectedSummary.status === 'Over Budget' ? 'bg-red-100 text-red-600' : 
                selectedSummary.status === 'Under Budget' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
            }`}>
                Estado: {selectedSummary.status === 'Over Budget' ? 'Presupuesto Excedido' : 
                         selectedSummary.status === 'Under Budget' ? 'Bajo Presupuesto' : selectedSummary.status}
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400 opacity-60">
            <Activity className="w-12 h-12 mb-2 stroke-1" />
            <p>No hay registros para este día</p>
          </div>
        )}
      </div>
    </div>
  );
}
