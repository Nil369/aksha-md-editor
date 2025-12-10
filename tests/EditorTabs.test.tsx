import { fireEvent, render, screen } from "@testing-library/react";
import { EditorTabs } from "../src/components/EditorTabs";

describe("EditorTabs", () => {
  test("calls onViewModeChange when clicking tabs", () => {
    const handleChange = jest.fn();
    render(<EditorTabs viewMode="edit" onViewModeChange={handleChange} />);

    fireEvent.click(screen.getByText("Preview"));
    expect(handleChange).toHaveBeenCalledWith("preview");

    fireEvent.click(screen.getByText("Split"));
    expect(handleChange).toHaveBeenCalledWith("split");
  });

  test("renders fullscreen toggle when provided", () => {
    const handleToggle = jest.fn();
    render(
      <EditorTabs
        viewMode="edit"
        onViewModeChange={() => {}}
        isFullscreen={false}
        onFullscreenToggle={handleToggle}
      />
    );

    fireEvent.click(screen.getByLabelText("Enter fullscreen"));
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });
});

