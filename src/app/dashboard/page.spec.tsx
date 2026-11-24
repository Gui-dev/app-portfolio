import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth-session", () => ({
	getSessionUser: vi.fn(async () => ({
		id: "user-1",
		email: "lucas@example.com",
		name: "Lucas Almeida",
		emailVerified: true,
	})),
}));

vi.mock("./actions", () => ({
	ensureProfileForUser: vi.fn(async () => ({
		id: "profile-1",
		userId: "user-1",
		slug: "lucas-almeida",
		fullName: "Lucas Almeida",
		headline: "Engenheiro de Software",
		bio: "",
		location: "",
		contactEmail: "lucas@example.com",
		githubUrl: "",
		linkedinUrl: "",
		monogramStyle: "gradient",
		template: "modern",
		colorMode: "dark",
		isPublished: false,
		publishedAt: null,
		createdAt: new Date(),
		updatedAt: new Date(),
		experiences: [],
		projects: [],
		skills: [],
	})),
}));

import DashboardPage from "./page";

describe("Dashboard page", () => {
	it("should render the editor header", async () => {
		render(await DashboardPage());

		expect(screen.getByText("FolioCraft")).toBeInTheDocument();
	});

	it("should render the preview panel", async () => {
		render(await DashboardPage());

		expect(screen.getByRole("complementary", { name: "Prévia do portfólio" })).toBeInTheDocument();
		expect(screen.getByText("Prévia ao vivo")).toBeInTheDocument();
	});
});
