### Core Concepts

> These three concepts of TanStack Query (Queries, Mutations, and Invalidation) are the lifeblood of this library.

#### 1. Queries (Data Reading or Fetching)

> **Simple Word:** When you want to **read or fetch** data from the server, you use `useQuery`. This is mainly for GET requests.

**Main Subject:**

- **Unique Key (`queryKey`):** This is like an ID. TanStack Query uses this key to cache data and find it later.

- **Query Function (`queryFn`):** This is a function that returns a promise (e.g., `fetch` or `axios` call).

**Example:**

```jsx
const { data, isPending, isError, error } = useQuery({
  queryKey: ["todos"], // This key is used to cache the data in memory
  queryFn: fetchTodos, // This function fetches the data from the server
});
```

**States:**

- `isPending`: The data has not loaded yet (first-time load).
- `isError`: An error occurred.
- `data`: The successfully fetched data.
- `isFetching`: Whether the data is being refetched in the background (can be `true` even in a successful state).

---

#### 2. Mutations (Data Modification)

**Simple Word:** When you want to **create, update, or delete** data on the server, you use `useMutation`. This is mainly for POST, PUT, PATCH, and DELETE requests.

**Queries vs. Mutations:**

- Query automatically loads when the component mounts.

- Mutation requires a manual call (e.g., when a button is clicked).

**Example:**

```jsx
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

const mutation = useMutation({
    mutationFn: postTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });


// Clicking the button will call this:
<button onClick={() => mutation.mutate({ title: "To market" })}>
  Add Todo
</button>;
```

**LifeCycles Options (Side Effects):**

- `onMutate`: Just before sending the request.
- `onSuccess`: When the operation is successful.
- `onError`: When the operation fails.
- `onSettled`: Regardless of the outcome, after the operation is complete.

---

#### 3. Query Invalidation (Refreshing data)

**Simple Word:** Suppose you have added a new "Todo" (Mutation). Now the previous "Todo List" (Query) on your screen has become outdated. **Invalidating** this old data and fetching it from the server is called Query Invalidation.

This is done using `queryClient.invalidateQueries()`.

**How does it work?**
When you invalidate a key (Key):

1. TanStack Query marks the data for that key as "Stale".
2. If any component for that key is rendered on the screen, it immediately sends a request to fetch new data in the background.

**Example:**

```tsx
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: postTodo,
  onSuccess: () => {
    // Invalidate all data in the 'todos' key
    // This will cause the 'todos' list to refresh automatically
    queryClient.invalidateQueries({ queryKey: ["todos"] });
  },
});
```

---

### Three Concepts in Action (Full Scenario)

Imagine you are building a **Task Manager**.

1. **Queries:** You use `useQuery(['tasks'], fetchTasks)` to display the list of all tasks. TanStack Query caches this data.

2. **Mutations:** You click the "Save" button after adding a new task. Here, `useMutation` is called to send the data to the server.

3. **Invalidation:** After saving the task (`onSuccess`), you call `queryClient.invalidateQueries({ queryKey: ['tasks'] })`. This tells TanStack Query that the task list is outdated and needs to be refreshed from the server.

➡️ **Home: [Home](../README.md)**
