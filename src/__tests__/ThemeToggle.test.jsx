import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import Explorer from "../routes/Explorer";
import { XPProvider } from "../contexts/XPContext";

const renderExplorer = () => {
  return render(
    <XPProvider>
      <MemoryRouter>
        <Explorer />
      </MemoryRouter>
    </XPProvider>
  );
};

describe("Theme toggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.dataset.theme = "";
  });

  it("loads theme from localStorage and updates the label", () => {
    localStorage.setItem("theme", "cyber");
    renderExplorer();

    const modeButton = screen.getByRole("button", { name: /mode:/i });
    expect(modeButton).toHaveTextContent("Mode: 5/5");
    expect(document.documentElement.dataset.theme).toBe("cyber");
  });

  it("falls back to default for unknown themes", () => {
    localStorage.setItem("theme", "unknown");
    renderExplorer();

    const modeButton = screen.getByRole("button", { name: /mode:/i });
    expect(modeButton).toHaveTextContent("Mode: 1/5");
    expect(document.documentElement.dataset.theme).toBe("");
  });

  it("cycles themes and wraps back to default", async () => {
    const user = userEvent.setup();
    renderExplorer();

    const modeButton = screen.getByRole("button", { name: /mode:/i });
    expect(modeButton).toHaveTextContent("Mode: 1/5");

    for (let i = 0; i < 5; i += 1) {
      await user.click(modeButton);
    }

    expect(modeButton).toHaveTextContent("Mode: 1/5");
    expect(document.documentElement.dataset.theme).toBe("");
    expect(localStorage.getItem("theme")).toBe("default");
  });
});
