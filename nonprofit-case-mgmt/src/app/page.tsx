import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { data, error } = await supabase
    .from('user_roles')
    .select('*')

  return (
    <main style={{ padding: '24px' }}>
      <h1>Supabase Test</h1>
      {error ? (
        <p>Error: {error.message}</p>
      ) : (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
    </main>
  )
}