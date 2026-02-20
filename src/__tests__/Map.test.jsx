import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import Map from "../components/Map";
import resumeData from "../data/resume.json";

const grantXp = vi.fn();
const hasClicked = vi.fn();

vi.mock("../hooks/useXP", () => ({
  useXP: () => ({ grantXp, hasClicked }),
}));

const mapNodes = [
  ...resumeData.mapNodes.education,
  ...resumeData.mapNodes.career,
  ...resumeData.mapNodes.skills,
];

const firstNode = mapNodes[0];
const firstLabel =
  firstNode.institution || firstNode.vocation || firstNode.achievement;

const mockRect = {
  width: 10,
  height: 10,
  top: 100,
  left: 0,
  right: 10,
  bottom: 110,
};

const originalGetBoundingClientRect =
  Element.prototype.getBoundingClientRect;

describe("Map", () => {
  beforeEach(() => {
    grantXp.mockClear();
    hasClicked.mockClear();
    hasClicked.mockReturnValue(false);
    Element.prototype.getBoundingClientRect = () => mockRect;
  });

  afterEach(() => {
    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });

  it("renders map nodes with dim state by default", () => {
    render(<Map />);

    const node = screen.getByRole("button", { name: firstLabel });
    expect(node).toHaveClass("map-node--dim");
  });

  it("shows tooltip and grants XP on hover", async () => {
    const user = userEvent.setup();
    render(<Map />);

    const node = screen.getByRole("button", { name: firstLabel });
    await user.hover(node);

    expect(screen.getByText(firstLabel)).toBeInTheDocument();
    expect(screen.getByText(firstNode.intel)).toBeInTheDocument();
    expect(grantXp).toHaveBeenCalledWith(`map-node-${firstNode.id}`, 27);
  });

  it("positions tooltip above or below based on node placement", async () => {
    const user = userEvent.setup();

    Element.prototype.getBoundingClientRect = function () {
      if (this.classList?.contains("map-canvas")) {
        return { ...mockRect, top: 0, height: 100 };
      }
      if (this.classList?.contains("map-node")) {
        return { ...mockRect, top: 80, height: 10 };
      }
      return mockRect;
    };

    render(<Map />);
    const node = screen.getByRole("button", { name: firstLabel });
    await user.hover(node);

    const tooltip = screen.getByText(firstNode.intel).closest(".node-tooltip");
    expect(tooltip).toHaveClass("node-tooltip--above");

    Element.prototype.getBoundingClientRect = function () {
      if (this.classList?.contains("map-canvas")) {
        return { ...mockRect, top: 0, height: 100 };
      }
      if (this.classList?.contains("map-node")) {
        return { ...mockRect, top: 10, height: 10 };
      }
      return mockRect;
    };

    await user.unhover(node);
    await user.hover(node);
    const tooltipBelow = screen
      .getByText(firstNode.intel)
      .closest(".node-tooltip");
    expect(tooltipBelow).toHaveClass("node-tooltip--below");
  });

  it("activates nodes on touch pointer events", () => {
    render(<Map />);

    const node = screen.getByRole("button", { name: firstLabel });
    fireEvent.pointerDown(node, { pointerType: "touch" });

    expect(grantXp).toHaveBeenCalledWith(`map-node-${firstNode.id}`, 27);
  });
});
