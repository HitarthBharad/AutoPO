"use client"

import type React from "react"
import { useState } from "react"
import { Download, FileUp, Loader2, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

const extractDataFromPDF = async (file: File) => {
  const formData = new FormData()
  formData.append("file", file, file.name)

  try {
    const response = await fetch("https://plankton-app-qajlk.ondigitalocean.app/extraction_api", {
      method: "POST",
      headers: { accept: "application/json" },
      body: formData,
    })

    if (!response.ok) throw new Error(`API request failed: ${response.statusText}`)

    return await response.json()
  } catch (error) {
    console.error("Error during extraction:", error)
    return null
  }
}

const getProductSuggestions = async (queries: string[], limit = 5) => {
  try {
    const response = await fetch(`https://endeavor-interview-api-gzwki.ondigitalocean.app/match/batch?limit=${limit}`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ queries }),
    })

    if (!response.ok) throw new Error(`Match API error: ${response.statusText}`)

    const data = await response.json()
    return data?.results
  } catch (error) {
    console.error("Error fetching matches:", error)
    return null
  }
}

const submitOrderToDatabase = async (line_items: any) => {
  const response = await fetch(`/api/orders/create`, {
    method: "POST",
    body: JSON.stringify({ line_items }),
  })

  if (!response.ok) {
    console.error(`API error: ${response}`)
    return false
  }

  return true
}

export default function DocumentProcessor() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [extractedData, setExtractedData] = useState<any[]>([])
  const [productMatches, setProductMatches] = useState<string[][]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => e.preventDefault()

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const normalizeKeys = (item: Record<string, any>) => {
    const keyMap: Record<string, string> = {
      "Request Item": "item_name",
      "Item": "item_name",
      "Item Name": "item_name",
      "Qty": "qty",
      "Quantity": "qty",
      "Unit Price": "price",
      "Price": "price",
      "Amount": "total_amount",
      "Total": "total_amount",
      "Total Amount": "total_amount",
    }

    const normalized: Record<string, any> = {
      item_name: "",
      qty: "",
      price: "",
      total_amount: "",
    }

    Object.entries(item).forEach(([key, value]) => {
      const normalizedKey = keyMap[key]
      if (normalizedKey) {
        normalized[normalizedKey] = value
      }
    })

    return normalized
  }

  const processDocument = async () => {
    if (!file) return
    setIsProcessing(true)

    try {
      const rawData = (await extractDataFromPDF(file)) as any[]
      const normalizedData = rawData.map(normalizeKeys)
      setExtractedData(normalizedData)

      const items = normalizedData.map((i) => i["item_name"])
      const matches = await getProductSuggestions(items)

      const formattedMatched = Object.values(matches).map((matchArray: any) =>
        matchArray.map((match: any) => match.match)
      )

      setProductMatches(formattedMatched)

      const updatedData = normalizedData.map((item, i) => ({
        ...item,
        matched_product: formattedMatched[i]?.[0] || "",
      }))

      setExtractedData(updatedData)
    } catch (error) {
      console.error("Error processing document:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const updateProductMatch = (index: number, value: string) => {
    const newData = [...extractedData]
    newData[index]["matched_product"] = value
    setExtractedData(newData)
  }

  const updateLineItem = (index: number, field: string, value: any) => {
    const newData = [...extractedData]
    newData[index][field] = value
    setExtractedData(newData)
  }

  const submitOrder = async () => {
    if (!extractedData.length) return
    setIsSubmitting(true)

    try {
      const response = await submitOrderToDatabase(extractedData)

      if (!response) {
        toast("Failed to create an order.", { description: new Date().toDateString() })
      } else {
        router.push("/")
      }
    } catch (error) {
      console.error("Error submitting order:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const downloadCSV = () => {
    if (!extractedData.length) return

    const headers = ["Request Item", "Quantity", "Unit Price", "Total", "Matched Product"]
    const csvRows = [
      headers.join(","),
      ...extractedData.map((item, index) => {
        return [
          `"${item["item_name"]}"`,
          item["qty"],
          item["price"] || "",
          item["total_amount"] || "",
          item["matched_product"] || "",
        ].join(",")
      }),
    ]

    const csvContent = csvRows.join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "processed_purchase_order.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }


  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <header className="w-full border-b sticky top-0 z-10 bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold">AutoPO</h1>
          <nav>
            <Button variant="ghost" asChild>
              <Link href="/">View Dashboard</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="w-full max-w-6xl px-4 py-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload Purchase Order</CardTitle>
            <CardDescription>Upload a PDF to extract and process line items</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="border-2 border-dashed rounded-lg p-10 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <FileUp className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-1">{file ? file.name : "Drag & drop or click to upload"}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Supports PDF files up to 10MB"}
              </p>
              <Input id="file-upload" type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
              <Button onClick={(e) => { e.stopPropagation(); processDocument() }} disabled={!file || isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Process Document"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {extractedData.length > 0 && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Extracted Line Items</CardTitle>
                <CardDescription>Review and edit all fields for each line item</CardDescription>
              </CardHeader>
              <CardContent className="overflow-auto">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">Request Item</TableHead>
                        <TableHead className="min-w-[100px]">Quantity</TableHead>
                        <TableHead className="min-w-[120px]">Unit Price</TableHead>
                        <TableHead className="min-w-[120px]">Total</TableHead>
                        <TableHead className="min-w-[240px]">Matched Product</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {extractedData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Input
                              value={item["item_name"]}
                              onChange={(e) => updateLineItem(index, "item_name", e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item["qty"] || ""}
                              onChange={(e) => updateLineItem(index, "qty", Number(e.target.value))}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={item["price"] || ""}
                              onChange={(e) => updateLineItem(index, "price", Number(e.target.value))}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={item["total_amount"] || ""}
                              onChange={(e) => updateLineItem(index, "total_amount", Number(e.target.value))}
                            />
                          </TableCell>
                          <TableCell>
                            {productMatches[index]?.length > 0 && (
                              <Select
                                value={item["matched_product"] || ""}
                                onValueChange={(value) => updateProductMatch(index, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                                <SelectContent>
                                  {productMatches[index].map((product, i) => (
                                    <SelectItem key={i} value={product}>
                                      {product}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button onClick={downloadCSV} className="gap-2">
                <Download className="h-4 w-4" />
                Download CSV
              </Button>
              <Button onClick={submitOrder} disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Submit Order
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}