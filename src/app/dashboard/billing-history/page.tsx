
'use client';

import React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { CreditCard, Download, Printer, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export type BillingInvoice = {
  id: string;
  invoiceNumber: string;
  date: string; // ISO string
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  downloadUrl?: string; // Optional URL for downloading the invoice PDF
};

const initialBillingData: BillingInvoice[] = [
  { id: 'inv1', invoiceNumber: 'INV-2024-001', date: '2024-07-15T00:00:00.000Z', amount: 19.99, status: 'Paid', downloadUrl: '#' },
  { id: 'inv2', invoiceNumber: 'INV-2024-002', date: '2024-06-15T00:00:00.000Z', amount: 19.99, status: 'Paid', downloadUrl: '#' },
  { id: 'inv3', invoiceNumber: 'INV-2024-003', date: '2024-05-15T00:00:00.000Z', amount: 19.99, status: 'Paid', downloadUrl: '#' },
  { id: 'inv4', invoiceNumber: 'INV-2024-004', date: '2024-04-15T00:00:00.000Z', amount: 19.99, status: 'Overdue' },
  { id: 'inv5', invoiceNumber: 'INV-2024-005', date: '2024-08-01T00:00:00.000Z', amount: 29.99, status: 'Pending' },
];

export default function BillingHistoryPage() {
  const { toast } = useToast();

  const handleDownloadInvoice = (invoice: BillingInvoice) => {
    if (invoice.downloadUrl) {
      toast({ title: "Downloading Invoice", description: `Downloading ${invoice.invoiceNumber}... (Simulated)` });
      // In a real app: window.location.href = invoice.downloadUrl;
    } else {
      toast({ title: "Download Unavailable", description: `No download link for ${invoice.invoiceNumber}.`, variant: "destructive" });
    }
  };

  const handlePrintInvoice = (invoice: BillingInvoice) => {
    toast({ title: "Printing Invoice", description: `Preparing ${invoice.invoiceNumber} for printing... (Simulated)` });
    // In a real app: window.print(); or open a printable view
  };

  const columns: ColumnDef<BillingInvoice>[] = React.useMemo(
    () => [
      {
        accessorKey: 'invoiceNumber',
        header: 'Invoice #',
        cell: ({ row }) => <div className="font-medium">{row.getValue('invoiceNumber')}</div>,
      },
      {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => {
          const dateString = row.getValue('date') as string;
          return dateString ? format(parseISO(dateString), 'PPP') : 'N/A';
        },
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue('amount'));
          const formatted = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(amount);
          return <div>{formatted}</div>;
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as BillingInvoice['status'];
          return (
            <Badge
              variant={
                status === 'Paid'
                  ? 'default'
                  : status === 'Pending'
                  ? 'secondary'
                  : 'destructive'
              }
              className={
                status === 'Paid' ? 'bg-green-500/20 text-green-700 border-green-500/30 dark:bg-green-700/30 dark:text-green-300' :
                status === 'Pending' ? 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30 dark:bg-yellow-700/30 dark:text-yellow-300' :
                'bg-red-500/20 text-red-700 border-red-500/30 dark:bg-red-700/30 dark:text-red-300'
              }
            >
              {status}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const invoice = row.original;
          return (
            <div className="text-right space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadInvoice(invoice)}
                disabled={!invoice.downloadUrl}
              >
                <Download className="mr-1 h-4 w-4" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePrintInvoice(invoice)}
              >
                <Printer className="mr-1 h-4 w-4" />
                Print
              </Button>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [toast]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <CreditCard className="mr-3 h-8 w-8 text-primary" /> Billing History
        </h1>
        <p className="text-muted-foreground">
          View and manage your past invoices and payments.
        </p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center"><FileText className="mr-2 h-5 w-5"/>Your Invoices</CardTitle>
          <CardDescription>
            A record of all your billing transactions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={initialBillingData} initialPageSize={10} />
        </CardContent>
      </Card>
    </div>
  );
}

    