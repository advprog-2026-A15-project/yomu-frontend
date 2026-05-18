import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ToastProvider, useToast } from "./Toast";

describe("Toast", () => {
  it("should render toast message on toast call", async () => {
    const TestComponent = () => {
      const toast = useToast();
      return (
        <button onClick={() => toast("Test message", "info")}>
          Show Toast
        </button>
      );
    };

    const { getByRole } = render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );

    fireEvent.click(getByRole("button"));

    expect(await screen.findByText("Test message")).toBeInTheDocument();
  });

  it("should render success toast with success class", async () => {
    const TestComponent = () => {
      const toast = useToast();
      return (
        <button onClick={() => toast("Success!", "success")}>Show Toast</button>
      );
    };

    const { getByRole } = render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );

    fireEvent.click(getByRole("button"));

    const toastElement = await screen.findByText("Success!");
    expect(toastElement).toHaveClass("success");
  });

  it("should render error toast with error class", async () => {
    const TestComponent = () => {
      const toast = useToast();
      return (
        <button onClick={() => toast("Error occurred", "error")}>
          Show Toast
        </button>
      );
    };

    const { getByRole } = render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );

    fireEvent.click(getByRole("button"));

    const toastElement = await screen.findByText("Error occurred");
    expect(toastElement).toHaveClass("error");
  });

  it("should remove toast after default TTL", async () => {
    const TestComponent = () => {
      const toast = useToast();
      return (
        <button onClick={() => toast("Temporary message")}>Show Toast</button>
      );
    };

    const { getByRole } = render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );

    fireEvent.click(getByRole("button"));

    expect(await screen.findByText("Temporary message")).toBeInTheDocument();

    // Wait for toast to disappear (default TTL is 3500ms)
    await waitFor(
      () => {
        expect(screen.queryByText("Temporary message")).not.toBeInTheDocument();
      },
      { timeout: 4000 },
    );
  });

  it("should support custom TTL", async () => {
    const TestComponent = () => {
      const toast = useToast();
      return (
        <button onClick={() => toast("Quick disappear", "info", 100)}>
          Show Toast
        </button>
      );
    };

    const { getByRole } = render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );

    fireEvent.click(getByRole("button"));

    expect(await screen.findByText("Quick disappear")).toBeInTheDocument();

    await waitFor(
      () => {
        expect(screen.queryByText("Quick disappear")).not.toBeInTheDocument();
      },
      { timeout: 500 },
    );
  });

  it("should render multiple toasts concurrently", async () => {
    const TestComponent = () => {
      const toast = useToast();
      return (
        <div>
          <button onClick={() => toast("Message 1", "info")}>Toast 1</button>
          <button onClick={() => toast("Message 2", "success")}>Toast 2</button>
          <button onClick={() => toast("Message 3", "error")}>Toast 3</button>
        </div>
      );
    };

    const { getByRole } = render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );

    fireEvent.click(getByRole("button", { name: /Toast 1/ }));
    fireEvent.click(getByRole("button", { name: /Toast 2/ }));
    fireEvent.click(getByRole("button", { name: /Toast 3/ }));

    expect(await screen.findByText("Message 1")).toBeInTheDocument();
    expect(await screen.findByText("Message 2")).toBeInTheDocument();
    expect(await screen.findByText("Message 3")).toBeInTheDocument();
  });

  it("should throw error when useToast is used outside provider", () => {
    const TestComponent = () => {
      const toast = useToast();
      return <div>{toast}</div>;
    };

    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useToast must be used within ToastProvider");

    consoleError.mockRestore();
  });
});
