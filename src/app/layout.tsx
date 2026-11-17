import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "FolioCraft",
	description: "Create, publish and export a professional online portfolio and resume.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="pt-BR">
			<body>{children}</body>
		</html>
	);
}
