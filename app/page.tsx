"use client";

import { Typography } from "@mui/material";
import { useEffect, useState } from "react";

export default function Home() {
	const [lat, setLat] = useState<number | "non déterminé">("non déterminé");
	const [lon, setLon] = useState<number | "non déterminé">("non déterminé");
	const [alt, setAlt] = useState<string>("non déterminé");
	const [accuracy, setAccuracy] = useState<string>("non déterminé");
	const [speed, setSpeed] = useState<string>("non déterminé");
	const [speedKMH, setSpeedKMH] = useState<string>("non déterminé");
	const [erreur, setErreur] = useState<string>("");

	const [geoServices, setGeoServices] = useState(
		"Services de géolocalisation non disponibles"
	);

	const getGeolocService = () => {
		if ("geolocation" in navigator) {
			setGeoServices("Services de géolocalisation disponibles");
			return true;
		} else {
			setGeoServices("Services de géolocalisation non disponibles");
			return false;
		}
	};

	useEffect(() => {
		if (getGeolocService()) {
			const geoloc = navigator.geolocation;

			const onSuccess = (pos: GeolocationPosition) => {
				setLat(pos.coords.latitude);
				setLon(pos.coords.longitude);
				const acc = pos.coords.accuracy.toFixed() + " m";
				setAccuracy(acc);
				const vitesse = pos.coords.speed;
				if (vitesse) {
					setSpeed(vitesse + " m/s");
					const vkmh = vitesse * 3.6;
					setSpeedKMH(vkmh.toFixed(0) + " km/h");
				} else {
					setSpeed("non déterminé");
				}
				const altit = pos.coords.altitude;
				if (altit) {
					setAlt(altit.toFixed(0) + " m");
				} else {
					setAlt("non déterminé");
				}
				setErreur("");
			};

			const onErr = () => {
				setErreur("une erreur de géolocalisation est survenue");
			};

			geoloc.getCurrentPosition(onSuccess, onErr, {
				maximumAge: 50,
			});
		}
	}, []);

	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			<div className="flex flex-col space-y-10 mb-20">
				<Typography
					variant="h4"
					className="text-amber-600"
				>
					Géolocation
				</Typography>
				<Typography
					variant="body2"
					className="italic"
				>
					{geoServices}
				</Typography>
				<Typography>Latitude = {lat}</Typography>
				<Typography>Longitude = {lon}</Typography>
				<Typography className="text-blue-600">Altitude = {alt}</Typography>
				<Typography>précision = {accuracy}</Typography>
				<Typography className="text-green-500">
					Vitesse = {speed} m/s = {speedKMH} km/h
				</Typography>
				<Typography className="mt-4">{erreur}</Typography>
			</div>
			<div className="text-center">
				<Typography variant="body2">ESHome 33 - juillet 2023</Typography>
			</div>
		</main>
	);
}
