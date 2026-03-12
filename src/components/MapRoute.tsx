import { Map } from "@pbe/react-yandex-maps";
import { useRef, useEffect, useCallback, useState } from "react";
import { useRouteStore } from "../store";
import { Results } from "./Results";
import { useReactToPrint } from "react-to-print";
import { ArrowLeft, Download, Loader } from "lucide-react";
import { resolve } from "path";
import { useToast } from "../contexts/ToastContext";
import { Link } from "react-router-dom";

export default function MapRoute() {
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [ymapsInstance, setYmapsInstance] = useState<any>(null);

  const [isLoading, setLoading] = useState(false);

  const { showToast } = useToast();

  const routeRef = useRef<any>(null);
  const { from, to, routeNumber, setRouteInfo } = useRouteStore();

  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `Рейс ${routeNumber}`,
    onAfterPrint: () => {
      setLoading(false);
      showToast("Скачивание завершено", "success");
    },
  });

  const buildRoute = useCallback(() => {
    if (!ymapsInstance || !mapInstance) {
      return;
    }

    if (routeRef.current) {
      mapInstance.geoObjects.remove(routeRef.current);
      routeRef.current = null;
    }

    if (!from || !to) {
      setRouteInfo("", "");
      return;
    }

    try {
      const multiRoute = new ymapsInstance.multiRouter.MultiRoute(
        {
          referencePoints: [from, to],
          params: { routingMode: "auto", results: 1 },
        },
        {
          boundsAutoApply: true,
          wayPointStartIconColor: "#3b82f6",
          wayPointStartIconFillColor: "#3b82f6",
          wayPointEndIconColor: "#ef4444",
          wayPointEndIconFillColor: "#ef4444",
          routeStrokeWidth: 4,
          routeStrokeColor: "#3b82f6",
        },
      );

      multiRoute.model.events.add("requestsuccess", () => {
        const activeRoute = multiRoute.getActiveRoute();
        if (activeRoute) {
          setRouteInfo(
            activeRoute.properties.get("distance").text,
            activeRoute.properties.get("duration").text,
          );
        } else {
          setRouteInfo("Маршрут не найден", "");
        }
      });

      multiRoute.model.events.add("requestfail", (event: any) => {
        console.error("Ошибка маршрута:", event.get("error").message);
        setRouteInfo("Ошибка построения маршрута", "");
      });

      mapInstance.geoObjects.add(multiRoute);
      routeRef.current = multiRoute;
    } catch (error) {
      console.error("Ошибка создания маршрута:", error);
    }
  }, [from, to, setRouteInfo, ymapsInstance, mapInstance]);

  useEffect(() => {
    buildRoute();
  }, [buildRoute]);

  return (
    <div className="bg-gray-100 pt-5 w-[1200px] mx-auto px-5">
      <div className="px-5">
        <Link to="/">
          <button className="flex gap-2 items-center border-0 bg-gray-400 rounded-md px-3 py-2 text-white hover:bg-gray-600 active:bg-gray-800 transition-colors">
            {<ArrowLeft />}Назад
          </button>
        </Link>
      </div>
      <div className="flex-grow " ref={contentRef}>
        <div className="py-5">
          <div className="px-5 m-auto h-[600px]">
            <div className="rounded-2xl overflow-hidden shadow-inner border border-gray-200 bg-white w-full h-full">
              <Map
                defaultState={{
                  center: [55.751574, 37.573856],
                  zoom: 9,
                  behaviors: ["disable"],
                }}
                instanceRef={(ref) => setMapInstance(ref)}
                onLoad={(ymaps) => setYmapsInstance(ymaps)}
                modules={["multiRouter.MultiRoute"]}
                width="100%"
                height="100%"
                className="w-full h-full"
              />
            </div>
          </div>

          <div className="m-auto px-5">
            <Results />
          </div>
        </div>
        <div className="m-auto px-5">
          <button
            onClick={() => {
              setLoading(true);
              handlePrint();
            }}
            className="flex gap-2 items-center border-0 bg-gray-400 rounded-md px-3 py-2 text-white hover:bg-gray-600 active:bg-gray-800 transition-colors"
          >
            {isLoading ? <Loader className="animate-spin" /> : <Download />}PDF
          </button>
        </div>
      </div>
    </div>
  );
}
