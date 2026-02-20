import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, expect } from "vitest";
import Resume from "../routes/Resume";
import resumeData from "../data/resume.json";

const renderWithRoutes = () => {
  return render(
    <MemoryRouter initialEntries={["/resume"]}>
      <Routes>
        <Route path="/resume" element={<Resume />} />
        <Route path="/explorer" element={<div>Explorer View</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe("Resume", () => {
  it("renders the header metadata and links", () => {
    renderWithRoutes();

    expect(
      screen.getByRole("heading", { name: resumeData.meta.name })
    ).toBeInTheDocument();

    const emailLink = screen.getByRole("link", { name: /email/i });
    const githubLink = screen.getByRole("link", { name: /github/i });
    const linkedinLink = screen.getByRole("link", { name: /linkedin/i });

    expect(emailLink).toHaveAttribute(
      "href",
      `mailto:${resumeData.meta.links.email}`
    );
    expect(githubLink).toHaveAttribute("href", resumeData.meta.links.github);
    expect(linkedinLink).toHaveAttribute(
      "href",
      resumeData.meta.links.linkedin
    );
  });

  it("renders top projects and section headings", () => {
    renderWithRoutes();

    expect(
      screen.getByRole("heading", { name: /projects/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /experience/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /education/i })
    ).toBeInTheDocument();

    const sortedProjects = [...resumeData.projects]
      .sort((a, b) => {
        const aId = Number.parseInt(String(a.id).match(/\d+/)?.[0] ?? 0, 10);
        const bId = Number.parseInt(String(b.id).match(/\d+/)?.[0] ?? 0, 10);
        return bId - aId;
      })
      .slice(0, 3);

    sortedProjects.forEach((project) => {
      const heading = screen.getByRole("heading", {
        name: new RegExp(`${project.title} - ${project.subtitle}`, "i"),
      });
      expect(heading).toBeInTheDocument();

      const liveUrl = project.links?.live;
      const codeUrl = project.links?.code;
      const projectUrl = liveUrl || codeUrl;
      if (!projectUrl) return;

      const label = liveUrl ? "LIVE" : "CODE";
      expect(within(heading).getByRole("link", { name: label })).toBeInTheDocument();
    });
  });

  it("navigates back to explorer", async () => {
    const user = userEvent.setup();
    renderWithRoutes();

    await user.click(
      screen.getByRole("button", { name: /return to explorer/i })
    );

    expect(screen.getByText("Explorer View")).toBeInTheDocument();
  });
});
