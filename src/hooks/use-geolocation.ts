// custom hook can do all like react

import { useEffect, useState } from "react";
import type { Coordinates } from '@/api/types';

interface GeolocationStates {
    coordinates:Coordinates | null;
    error: string | null;
    isLoading: boolean
}

export function useGeolocation(){
    const [locationData,setLocationData]=useState<GeolocationStates>({
        coordinates:null,
        error:null,
        isLoading:true
    });

    const getLocation = () => {
        setLocationData((prev) => ({ ...prev, isLoading: true, error: null }));

        if (!navigator.geolocation) {
            setLocationData({
                coordinates: null,
                error: "Geolocation is not supported by your browser",
                isLoading: false
            });
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocationData({
                    coordinates: {
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                    },
                    error: null,
                    isLoading: false,
                });
            },
            (error) => {
                // Enhanced error logging for debugging
                console.error("Geolocation error (raw):", error);
                // Log browser, protocol, and location info
                console.log("User Agent:", navigator.userAgent);
                console.log("Page Protocol:", window.location.protocol);
                console.log("Page Host:", window.location.host);
                let errorMessage: string;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location permission denied. Please enable location access.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out.';
                        break;
                    default:
                        errorMessage = 'An unknown error occurred.';
                        break;
                }
                setLocationData({
                    coordinates: null,
                    error: errorMessage,
                    isLoading: false,
                });
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 60000
            }
        );
    };
    // when the app is loaded get the location
    useEffect(()=>{
        getLocation()
    },[]);

    return {
        ...locationData, //to manually refresh just spread it
        getLocation
    }
}