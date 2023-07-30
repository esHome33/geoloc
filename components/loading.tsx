import { Typography } from "@mui/material";

type Props = {};

const Loading = (_props: Props) => {
	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-2">
			<div className="flex flex-col space-y-2 mt-56 mb-20 text-center">
				<Typography
					className="text-orange-600 font-bold"
					variant="h5"
					fontStyle={"italic"}
				>
					Données en cours de chargement ...
				</Typography>
			</div>
		</main>
	);
};

export default Loading;

