# Default Behavior

## Stale vs Fresh (Stale vs. fresh data)

> **Default**: As soon as data arrives in TanStack Query, it is considered stale.

- **Explanation**: Whenever data comes from the server, TanStack Query assumes that it might be out of date right now. So whenever you use the same query again later (e.g., going from one page to another), it will immediately try to fetch the new data in the background.

- **staleTime**: If you want the data to remain "Fresh" for a certain amount of time, you can set staleTime.
  - **staleTime**: 5000 (5 seconds) (The data will remain fresh for 5 seconds, no refetch will happen during this time).

    > Scenario: A cryptocurrency price tracker app.
    > Cryptocurrency prices change every second, but you don't want users to request new data from the server every time they click on the app's tab. You want to provide a 5-second buffer.

    ```jsx
    const { data } = useQuery({
      queryKey: ["btc-price"],
      queryFn: fetchBtcPrice,
      staleTime: 5000, // 5 seconds
    });
    ```

    ###### Behavior:
    - When you first loaded the page, the data came in. It is now "Fresh".
    - Within the next 5 seconds, if you navigate to another tab and then return to the app, TanStack Query will not make a new API call. It will display the data from memory.
    - After 5 seconds have passed, the data will become "Stale". If you then focus the window again, it will fetch the new price in the background.

  - **Infinity**: The data will never become stale. However, you can manually update it with invalidateQueries if you want.

    > Scenario: User profile or settings page.
    > User names, emails, or settings rarely change. You don't want users to see loading spinners or background refetches every time they visit this page.

    ```jsx
    const { data } = useQuery({
      queryKey: ["user-settings"],
      queryFn: fetchSettings,
      staleTime: Infinity,
    });
    ```

    ###### Behavior:
    - Once the data is gone, it will be marked as "Fresh" for life. It will never be automatically re-fetched again while the app is running.
    - However (Crucial Point): If the user updates his settings (Mutation), then you can call `queryClient.invalidateQueries({ queryKey: ['user-settings'] })` in the code. Then TanStack Query will be forced to fetch new data from the server. That is, it will not be automatic but can be updated manually.

  - **'static'**: This is the strictest. The data will never be stale and invalidateQueries will not work. Use this only for data that will never change during the life of the app (e.g. user permissions or country lists).

    > Scenario: Country list or user permissions.
    > The list of countries or user permissions is unlikely to change during the app's lifecycle. You want to ensure that this data is never refetched or invalidated.

    ```jsx
    const { data } = useQuery({
      queryKey: ["country-list"],
      queryFn: fetchCountryList,
      staleTime: "static",
    });
    ```

    ###### Behavior:
    - It is more powerful than Infinity. Once the data is there it becomes "Permanent".
    - The biggest difference is that even if you accidentally call `queryClient.invalidateQueries({ queryKey: ['countries'] })` somewhere else, TanStack Query will not re-fetch it.
    - Even if refetchOnWindowFocus: "always" is set, 'static' will block it. This is the most drastic way to save memory and bandwidth.

### The difference at a glance:

| Features                         | `staleTime: 5000`           | `staleTime: Infinity`        | `staleTime: 'static'`       |
| :------------------------------- | :-------------------------- | :--------------------------- | :-------------------------- |
| **Automatic re-fetch**           | It will be in 5 seconds.    | Never                        | Never                       |
| **Will invalidateQueries work?** | Yes                         | Yes (manual update possible) | **No** (completely ignored) |
| **Window focus re-fetch**        | In 5 seconds                | Never                        | Never                       |
| **Use case**                     | Stock market, notifications | User profile, settings       | Country list, app config    |

**In simple words:**

- If you want it to update every few minutes -> use **Time (ms)**।
- If you want it to never auto-update but be manually updateable -> use **`Infinity`**。
- If you know this data will never change -> use **`'static'`**。

## Automatic Background Refetch

**An important thing to remember:** These re-fetches will only occur if your data is **Stale**. If the data is **Fresh** during the `staleTime`, these triggers will not work.

---

### 1. Window Focus (`refetchOnWindowFocus`)

