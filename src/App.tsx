import { CreateRoute, useRouteStore } from "./store";
import MapRoute from "./components/MapRoute";
import { MapPin, Search, Car, RouteIcon } from "lucide-react";
import { YMaps } from "@pbe/react-yandex-maps";
import AddressInput from "./components/AddressInput";
import { Controller, useForm } from "react-hook-form";
import { Route, Routes, useNavigate } from "react-router-dom";
import { ToastProvider } from "./contexts/ToastContext";

function Create() {
  const { createRoute } = useRouteStore();

  const navigate = useNavigate();

  const defaultValues = {
    from: "",
    to: "",
    date: new Date().toISOString().slice(0, 10),
    carNumber: "",
    routeNumber: "",
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateRoute>({
    defaultValues,
  });

  const onSubmit = (data: CreateRoute) => {
    createRoute(data);
    reset();

    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      if (value) params.append(key, encodeURIComponent(String(value)));
    });

    navigate(`/route?${params.toString()}`);
  };

  return (
    <div className="px-5">
      <div className="max-w-125 w-full m-auto bg-white shadow-xl z-10 flex flex-col my-5">
        <div className="p-6 grow flex flex-col gap-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Откуда
              </label>
              <Controller
                name="from"
                control={control}
                render={({ field }) => (
                  <AddressInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Москва, Красная площадь"
                    icon={MapPin}
                    iconColorClass="text-gray-400"
                  />
                )}
                rules={{ required: true }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Куда
              </label>
              <Controller
                name="to"
                control={control}
                render={({ field }) => (
                  <AddressInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Санкт-Петербург, Эрмитаж"
                    icon={MapPin}
                    iconColorClass="text-red-500"
                  />
                )}
                rules={{ required: true }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Дата рейса
              </label>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <input
                    type="date"
                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.date ? "border-red-500" : "border-gray-300"
                    }`}
                    value={field.value as string}
                    onChange={field.onChange}
                  />
                )}
                rules={{ required: true }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Автомобиль
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Car className={`h-5 w-5`} />
                </div>
                <Controller
                  name="carNumber"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      {...field}
                      className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.carNumber ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="A777AA997"
                    />
                  )}
                  rules={{ required: true }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Рейс
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <RouteIcon className={`h-5 w-5`} />
                </div>
                <Controller
                  name="routeNumber"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      {...field}
                      className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.routeNumber
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="AB0123456"
                    />
                  )}
                  rules={{ required: true }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Search className="w-4 h-4" />
              Построить маршрут
            </button>
          </form>

          {/* Results */}
        </div>
      </div>
    </div>
  );
}

export const App = () => {
  const apikey = import.meta.env.VITE_YANDEX_MAPS_API_KEY || "";
  const suggest_apikey = import.meta.env.VITE_YANDEX_MAPS_SUGGEST_API_KEY || "";

  return (
    <ToastProvider>
      <YMaps query={{ apikey, lang: "ru_RU", suggest_apikey }}>
        <div className="flex flex-col h-screen bg-gray-100 text-gray-900 font-sans">
          <Routes>
            <Route path="/" element={<Create />} />
            <Route path="/route" element={<MapRoute />} />
          </Routes>
        </div>
      </YMaps>
    </ToastProvider>
  );
};
