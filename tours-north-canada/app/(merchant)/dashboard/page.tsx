import { redirect } from 'next/navigation'
import { createClient } from '../../../lib/supabase/server'
import { RevenueChart } from '../../../components/merchant/RevenueChart'
import { ManifestTable } from '../../../components/merchant/ManifestTable'

export const metadata = {
  title: 'Merchant Dashboard | Tours North',
}

export default async function MerchantDashboard() {
  const supabase = createClient()
  
  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Fetch the payout summary view.
  const { data: summary, error: dbError } = await supabase
    .from('merchant_dashboard_payout_summary')
    .select('*')
    .single()

  // If the user isn't a merchant, the RLS policies ensure 0 rows are returned.
  if (dbError || !summary) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-muted-foreground">You do not have active merchant privileges.</p>
        </div>
      </div>
    )
  }

  // Fetch recent bookings for the manifest
  const { data: recentBookings, error: bookingsError } = await supabase
    .from('merchant_dashboard_recent_bookings')
    .select('*')
    .order('date', { ascending: true })

  if (bookingsError) {
    console.error('Failed to load recent bookings:', bookingsError)
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Merchant Portal</h1>
          <p className="text-muted-foreground mt-1">Overview of your bookings, revenue, and daily manifest.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
            Active Partner
          </span>
        </div>
      </header>
      
      {/* Top Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Total Revenue</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">${summary.total_revenue.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Pending Payouts</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold text-yellow-600">${summary.pending_payouts.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Completed Bookings</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{summary.completed_bookings}</div>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Upcoming Bookings</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold text-green-600">{summary.upcoming_bookings}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart Section */}
        <div className="lg:col-span-1 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 border-b">
            <h3 className="text-xl font-semibold tracking-tight">Revenue Overview</h3>
          </div>
          <div className="p-6">
            <RevenueChart summary={summary} />
          </div>
        </div>

        {/* Manifest Table Section */}
        <div className="lg:col-span-2">
          <ManifestTable bookings={recentBookings || []} />
        </div>
      </div>
    </div>
  )
}