**Scenario:** Suppose you are reading a news app. You go to another tab and watch a YouTube video, then come back to the news app tab. TanStack Query will immediately re-fetch in the background so that you can see the latest news.

**Why disable it?** If your API is very expensive (e.g., you pay per call) or the data doesn't change much, it's best to disable it.

```jsx
const { data } = useQuery({
  queryKey: ["news"],
  queryFn: fetchNews,
  // Window focus re-fetch disabled
  refetchOnWindowFocus: false,
});
```

### 2. Component Mount (`refetchOnMount`)

**Scenario:** You navigate from the 'Home' page to the 'About' page, and then back to the 'Home' page. When the 'Home' page component mounts again, TanStack Query will re-fetch the data (if it is stale).

**Why disable it?** If you want the user to see the cached data when they return to a page, and avoid unnecessary requests.

```jsx
const { data } = useQuery({
  queryKey: ["profile"],
  queryFn: fetchProfile,
  // Component mount re-fetch disabled
  refetchOnMount: false,
});
```

---

### 3. Network Reconnect (`refetchOnReconnect`)

**Scenario:** You are traveling by bus and your phone's internet connection drops. A few moments later, when the internet is available again, TanStack Query will automatically check the server for any new updates.

**Why disable it?** If your app is offline-first or you don't want multiple requests to be sent simultaneously when the internet is available again.

```jsx
const { data } = useQuery({
  queryKey: ["tasks"],
  queryFn: fetchTasks,
  // Network reconnect re-fetch disabled
  refetchOnReconnect: false,
});
```

---

### 4. Global Configuration

In most projects, you don't want to specify these settings for each query individually, but rather configure them once for the entire application. This is done during the `QueryClient` setup.

```jsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Tab focus re-fetching is off for the entire app.
      refetchOnMount: false, // Component mount re-fetch disabled
      retry: 1, // If there is an error, try only once.
      staleTime: 5 * 60 * 1000, // Data will remain fresh for up to 5 minutes.
    },
  },
});
```

### A little tip:

If you want these triggers to **always** work, even if the data is **Fresh**, you can use `"always"` instead of `true`.

- `refetchOnWindowFocus: "always"` (whether the data is stale or not, it will refetch when the tab is focused).

## Garbage Collection Or gcTime (Clearing memory)

**gcTime (Garbage Collection Time)** The easiest way to understand it is that it controls the **"life span"** of memory or cache.

---

### 1. Real-life Example (Timeline Scenario)

Suppose you have an e-commerce app with two pages: **Product List** and **Settings**.

1.  **10:00 AM:** The user navigates to the **Product List** page. The `useQuery({ queryKey: ['products'], ... })` call is made. The data is fetched and displayed on the screen. At this time, this query is **"Active"**.
2.  **10:05 AM:** The user leaves the page and goes to the **Settings** page. Now there is no product list visible on the screen. Therefore, the `['products']` query becomes **"Inactive"**.
3.  **Clock Starts (gcTime):** Since the default `gcTime` is 5 minutes, TanStack Query will wait from 10:05 to 10:10. During this time, the data will remain in memory (Cache).

#### **Two Scenarios are Possible:**

- **Scenario A (Returning before 5 minutes):** The user returns to the **Product List** page at 10:08. Since the 5-minute period hasn't passed, the data is still in memory. The user can see the products without any **Loading Spinner**.
- **Scenario B (Returning after 5 minutes):** The user returns to the **Product List** page at 10:12. Since the 5-minute period has passed, TanStack Query will delete the data from memory (Garbage Collection). The user will now see a **Loading Spinner** and new data will be fetched from the server.

---

### 2. Code Example

You can set `gcTime` for each query individually or globally.

```jsx
const { data } = useQuery({
  queryKey: ["large-data"],
  queryFn: fetchLargeData,
  // We want the data to be deleted from memory 1 minute after the user leaves the page
  gcTime: 60 * 1000,
});
```

**Why do this?** If you have very large data (e.g. a table with thousands of rows), keeping it in memory for a long time can slow down the performance of your phone or browser. So it's wise to reduce `gcTime` in that case.

