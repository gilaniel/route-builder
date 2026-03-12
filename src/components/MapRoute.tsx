import { Map } from "@pbe/react-yandex-maps";
import { useRef, useEffect, useCallback, useState } from "react";
import { useRouteStore } from "../store";
import { Results } from "./Results";
import { useReactToPrint } from "react-to-print";
import { ArrowLeft, Download, Loader } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

export default function MapRoute() {
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [ymapsInstance, setYmapsInstance] = useState<any>(null);

  const [searchParams] = useSearchParams();

  const [isLoading, setLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const routeRef = useRef<any>(null);
  const { from, to, routeNumber, setRouteInfo, initParams } = useRouteStore();

  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `Рейс ${routeNumber}`,
    onBeforePrint: async () => {
      // 1. Делаем контейнер широким (под формат А4)
      setIsPrinting(true);

      // 2. Ждем 100мс, чтобы React успел применить CSS классы ширины к DOM-дереву
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 3. Заставляем карту понять, что её контейнер стал широким
      if (mapInstance) {
        mapInstance.container.fitToViewport();
      }

      await new Promise((resolve) => setTimeout(resolve, 300));
    },
    onAfterPrint: async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));

      setIsPrinting(false);

      setLoading(false);

      setTimeout(() => {
        if (mapInstance) {
          mapInstance.container.fitToViewport();
        }
      }, 1300);
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

  useEffect(() => {
    const params = {
      from: decodeURIComponent(searchParams.get("from")) || "",
      to: decodeURIComponent(searchParams.get("to")) || "",
      start: decodeURIComponent(searchParams.get("start")) || "",
      end: decodeURIComponent(searchParams.get("end")) || "",
      date: searchParams.get("date") || new Date().toISOString().slice(0, 10),
      carNumber: decodeURIComponent(searchParams.get("carNumber")) || "",
      routeNumber: decodeURIComponent(searchParams.get("routeNumber")) || "",
    };

    initParams(params);
  }, [searchParams, initParams]);

  return (
    <div className="bg-gray-100 pt-5 max-w-[1200px] w-full mx-auto flex flex-col items-start pb-10 print:bg-white print:pt-0">
      <div className="px-5 print:hidden">
        <Link to="/">
          <button className="flex gap-2 items-center border-0 bg-gray-400 rounded-md px-3 py-2 text-white hover:bg-gray-600 active:bg-gray-800 transition-colors">
            {<ArrowLeft />}Назад
          </button>
        </Link>
      </div>
      <div
        className={`grow px-5 bg-gray-100 transition-all print:bg-white print:px-0 ${isPrinting ? "w-[800px] min-w-[800px] m-auto" : "w-full"}`}
        ref={contentRef}
      >
        <div className="py-5">
          <div className="m-auto h-[500px]">
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

          <div className="m-auto ">
            <Results />
          </div>
        </div>
      </div>
      <button
        onClick={() => {
          setLoading(true);
          handlePrint();
        }}
        className="ml-5 flex gap-2 items-center border-0 bg-gray-400 rounded-md px-3 py-2 text-white hover:bg-gray-600 active:bg-gray-800 transition-colors print:hidden"
      >
        {isLoading ? <Loader className="animate-spin" /> : <Download />}PDF
      </button>
    </div>
  );
}
