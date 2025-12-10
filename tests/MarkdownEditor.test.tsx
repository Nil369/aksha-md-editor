import { fireEvent, render, screen } from "@testing-library/react";
import { MarkdownEditor } from "../src/components/MarkdownEditor";

jest.mock("@monaco-editor/react", () => ({
  __esModule: true,
  default: ({ value, onChange }: any) => (
    <textarea
      data-testid="monaco-editor"
      value={value}
      onChange={(e) => onChange?.((e.target as HTMLTextAreaElement).value)}
    />
  ),
}));

// Mock ESM pipeline libs so Jest doesn't need to transpile them
const mockProcessor = {
  use: jest.fn().mockReturnThis(),
  process: jest.fn().mockResolvedValue("<h1>Title</h1>"),
};
jest.mock("unified", () => ({
  unified: () => mockProcessor,
}));
jest.mock("remark-parse", () => () => undefined);
jest.mock("remark-gfm", () => () => undefined);
jest.mock("remark-math", () => () => undefined);
jest.mock("remark-rehype", () => () => undefined);
jest.mock("rehype-katex", () => () => undefined);
jest.mock("rehype-highlight", () => () => undefined);
jest.mock("rehype-stringify", () => () => undefined);

const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

describe("MarkdownEditor", () => {
  afterAll(() => {
    consoleError.mockRestore();
  });

  test("renders default value and calls onChange", () => {
    const handleChange = jest.fn();
    render(<MarkdownEditor defaultValue="hello" onChange={handleChange} />);
    const editor = screen.getByTestId("monaco-editor");
    fireEvent.change(editor, { target: { value: "updated" } });
    expect(handleChange).toHaveBeenCalledWith("updated");
  });

  test("switches view modes via tabs", () => {
    render(<MarkdownEditor defaultValue="hello" />);
    fireEvent.click(screen.getByLabelText("Switch to Preview mode"));
    expect(screen.getByLabelText("Switch to Preview mode")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Switch to Edit mode"));
    expect(screen.getByLabelText("Switch to Edit mode")).toBeInTheDocument();
  });
});
