# Queries Basics

## What is a Query?

The documentation uses a nice term: **"Declarative Dependency"**.

- **General Method (Imperative):** You write the code yourself and say—"Fetch when the button is clicked, then put the result in the state."
- **TanStack Query Method (Declarative):** You simply declare—"I need the data for my `['todos']` key, and I want to fetch it using this function." That's it! Now TanStack Query will figure out when to fetch and refresh the data.

---

### 2. The two main components of `useQuery`

Subscribing to a query requires at least two things:

1. **Unique Key:** The ID to identify the data in the cache.
2. **Query Function (`queryFn`):** A function that returns a promise. It can resolve with the data or reject with an error.

---

## ৩. Status (Data status)

When a query runs, it is in one of 3 main states. This tells us what state the **data** is in:

- **`isPending` (status: 'pending'):** You don't have any data yet. This usually happens the first time data is loaded.
- **`isError` (status: 'error'):** There was a problem fetching the data.
- **`isSuccess` (status: 'success'):** The data was fetched successfully and you can now display it.

---

## 4. FetchStatus (function status) — This is very important!

-**`status`** says: **Is there **"data"\*\* ? (Success/Pending/Error)

- **`fetchStatus`** says: **Is ``queryFn` (the function)"** currently running? (Fetching/Paused/Idle)

### Why do we need two separate states?

In real-life applications, many scenarios arise where data is present (Success), but new data is being fetched (Fetching).

**Illustration with an example:**

| Scenario               | `status`  | `fetchStatus` | Explanation                                                                          |
| :--------------------- | :-------- | :------------ | :----------------------------------------------------------------------------------- |
| **First time loading** | `pending` | `fetching`    | There is no data and it is currently being fetched.                                  |
| **Offline State**      | `pending` | `paused`      | No data available, but was trying to fetch data when internet was unavailable.       |
| **Background Refresh** | `success` | `fetching`    | The screen shows the previous data, but new data is being fetched in the background. |
| **Idle**               | `success` | `idle`        | Data is available and no new requests are being made.                                |

---

## 5. A complete example and state handling

```jsx
function MyTodos() {
  const {
    data,
    isPending,
    isError,
    error,
    isFetching, // To track background loading
  } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });

  // 1. If the data is loading for the first time
  if (isPending) {
    return <div>Loading...</div>;
  }

  // 2. If an error occurs
  if (isError) {
    return <div>Error occurred: {error.message}</div>;
  }

  // 3. If successful, render the data
  return (
    <div>
      {/* If background refresh is happening, show a small indicator */}
      {isFetching && <div>Updating...</div>}

      <ul>
        {data.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 6. Why do we need `isFetching` separately?

Suppose, you have loaded the Facebook home page once. Now, you come back to the home page after 5 minutes.
TanStack Query will show you the **old data** instantly (so your screen doesn't stay blank). At this point, `status` will be `success` (because data is available).
But it will keep checking for new posts in the background. Then `isFetching` will be `true`. The user won't know that work is going on behind the scenes until the new data arrives and replaces the old data. This is known as the **"Stale-while-revalidate"** logic.

### 7. TypeScript Benefits

If you are using TypeScript, TanStack Query provides excellent type checking.

- If you check `if (isPending)` and `if (isError)`, TypeScript will understand that `data` now cannot be `undefined`, and must contain the actual data.

## Summary

1. **Queries** This is a way to read server state.
2. **`queryKey`** is a unique identifier, and **`queryFn`** is the function to fetch the data.
3. **`status` (Success/Pending/Error)** tells you whether the data is available.
4. **`fetchStatus` (Fetching/Paused/Idle)** tells you whether the API request is currently running.
5. Always check `isPending` first, then `isError`, and finally display the main data.

➡️ **Home: [Home](../../README.md)**
