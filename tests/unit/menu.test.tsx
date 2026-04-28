import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { MenuClient } from "@/app/menu/_components/menu-client";

// Mock Next.js router
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// Mock the auth client
vi.mock("@/lib/auth/client", () => ({
  useSession: () => ({
    data: { user: { id: "1", email: "test@example.com" } },
  }),
}));

describe("MenuClient", () => {
  const mockItems = [
    {
      id: "1",
      name: "Biryani",
      description: "Delicious rice dish",
      priceCents: 350,
      category: "main",
      available: true,
    },
    {
      id: "2",
      name: "Tea",
      description: "Hot beverage",
      priceCents: 50,
      category: "drink",
      available: false,
    },
  ];

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders menu items grouped by category", () => {
    render(<MenuClient items={mockItems} />);

    expect(screen.getByText("Today's menu")).toBeInTheDocument();
    expect(screen.getByText("main")).toBeInTheDocument();
    expect(screen.getByText("drink")).toBeInTheDocument();
    expect(screen.getByText("Biryani")).toBeInTheDocument();
    expect(screen.getByText("Tea")).toBeInTheDocument();
  });

  it("displays correct prices", () => {
    render(<MenuClient items={mockItems} />);

    expect(screen.getByText("$3.50")).toBeInTheDocument();
    expect(screen.getByText("$0.50")).toBeInTheDocument();
  });

  it("shows sold out badge for unavailable items", () => {
    render(<MenuClient items={mockItems} />);

    expect(screen.getByText("Sold out")).toBeInTheDocument();
  });

  it("allows adding items to cart when available", () => {
    render(<MenuClient items={mockItems} />);

    const addButton = screen.getByRole("button", { name: /add/i });
    expect(addButton).toBeInTheDocument();
  });

  it("updates cart when adding an item", async () => {
    const user = userEvent.setup();
    render(<MenuClient items={mockItems} />);

    const addButton = screen.getByRole("button", { name: /add/i });
    await user.click(addButton);

    // Check if quantity controls appear
    expect(screen.getByRole("button", { name: "Decrease" })).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Increase" })).toBeInTheDocument();
  });
});