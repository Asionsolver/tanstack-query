import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type Todo = {
  id: number;
  title: string;
};

const API_BASE_URL = "http://localhost:4000";

async function getTodos(): Promise<Todo[]> {
  const response = await fetch(`${API_BASE_URL}/todos`);

  if (!response.ok) {
    throw new Error("Failed to load todos");
  }

  return response.json();
}

async function postTodo(todo: Todo): Promise<Todo> {
  const response = await fetch(`${API_BASE_URL}/todos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(todo),
  });

  if (!response.ok) {
    throw new Error("Failed to save todo");
  }

  return response.json();
}

const Todos = () => {
  const queryClient = useQueryClient();

  const query = useQuery<Todo[]>({ queryKey: ["todos"], queryFn: getTodos });

  const mutation = useMutation({
    mutationFn: postTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  if (query.isLoading) {
    return <p>Loading todos...</p>;
  }

  if (query.isError) {
    return <p>Failed to load todos.</p>;
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Todos</h2>
        <p className="text-sm text-slate-500">Synced with the backend API.</p>
      </div>

      <ul>
        {query.data?.map((todo) => (
          <li key={todo.id} className="rounded-lg bg-slate-50 px-3 py-2">
            {todo.title}
          </li>
        ))}
      </ul>

      <button
        className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={mutation.isPending}
        onClick={() => {
          mutation.mutate({
            id: Date.now(),
            title: "Do Laundry",
          });
        }}
      >
        {mutation.isPending ? "Adding..." : "Add Todo"}
      </button>
    </div>
  );
};

export default Todos;
