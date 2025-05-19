"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Eye, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { CheckCircle, XCircle } from "lucide-react"

const fetchOrders = async () => {
  const response = await fetch("/api/orders/list")
  const data = await response.json()
  return data
}

export default function Dashboard() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const getOrders = async () => {
      try {
        const data = (await fetchOrders()) as any[]
        setOrders(data)
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }

    getOrders()
  }, [])

  const viewOrderDetails = (order: any) => {
    setSelectedOrder(order)
    setDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  return (
    <div className="min-h-screen">
      <header className="w-full sticky top-0 z-10 border-b bg-background items-center">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold">AutoPO</h1>
          <nav>
            <Button asChild>
              <Link href="/process">Process New Order</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="max-w-screen-lg mx-auto py-6 px-4">
        <h2 className="text-xl font-semibold mb-2">Orders</h2>
        <p className="text-muted-foreground mb-4">
          View and manage all purchase orders
        </p>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Items Count</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-medium">
                      {order.order_number}
                    </TableCell>
                    <TableCell>{order?.line_items?.length}</TableCell>
                    <TableCell>{formatDate(order?.created_at)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewOrderDetails(order)}
                        className="gap-1"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="" />
              Order Details: {selectedOrder?.order_number}
            </DialogTitle>
            <DialogDescription>
              Order Date:{" "}
              {selectedOrder ? formatDate(selectedOrder.created_at) : ""}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="rounded-md border mt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Request Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Matched Product</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedOrder.line_items.map(
                    (item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>
                          {item["matched_product"] &&
                          item["matched_product"] !== "" && item["qty"] && item["price"] && item["total_amount"] ? (
                            <div className="flex items-center text-green-600">
                              <CheckCircle className="w-5 h-5 mr-1" />
                            </div>
                          ) : (
                            <div className="flex items-center text-red-600">
                              <XCircle className="w-5 h-5 mr-1" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item["item_name"]}
                        </TableCell>
                        <TableCell>{item["qty"]}</TableCell>
                        <TableCell>
                          ${item["price"]?.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          ${item["total_amount"]?.toFixed(2)}
                        </TableCell>
                        <TableCell>{item["matched_product"]}</TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}