---

### 3. staleTime VS gcTime

- **staleTime:** The data will remain stale for a certain period. (As long as it's fresh, it won't be refetched).
- **gcTime:** The data will remain in memory for a certain period. (After leaving the page, it will be deleted after a certain time).

**A good analogy:**
Imagine you order food at a restaurant.

- The food will remain hot on the table for 5 minutes (**staleTime**). After 5 minutes, it will become cold (Stale).
- If you finish eating and leave the table, the waiter won't take the food with them. They will leave it on the table for 5 minutes (**gcTime**), so if you come back and want the food, you can have it. After 5 minutes, they will throw it away (Garbage Collection).

---

### 4. When to set gcTime: 0?

If your app has sensitive data (e.g. bank balance or password), which you want to delete from memory as soon as the user leaves the page (for security reasons), then you can set `gcTime: 0`. This way, the data will be deleted immediately when the user navigates away from the page.

**Summary:**
`gcTime` is a tool for managing memory in your app. It ensures that unused data doesn't occupy memory unnecessarily, while still fetching fresh data when needed.

## Retry failed request (Automatic Retries)

### **Automatic Retries** is a "Resilience" feature of TanStack Query. It protects your app from minor internet issues or temporary server downtime.

### ১. The Default Behavior

When an API request fails, TanStack Query does not immediately show the user an "Error". He thinks that maybe there is a problem with the internet, and that it will be fixed if he tries again.

**Steps:**

1.  **First Attempt:** Failed.
2.  **First Retry:** Tried again after 1000ms (1 second).
3.  **Second Retry:** Tried again after 2000ms (2 seconds).
4.  **Third Retry:** Tried again after 4000ms (4 seconds).
5.  **All Failed:** This time, the query will set `isError: true` and show the user an error message.

This waiting twice as long every time is called **Exponential Backoff**.

---

### 2. Code example: Controlling retries

You can disable retries for a specific query or increase the number of retry attempts.

#### Example 1: Disabling retries (Retry: 0)

If you know that your API request will never succeed (e.g., incorrect URL), you can disable retries.

```jsx
const { data, error } = useQuery({
  queryKey: ["profile"],
  queryFn: fetchProfile,
  retry: 0, // Show error immediately on first failure
});
```

#### Example 2: Specifying number of retries (Retry: 5)

For critical data, you might want to increase the number of retry attempts.

```jsx
const { data, error } = useQuery({
  queryKey: ["profile"],
  queryFn: fetchProfile,
  retry: 5, // Try 5 times before showing error
});
```

#### Example 3: Specifying number of retries (Retry: 5)

For critical data, you might want to increase the number of retry attempts.

```jsx
const { data } = useQuery({
  queryKey: ["settings"],
  queryFn: fetchSettings,
  retry: 5, // Try 5 times before showing error
});
```

---

### ৩. Intelligent retry (Conditional Retry)

It is not wise to retry for all errors. For example, if the error code is **404 (Not Found)**, then trying 1000 times is useless because there is no data. But if it is **500 (Internal Server Error)**, then you should retry.

```jsx
const { data } = useQuery({
  queryKey: ["todos"],
  queryFn: fetchTodos,
  retry: (failureCount, error) => {
    // If the error code is in the 4th digit (e.g. 404), there is no need to retry.
    if (error.response?.status === 404) return false;

    // For other errors, try up to 3 times.
    return failureCount < 3;
  },
});
```

---

### 4.Custom Retry Delay

If you want, you can set the time between retries yourself:

```jsx
const { data } = useQuery({
  queryKey: ["sensor-data"],
  queryFn: fetchSensorData,
  retry: 3,
  retryDelay: 1000, // Will try equals every 1 second
  // Or as a function:
  // retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
});
```

---

### 5. Analogy: Making a phone call

Imagine you are calling your friend.

- **Without retry:** You called once, he didn't pick up. You immediately assumed he wouldn't talk to you again (Error).
- **With retry (TanStack Query):** You called once, he didn't pick up. You called again after 1 minute. You called again after 2 minutes. After 3 attempts, when he still didn't pick up, you assumed he was busy or had some issue (Final Error).

