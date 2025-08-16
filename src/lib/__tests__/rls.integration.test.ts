import { describe, it, expect } from 'vitest'
import { createServerClient } from '../supabase'

describe('RLS Policies Integration Tests', () => {
  const supabase = createServerClient()

  it('should allow public read access to products', async () => {
    const { error } = await supabase.from('products').select('*').limit(1)
    expect(error).toBeNull()
  })

  it('should allow public read access to suppliers', async () => {
    const { error } = await supabase.from('suppliers').select('*').limit(1)
    expect(error).toBeNull()
  })

  it('should allow public read access to certificates', async () => {
    const { error } = await supabase.from('certificates').select('*').limit(1)
    expect(error).toBeNull()
  })

  it('should allow public read access to ledger', async () => {
    const { error } = await supabase.from('ledger').select('*').limit(1)
    expect(error).toBeNull()
  })

  it('should deny public write access to products', async () => {
    const { error } = await supabase.from('products').insert({ name: 'test', brand_id: 'test' } as any)
    expect(error).not.toBeNull()
    expect(error?.message).toContain('permission denied')
  })

  it('should deny public update access to products', async () => {
    const { error } = await supabase.from('products').update({ name: 'test' }).eq('id', 'test')
    expect(error).not.toBeNull()
    expect(error?.message).toContain('permission denied')
  })

  it('should deny public delete access to products', async () => {
    const { error } = await supabase.from('products').delete().eq('id', 'test')
    expect(error).not.toBeNull()
    expect(error?.message).toContain('permission denied')
  })
})
