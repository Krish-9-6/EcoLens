'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '<ecolens>/components/ui/table'
import { Button } from '<ecolens>/components/ui/button'
import { Badge } from '<ecolens>/components/ui/badge'
import { ExternalLink, Eye, Package, Clock, TrendingUp, QrCode, Users } from 'lucide-react'
import { StaggeredList } from '<ecolens>/components/ui/PageTransition'
import { ProductQRCode } from '<ecolens>/components/ui/ProductQRCode'
import type { Product, ProductWithSuppliers } from '<ecolens>/lib/types'

interface ProductsTableProps {
  products: (Product & { supplierCount?: number })[]
}

/**
 * ProductsTable Component - Displays products in a table format
 * Requirements: 1.1, 6.1, 6.2
 * 
 * Shows product information with navigation links to detail pages
 * and external DPP links for public viewing
 */
export function ProductsTable({ products }: ProductsTableProps) {
  return (
    <div className="space-y-4">
      {/* Enhanced Table Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Package className="h-5 w-5 text-emerald-400" />
          <h3 className="text-lg font-heading font-semibold text-white">
            Product Portfolio
          </h3>
        </div>
        <Badge variant="secondary" className="font-heading bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
          {products.length} Products
        </Badge>
      </div>

      {/* Enhanced Table */}
      <div className="rounded-lg border border-slate-700 bg-slate-900/50 backdrop-blur-md shadow-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700">
              <TableHead className="font-heading font-semibold text-white">Product Name</TableHead>
              <TableHead className="font-heading font-semibold text-white">Suppliers</TableHead>
              <TableHead className="font-heading font-semibold text-white">QR Code</TableHead>
              <TableHead className="font-heading font-semibold text-white">Created</TableHead>
              <TableHead className="font-heading font-semibold text-white">Last Updated</TableHead>
              <TableHead className="font-heading font-semibold text-right text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <StaggeredList tableContext={true}>
              {products.map((product) => (
                <TableRow key={product.id} className="hover:bg-slate-800/50 transition-all duration-150 border-slate-700">
                  <TableCell className="font-medium">
                    <Link
                      href={`/dashboard/products/${product.id}`}
                      className="hover:text-emerald-400 transition-colors duration-200 font-heading text-white"
                    >
                      {product.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-slate-300">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span>
                        {product.supplierCount || 0} suppliers
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-300">
                    <div className="flex items-center justify-center">
                      <ProductQRCode 
                        productId={product.id} 
                        size={32}
                        className="hover:scale-110 transition-transform cursor-pointer"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-300">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span>
                        {formatDistanceToNow(new Date(product.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-300">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-slate-400" />
                      <span>
                        {formatDistanceToNow(new Date(product.updated_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-3">
                      {/* Dashboard Detail View */}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild
                        className="font-heading font-medium border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white shadow-lg hover:shadow-xl"
                      >
                        <Link href={`/dashboard/products/${product.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Manage
                        </Link>
                      </Button>
                      
                      {/* Public DPP View */}
                      <Button 
                        variant="default" 
                        size="sm" 
                        asChild
                        className="font-heading font-medium bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_20px_rgba(0,255,133,0.3)] hover:shadow-[0_0_30px_rgba(0,255,133,0.5)]"
                      >
                        <Link 
                          href={`/dpp/${product.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View DPP
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </StaggeredList>
          </TableBody>
        </Table>
      </div>

      {/* Empty state message */}
      {products.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-heading font-semibold text-white mb-2">
            No products found
          </h3>
          <p className="text-slate-300">
            Create your first product to get started with supply chain mapping.
          </p>
        </div>
      )}
    </div>
  )
}