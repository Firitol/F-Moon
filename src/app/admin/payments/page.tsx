
'use client';

import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';

export default function PaymentHistory() {
  const db = useFirestore();

  const paymentsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'payments'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: payments, isLoading } = useCollection(paymentsQuery);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-green-500 text-white rounded-2xl space-y-2">
          <p className="text-sm opacity-80">Total Revenue (ETB)</p>
          <p className="text-4xl font-bold">124,500.00</p>
          <div className="flex items-center gap-1 text-xs">
            <ArrowUpRight className="w-3 h-3" />
            <span>12% from last month</span>
          </div>
        </div>
        <div className="p-6 bg-card border rounded-2xl space-y-2">
          <p className="text-sm text-muted-foreground">Active Subscriptions</p>
          <p className="text-4xl font-bold text-primary">84</p>
          <p className="text-xs text-muted-foreground">Premium & Basic plans</p>
        </div>
        <div className="p-6 bg-card border rounded-2xl space-y-2">
          <p className="text-sm text-muted-foreground">Promotion Fees</p>
          <p className="text-4xl font-bold text-accent">12,400</p>
          <p className="text-xs text-muted-foreground">Individual post boosts</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>User / Business</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow><TableCell colSpan={7} className="text-center">Loading payments...</TableCell></TableRow>
            ) : payments?.length ? (
              payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs uppercase">{p.id.substring(0, 8)}</TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{p.userId}</div>
                    <div className="text-xs text-muted-foreground">{p.businessId || 'Direct Pay'}</div>
                  </TableCell>
                  <TableCell className="font-bold">
                    {p.amount?.toLocaleString()} {p.currency}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{p.method}</Badge>
                  </TableCell>
                  <TableCell className="capitalize text-sm">{p.type}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === 'completed' ? 'default' : 'secondary'}>
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '-'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-20 text-muted-foreground">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-10" />
                  No transactions recorded yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
