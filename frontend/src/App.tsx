import Todos from "./components/Todos";

function App() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 px-4 py-10 text-slate-900">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            TanStack Query Todos
          </h1>
          <p className="text-slate-600">
            Frontend is now connected to the Express backend.
          </p>
        </header>
        <Todos />
      </div>
    </main>
  );
}

export default App;
