import { Button } from '@/components/shared/Button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome to the Project</h1>
      <Button label="common.getStarted" />
    </main>
  )
}
