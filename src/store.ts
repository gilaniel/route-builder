import { create } from "zustand";

export type CreateRoute = {
  from: string;
  to: string;
  date: Date | string;
  carNumber: string;
  routeNumber: string;
};

export type RouteInfo = {
  distance: string;
  duration: string;
  date: Date | string;
  carNumber: string;
  routeNumber: string;
};

interface RouteState {
  from: string;
  to: string;
  distance: string;
  duration: string;
  date: Date | string;
  carNumber: string;
  routeNumber: string;
  setFrom: (from: string) => void;
  setTo: (to: string) => void;
  setRouteInfo: (distance: string, duration: string) => void;
  createRoute: (params: CreateRoute) => void;
  initParams: (params: Partial<CreateRoute>) => void;
}

export const useRouteStore = create<RouteState>((set, get) => ({
  from: "",
  to: "",
  distance: "",
  duration: "",
  date: new Date().toISOString().slice(0, 10),
  carNumber: "",
  routeNumber: "",
  setFrom: (from) => set({ from }),
  setTo: (to) => set({ to }),
  setRouteInfo: (distance, duration) => {
    set({ distance, duration });

    if (distance && duration) {
      localStorage.setItem(
        "route",
        JSON.stringify({
          distance,
          duration,
          from: get().from,
          to: get().to,
          date: get().date,
          carNumber: get().carNumber,
          routeNumber: get().routeNumber,
        }),
      );
    }
  },

  createRoute: (params) => {
    const { date, carNumber, routeNumber, from, to } = params;
    set({ date, carNumber, routeNumber, from, to });
    localStorage.setItem("route", JSON.stringify(params));
  },

  initParams: (params) => {
    set({
      from: params.from || "",
      to: params.to || "",
      date: params.date || new Date().toISOString().slice(0, 10),
      carNumber: params.carNumber || "",
      routeNumber: params.routeNumber || "",
    });
  },
}));
