import { render, screen } from "@testing-library/react";
import { Preview } from "../src/components/Preview";

// Mock unified pipeline to avoid ESM transform in tests
const mockProcessor = {
  use: jest.fn().mockReturnThis(),
  process: jest.fn().mockResolvedValue("<h1>Title</h1>"),
};
jest.mock("unified", () => ({
  unified: () => mockProcessor,
}));
// Stub plugins
jest.mock("remark-parse", () => () => undefined);
jest.mock("remark-gfm", () => () => undefined);
jest.mock("remark-math", () => () => undefined);
jest.mock("remark-rehype", () => () => undefined);
jest.mock("rehype-katex", () => () => undefined);
jest.mock("rehype-highlight", () => () => undefined);
jest.mock("rehype-stringify", () => () => undefined);

describe("Preview", () => {
  test("renders markdown headings", async () => {
    render(<Preview content="# Title" />);
    const heading = await screen.findByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Title");
  });
});