**Benefit:** If your phone signal drops for 2 seconds during the call, the retry feature allows your call to succeed without the user knowing.

---

### 6. Impact on User Interface

While retries are happening, `isLoading` or `isPending` will remain **True**. This means the user will only see a loading spinner. The user won't see the error screen until the retries are exhausted. This makes the app feel much more professional and "smooth".

**Summary:**

- **Retry:** How many times to attempt (default 3).
- **RetryDelay:** How long to wait between attempts (default Exponential).
- **Why it matters:** To handle network instability and maintain a good user experience.

## 5. Structural Sharing

**Structural Sharing** is a "magic" feature of TanStack Query that helps maintain the performance of your React app. To understand it, you first need to understand a little bit of JavaScript: **Reference**.

In JavaScript, even if all the data inside two objects is the same, they are not equal if they are located in different locations in memory.

```javascript
const obj1 = { name: "Anis" };
const obj2 = { name: "Anis" };
console.log(obj1 === obj2); // Result will be false
```

### 1. What is the problem?

In React, whenever the reference of a state or prop changes, React assumes the data has changed and re-renders the entire component.

Suppose you fetch a user list every 5 seconds. After 5 seconds, the data received from the server is identical to the previous data (no changes). However, since this is a new API response, JavaScript will assign it a new reference. As a result, React will unnecessarily re-render the entire list.

---

### 2. The Solution: Structural Sharing

TanStack Query when it receives new data, it then performs a deep comparison with the previous data.

#### Example 1: Data has not changed

```tsx
// 5 seconds ago's data (Old Data)
const oldData = { id: 1, name: "Anis", status: "active" };

// Current new data (New Data from Server)
const newData = { id: 1, name: "Anis", status: "active" };

// Structural Sharing makes:
console.log(oldData === newData); // TanStack Query will make this true!
```

**Result:** React will see that the data is the same (reference unchanged), so it won't re-render the page. This makes your app much faster.

---

#### Example 2: Data has partially changed (Partial Update)

This is the real power. Suppose you have an object that contains the user's profile and their post list.

```javascript
// Old data (Cache)
const oldState = {
  profile: { name: "Anis", age: 25 },
  posts: ["Post 1", "Post 2"],
};

// New data (New Data from Server)
const newState = {
  profile: { name: "Anis", age: 25 },
  posts: ["Post 1", "Post 2", "Post 3"],
};
```

**What does TanStack Query do here?**
It will see that the `profile` part is exactly the same as before. Therefore, it will keep the old reference for `profile` in the new state.

```javascript
// After TanStack Query's processing:
oldState.profile === newState.profile; // true (reference shared)
oldState.posts === newState.posts; // false (because a new item has been added)
```

**Result:** The component that only displays **Profile** will not re-render. Only the **Posts** component will re-render.

---

### 3. Why is this important?

If you are using `useMemo`, `useCallback` or `React.memo` in your components, structural sharing makes these optimizations effective. Without it, every API call would create a new reference, causing `useMemo` to think the data is new and recalculate it every time.

TanStack Query makes this memoization worthwhile by stabilizing the reference.

---

### 4. Analogy: Lego set

Imagine you have a house made of Lego.

- **Common Approach:** If you want to change a window in the house, you would break the entire house and rebuild it from scratch. (This is time-consuming).
- **Structural Sharing:** You keep the walls, roof, and doors as they are (shared), and just replace the window. The house is now new, but most of it remains the same.

---

### 5. When does this not work?

1. **Non-JSON Data:** If your API response contains `Map`, `Set`, or `Function`, this will not work. This is only for plain JSON objects and arrays.
2. **Large Data:** If your response is very large and changes frequently, this comparison can impact performance. In such cases, you can set `structuralSharing: false` (though this is rarely needed).

### Summary:

**Structural Sharing** is a filter that compares the "new memory reference" from the server and the "old reference" we have. It keeps the old reference as much as possible so that React doesn't perform unnecessary work.

➡️ **Home: [Home](../../README.md)**
