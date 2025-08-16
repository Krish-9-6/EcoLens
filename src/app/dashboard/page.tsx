import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  // Redirect to products page as the main dashboard view
  redirect('/dashboard/products')
}