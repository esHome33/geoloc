"use client";

import Loading from "@/components/loading";
import {
	Button,
	Checkbox,
	FormControlLabel,
	Popover,
	Typography,
} from "@mui/material";
import axios from "axios";
import { ChangeEvent, useEffect, useState } from "react";

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
	//console.log("début de fetcher");
	if (!latitude && !longitude) {
		console.log("no lat and lon in params");
		return undefined;
	}

	if (!calcul) {
		console.log("user requested not to calcul");
		return undefined;
	}
	//console.log("calcul", calcul);

	if (typeof latitude === "number" && typeof longitude === "number") {
		//console.log("axios fetch to retrieve adress");
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
			//console.log("axios response OK with data : " + JSON.stringify(d));
			return d;
		} else {
			console.log("no data returned by axios get");
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
	const [dateDatas, setDateDatas] = useState<Date>();

	const [adresses, setAdresses] = useState<boolean>(true);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>();
	const [textPopover, setTextPopover] = useState<string>("");
	const [open, setOpen] = useState<boolean>(false);
	const [btnText, setBtnText] = useState<string>("Adresse");
	/*const { data, isLoading } = useSWR(
		"https://api-adresse.data.gouv.fr/reverse/",
		(url) => fetcher(url, lat, lon, adresses)
	);*/

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

	const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
		const ret = await fetcher(
			"https://api-adresse.data.gouv.fr/reverse/",
			lat,
			lon,
			true
		);
		if (ret) {
			setTextPopover(ret?.features[0].properties.label);
			setOpen(true);
			setBtnText("Fermer");
		} else {
			setOpen(false);
			setTextPopover("Pas de réponse pour l'adresse");
			setBtnText("Adresse");
		}
	};

	const handleClose = () => {
		setOpen(false);
		setBtnText("Adresse");
	};

	const id = open ? "simple-popover" : undefined;

	useEffect(() => {
		if (getGeolocService()) {
			const geoloc = navigator.geolocation;

			const onSuccess = (pos: GeolocationPosition) => {
				const maintenant = new Date();
				setDateDatas(maintenant);
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
					setSpeed(ND + "e");
					setSpeedKMH("");
				}
				const altit = pos.coords.altitude;
				if (altit) {
					setAlt(altit.toFixed(0) + " m");
				} else {
					setAlt(ND + "e");
				}
				setErreur("");
				setIsLoading(false);
			};

			const onErr = () => {
				setErreur("une erreur de géolocalisation est survenue");
			};

			//console.log("watch position launched !");

			const timer = setInterval(() => {
				if (adresses) {
					geoloc.getCurrentPosition(onSuccess, onErr, {
						maximumAge: 0,
					});
				}
			}, 1500);

			return () => {
				//console.log("No more watching position....");
				//geoloc.clearWatch(id_watch);
				clearInterval(timer);
			};
		}
	}, [, adresses]);

	return isLoading ? (
		<Loading />
	) : (
		<>
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
						label="cherche coordonnées"
					/>
					<Typography>Latitude = {lat}</Typography>
					<Typography>Longitude = {lon}</Typography>
					<Typography className="text-blue-600">
						Altitude = {alt}
					</Typography>
					<Typography>précision = {accuracy}</Typography>
					<Typography className="text-green-500">
						Vitesse = {speed}
						{speedKMH === "" || speedKMH === ND ? null : " = " + speedKMH}
					</Typography>
					<Typography
						className="mt-4 text-red-700 font-bold"
						variant="h6"
					>
						{erreur}
					</Typography>
					<Button
						className="bg-slate-300  hover:bg-slate-100 text-orange-600 font-extrabold"
						onClick={handleClick}
					>
						{btnText}
					</Button>
					<Popover
						id={id}
						open={open}
						anchorEl={anchorEl}
						onClose={handleClose}
						anchorOrigin={{
							vertical: "bottom",
							horizontal: "left",
						}}
					>
						<Typography sx={{ p: 2 }}>{textPopover}</Typography>
					</Popover>
					<Typography variant="body2">
						âge des données : {dateDatas?.toLocaleTimeString()}
					</Typography>
				</div>
				<div className="text-center">
					<Typography variant="body2">ESHome 33 - juillet 2023</Typography>
				</div>
			</main>
		</>
	);
}
