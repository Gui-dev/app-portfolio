import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BeginnerHelper } from "./beginner-helper";

describe("BeginnerHelper", () => {
	it("should call onLoad when loading first-job examples", async () => {
		const user = userEvent.setup();
		const onLoad = vi.fn();
		render(<BeginnerHelper onLoad={onLoad} />);

		expect(screen.getByText("Procurando o primeiro emprego na área?")).toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: "✨ Carregar Perfil Primeiro Emprego" }));

		expect(onLoad).toHaveBeenCalledTimes(1);
	});
});
