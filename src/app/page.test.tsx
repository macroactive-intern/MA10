import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MacroLogPage from './page';

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const emptyGet = {
  entries: [],
  daily_totals: { protein_g: 0, carbs_g: 0, fat_g: 0 },
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('MacroLogPage', () => {
  it('renders the three macro inputs and the Log Meal button', async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse(emptyGet));

    render(<MacroLogPage />);

    expect(await screen.findByLabelText(/protein/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/carbs/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fat/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log meal/i })).toBeInTheDocument();
  });

  it('happy path: shows Logging… during POST, adds meal to history, updates totals, clears form', async () => {
    const user = userEvent.setup();

    let resolvePost!: (r: Response) => void;
    const postPending = new Promise<Response>((res) => {
      resolvePost = res;
    });

    global.fetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if ((init?.method ?? 'GET') === 'POST') return postPending;
      return Promise.resolve(jsonResponse(emptyGet));
    });

    render(<MacroLogPage />);
    await screen.findByLabelText(/protein/i);

    await user.type(screen.getByLabelText(/protein/i), '50');
    await user.type(screen.getByLabelText(/carbs/i), '80');
    await user.type(screen.getByLabelText(/fat/i), '20');

    const clickPromise = user.click(screen.getByRole('button', { name: /log meal/i }));

    // Button must show Logging… and be disabled while POST is in flight
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /logging/i })).toBeDisabled()
    );

    resolvePost(
      jsonResponse({
        id: 1,
        protein_g: 50,
        carbs_g: 80,
        fat_g: 20,
        daily_totals: { protein_g: 50, carbs_g: 80, fat_g: 20 },
      })
    );
    await clickPromise;

    // Meal appears in history list
    await waitFor(() => expect(screen.getByText(/50/)).toBeInTheDocument());

    // Calories from server totals: 50*4 + 80*4 + 20*9 = 700
    expect(screen.getByText(/700/)).toBeInTheDocument();

    // Form cleared
    expect(screen.getByLabelText(/protein/i)).toHaveDisplayValue('');
    expect(screen.getByLabelText(/carbs/i)).toHaveDisplayValue('');
    expect(screen.getByLabelText(/fat/i)).toHaveDisplayValue('');

    // Button returns to Log Meal
    expect(screen.getByRole('button', { name: /log meal/i })).toBeInTheDocument();
  });

  it('non-numeric input: shows error, sends no POST, displays no NaN', async () => {
    const user = userEvent.setup();

    global.fetch = vi.fn().mockResolvedValue(jsonResponse(emptyGet));

    render(<MacroLogPage />);
    await screen.findByLabelText(/protein/i);

    // Leave protein empty, fill carbs and fat — protein validation must fail
    await user.type(screen.getByLabelText(/carbs/i), '80');
    await user.type(screen.getByLabelText(/fat/i), '20');
    await user.click(screen.getByRole('button', { name: /log meal/i }));

    // Error message shown
    expect(await screen.findByRole('alert')).toBeInTheDocument();

    // Only the initial GET was called — no POST
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // No NaN anywhere on the page
    expect(document.body.textContent).not.toMatch(/nan/i);
  });

  it('POST failure: shows error, rolls back entries and totals, button returns to Log Meal', async () => {
    const user = userEvent.setup();

    const initialGet = {
      entries: [{ id: 1, protein_g: 30, carbs_g: 45, fat_g: 12 }],
      daily_totals: { protein_g: 30, carbs_g: 45, fat_g: 12 },
    };

    global.fetch = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
      if ((init?.method ?? 'GET') === 'POST') {
        return Promise.resolve(jsonResponse({ error: 'Internal server error' }, 500));
      }
      return Promise.resolve(jsonResponse(initialGet));
    });

    render(<MacroLogPage />);
    await screen.findByLabelText(/protein/i);

    // Initial meal in history: 30*4 + 45*4 + 12*9 = 120 + 180 + 108 = 408 cal
    await waitFor(() => expect(screen.getByText(/408/)).toBeInTheDocument());

    await user.type(screen.getByLabelText(/protein/i), '50');
    await user.type(screen.getByLabelText(/carbs/i), '80');
    await user.type(screen.getByLabelText(/fat/i), '20');
    await user.click(screen.getByRole('button', { name: /log meal/i }));

    // Error message shown
    expect(await screen.findByRole('alert')).toBeInTheDocument();

    // Button back to Log Meal (not Logging…)
    expect(screen.getByRole('button', { name: /log meal/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /logging/i })).not.toBeInTheDocument();

    // Totals reverted — calories still 408, not 700
    expect(screen.getByText(/408/)).toBeInTheDocument();
    expect(screen.queryByText(/700/)).not.toBeInTheDocument();

    // Failed meal not added to history
    const allItems = screen.queryAllByText(/50/);
    expect(allItems.length).toBe(0);
  });

  it('delete meal: calls DELETE with correct ID, removes meal from history, updates totals from server', async () => {
    const user = userEvent.setup();

    const initialGet = {
      entries: [{ id: 1, protein_g: 30, carbs_g: 45, fat_g: 12 }],
      daily_totals: { protein_g: 30, carbs_g: 45, fat_g: 12 },
    };

    global.fetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if ((init?.method ?? 'GET') === 'DELETE') {
        return Promise.resolve(
          jsonResponse({ daily_totals: { protein_g: 0, carbs_g: 0, fat_g: 0 } })
        );
      }
      return Promise.resolve(jsonResponse(initialGet));
    });

    render(<MacroLogPage />);

    // Meal and Delete button appear
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
    );

    await user.click(screen.getByRole('button', { name: /delete/i }));

    // DELETE called with /api/meals/1
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/meals/1'),
        expect.objectContaining({ method: 'DELETE' })
      )
    );

    // Meal removed from history
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
    );

    // Totals updated from server — calories drop to 0
    expect(screen.queryByText(/408/)).not.toBeInTheDocument();
  });
});
