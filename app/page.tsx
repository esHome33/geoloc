"use client";

import { Checkbox, FormControlLabel, Typography } from "@mui/material";
import axios from "axios";
import { ChangeEvent, useEffect, useState } from "react";
import useSWR from "swr";

type Retour = {
	type: string;
	version: string;
	features: {
		type: string;
		geometry: { type: string; coordinates: number[] }[];
		properties: {
			label: string;
			score: number;
			name: string;
			postcode: string;
			citycode: string;
			x: number;
			y: number;
			city: string;
			context: string;
			type: string;
			importance: number;
			street: string;
			distance: number;
		};
	}[];
	attribution: string;
	licence: string;
	filters: { type: string };
	center: number[];
	limit: number;
};

const fetcher: (
	_url: string,
	latitude: any,
	longitude: any,
	calcul: boolean
) => Promise<Retour | undefined> = async (
	_url: string,
	latitude: any,
	longitude: any,
	calcul: boolean
) => {
	console.log("début de fetcher");
	if (!latitude && !longitude) {
		console.log("no lat and lon in params");
		return undefined;
	}

	console.log("calcul", calcul);
	if (!calcul) {
		console.log("use adresses is at false");
		return undefined;
	}

	if (typeof latitude === "number" && typeof longitude === "number") {
		console.log("axios fetch to retrieve adress");
		const rep = await axios.get<Retour>(
			"https://api-adresse.data.gouv.fr/reverse/",
			{
				params: {
					lat: latitude,
					lon: longitude,
					type: "street",
				},
			}
		);

		if (rep.data) {
			const d = rep.data;
			console.log("axios response OK with data : " + JSON.stringify(d));
			return d;
		} else {
			return undefined;
		}
	} else {
		console.log("lat and lon are not numbers");
		return undefined;
	}
};

export default function Home() {
	const ND = "non déterminé";
	const [lat, setLat] = useState<number | "non déterminé">(ND);
	const [lon, setLon] = useState<number | "non déterminé">(ND);
	const [alt, setAlt] = useState<string>("non déterminé");
	const [accuracy, setAccuracy] = useState<string>(ND);
	const [speed, setSpeed] = useState<string>(ND);
	const [speedKMH, setSpeedKMH] = useState<string>(ND);
	const [erreur, setErreur] = useState<string>("");

	const [adresses, setAdresses] = useState<boolean>(true);

	const { data, isLoading } = useSWR(
		"https://api-adresse.data.gouv.fr/reverse/",
		(url) => fetcher(url, lat, lon, adresses)
	);

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
					setSpeed(vitesse.toFixed(1) + " m/s");
					const vkmh = vitesse * 3.6;
					setSpeedKMH(vkmh.toFixed(0) + " km/h");
				} else {
					setSpeed(ND);
					setSpeedKMH("");
				}
				const altit = pos.coords.altitude;
				if (altit) {
					setAlt(altit.toFixed(0) + " m");
				} else {
					setAlt(ND);
				}
				setErreur("");
			};

			const onErr = () => {
				setErreur("une erreur de géolocalisation est survenue");
			};

			console.log("watch position launched !");
			const id_watch = geoloc.watchPosition(onSuccess, onErr, {
				maximumAge: 300,
			});

			return () => {
				console.log("No more watching position....");
				geoloc.clearWatch(id_watch);
			};
		}
	}, []);

	if (isLoading) {
		return (
			<main className="flex min-h-screen flex-col items-center justify-between p-2">
				<div className="flex flex-col space-y-2 mb-20">
					<Typography className="text-orange-600">
						Les données sont en cours de chargement
					</Typography>
				</div>
			</main>
		);
	}

	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-2">
			<div className="flex flex-col space-y-2 mb-20">
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

				<FormControlLabel
					control={
						<Checkbox
							checked={adresses}
							className="bg-green-800  hover:bg-green-500 mr-3"
							value={adresses}
							onChange={(e: ChangeEvent<HTMLInputElement>) => {
								e.preventDefault();
								const val = e.target.value;
								if (val === "false") {
									setAdresses(true);
								} else {
									setAdresses(false);
								}
							}}
						/>
					}
					label="Adresse"
				/>
				<Typography>Latitude = {lat}</Typography>
				<Typography>Longitude = {lon}</Typography>
				<Typography className="text-blue-600">Altitude = {alt}</Typography>
				<Typography>précision = {accuracy}</Typography>
				<Typography className="text-green-500">
					Vitesse = {speed}
					{speedKMH === "" || speedKMH === ND ? null : " = " + speedKMH}
				</Typography>
				<Typography className="mt-4">{erreur}</Typography>
				<Typography>
					Adresse : {data?.features[0].properties.street}
				</Typography>
			</div>
			<div className="text-center">
				<Typography variant="body2">ESHome 33 - juillet 2023</Typography>
			</div>
		</main>
	);
}
