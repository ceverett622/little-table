import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')( {
  component: HomePage,
})

function HomePage() {
  return (
    <main className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Welcome to Little Table</h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Daycare meal planning made easy
        </p>
      </div>
    </main>
  )
}
