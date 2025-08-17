import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '<ecolens>/components/ui/card'
import { Button } from '<ecolens>/components/ui/button'
import { ArrowLeft, Package } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-700 bg-slate-900/50 backdrop-blur-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 text-slate-400 mb-4">
            <Package className="h-full w-full" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Product Not Found
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-slate-300">
            The product you&apos;re looking for could not be found.
          </p>
          <p className="text-sm text-slate-400">
            This could be because the product ID is invalid, the product has been removed, or you don&apos;t have access to it.
          </p>
          <div className="pt-4 space-y-3">
            <Button asChild className="w-full">
              <Link href="/dashboard/products">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard">
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

