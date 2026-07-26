import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Trip, TripFormData, RentalAnalysis, HotelAnalysis, PickAnalysis } from "@/types";
import { generateId } from "@/lib/utils";

interface TripState {
  trips: Trip[];
  currentTripId: string | null;

  // Actions
  createTrip: (formData: TripFormData) => string;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  getTrip: (id: string) => Trip | undefined;
  setCurrentTrip: (id: string | null) => void;
  setRentals: (id: string, rentals: RentalAnalysis) => void;
  setHotels: (id: string, hotels: HotelAnalysis) => void;
  setThePick: (id: string, pick: PickAnalysis) => void;
  setTripStatus: (id: string, status: Trip["status"], error?: string) => void;
  clearAllTrips: () => void;
}

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      trips: [],
      currentTripId: null,

      createTrip: (formData: TripFormData) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newTrip: Trip = {
          id,
          createdAt: now,
          updatedAt: now,
          formData,
          status: "pending",
        };
        set((state) => ({
          trips: [newTrip, ...state.trips],
          currentTripId: id,
        }));
        return id;
      },

      updateTrip: (id, updates) => {
        set((state) => ({
          trips: state.trips.map((trip) =>
            trip.id === id
              ? { ...trip, ...updates, updatedAt: new Date().toISOString() }
              : trip
          ),
        }));
      },

      deleteTrip: (id) => {
        set((state) => ({
          trips: state.trips.filter((trip) => trip.id !== id),
          currentTripId:
            state.currentTripId === id ? null : state.currentTripId,
        }));
      },

      getTrip: (id) => {
        return get().trips.find((trip) => trip.id === id);
      },

      setCurrentTrip: (id) => {
        set({ currentTripId: id });
      },

      setRentals: (id, rentals) => {
        get().updateTrip(id, { rentals });
      },

      setHotels: (id, hotels) => {
        get().updateTrip(id, { hotels });
      },

      setThePick: (id, pick) => {
        get().updateTrip(id, { thePick: pick });
      },

      setTripStatus: (id, status, error) => {
        get().updateTrip(id, { status, error });
      },

      clearAllTrips: () => {
        set({ trips: [], currentTripId: null });
      },
    }),
    {
      name: "beatbooker-trips",
    }
  )
);
