import { Calendar, Car, Clock, Route } from "lucide-react";
import { useRouteStore } from "../store";

export const Results = () => {
  const { distance, duration, date, carNumber, routeNumber } = useRouteStore();

  return (
    <div className="mt-4 border-t border-gray-100 pt-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Информация о рейсе <span className="font-bold">{routeNumber}</span>
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-lg">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Дата
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {String(date) || "—"}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-lg">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Car className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Автомобиль
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {carNumber || "—"}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-lg">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Route className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Пробег
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {distance || "—"}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-lg">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Время в пути
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {duration || "—"}
          </div>
        </div>
      </div>
    </div>
  );
};
