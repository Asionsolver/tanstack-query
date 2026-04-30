# Query Keys

**Query Keys** are the most important part of TanStack Query. Simply put, **Query Key is a "Unique ID" of your cached data.**

There can be thousands of data points in your application. TanStack Query knows where to store the data and when to update it, thanks to these Query Keys.

## Here's a simple explanation of each aspect

## 1. Why does the Query Key always have to be an Array?

In the past (before version 3), strings could be used, but now all Query Keys must be an **Array**. This helps organize the data in a more structured way.

```jsx
// Simple Key
queryKey: ["todos"];
```

## 2. Why do we use Variables in the Query Key?

If your data is dynamic (for example: different user profiles or categories), a single string won't suffice.

**Example:**
You want to see a specific task (Todo) with ID 5.

```jsx
useQuery({ queryKey: ['todo', 5], ... })
```

Here `['todo', 5]` and `['todo', 6]` are two different keys. As a result, TanStack Query will allocate different memory space for these two. If you had used only `['todo']`, the data of ID number 5 would have been overwritten on ID number 6.

---

## 3. Object and Ordering (Deterministic Hashing)

TanStack Query is very smart. It knows that the order of properties in an object doesn't matter.

**For objects (Order doesn't matter):**
The following three keys will be treated as **the same** by TanStack Query:

```jsx
["todos", { status: "done", page: 1 }][("todos", { page: 1, status: "done" })][
  ("todos", { page: 1, status: "done", other: undefined })
];
```

Because whether `status` comes first or `page` comes first in the object, the data remains the same. This is called **Deterministic Hashing**.

**For arrays (Order matters):**
But if the order of items in an array changes, TanStack Query will treat them as **different** keys:

```jsx
["todos", "done", 1][("todos", 1, "done")]; // This is one key // This is a completely different key
```

---

## 4. The Most Important Rule: Variable Dependencies

Your **Query Function** (`queryFn`) contains variables (such as `todoId`, `userId`, or `pageNumber`), then those variables must be included in the **Query Key**.

**Why?**
Remember the dependency array in React's `useEffect`? Query Key works similarly. Whenever any variable in the Query Key changes, TanStack Query automatically fetches new data from the server.

**Incorrect Approach:**

```jsx
function Todo({ id }) {
  return useQuery({
    queryKey: ["todo"], // No ID here
    queryFn: () => fetchTodoById(id), // but the function has the ID
  });
}
```

_Problem:_ If `id` changes from 1 to 2, TanStack Query will not understand that it needs to fetch new data, because its key has not changed.

**Correct Approach:**

```jsx
function Todo({ id }) {
  return useQuery({
    queryKey: ["todo", id], // ID is in the key
    queryFn: () => fetchTodoById(id),
  });
}
```

---

## 5. Real-Life Analogy (Analogy)

Imagine a large library with thousands of drawers.

- **['books']**: This is a drawer where all books are listed.
- **['books', 'fiction']**: This is a separate drawer for fiction books.
- **['books', 'fiction', 101]**: This is a specific drawer for the 101st book in the fiction section.

When you tell the librarian (TanStack Query) "Give me the book from `['books', 'fiction', 101]` drawer", if the drawer is already filled, they will give it to you immediately (from Cache). If it's empty, they will fetch the book from the publisher (Server) and place it in the drawer before giving it to you.

---

## 6. Professional Tips: Hierarchical Structure

In large applications, it's good to structure keys like this:

1. `['todos', 'list', { status: 'done' }]`
2. `['todos', 'detail', 5]`
3. `['users', 'profile', 10]`

By structuring keys in this way, you gain the benefit of being able to invalidate all `todos` at once, or simply refresh the `list` items of `todos`.

## Summary

- **Array-based IDs:** Your data's identity.
- **Automatic Refetching:** Data updates automatically when the key changes.
- **Caching:** Data can be quickly retrieved from memory for the same key.
- **Object Hashing:** The order of properties in an object doesn't matter, but the order in an array does.

➡️ **Home: [Home](../../README.md)**
