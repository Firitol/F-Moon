'use client';

import { useState, useMemo } from 'react';
import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BadgeCheck, XCircle, Eye, Star, Search } from 'lucide-react';

export default function BusinessModeration() {
  const [searchTerm, setSearchTerm] = useState('');
  const db = useFirestore();

  const bizQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'businesses'), orderBy('createdAt', 'desc'), limit(100));
  }, [db]);

  const { data: businesses, isLoading } = useCollection(bizQuery);

  const filteredBusinesses = useMemo(() => {
    if (!businesses) return [];
    const term = searchTerm.toLowerCase();
    return businesses.filter(biz => 
      (biz.name?.toLowerCase().includes(term)) || 
      (biz.ownerId?.toLowerCase().includes(term)) ||
      (biz.categoryId?.toLowerCase().includes(term))
    );
  }, [businesses, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by business name or ID..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="px-4 py-2 cursor-pointer">Pending Approval</Badge>
          <Badge variant="outline" className="px-4 py-2 cursor-pointer">All Businesses</Badge>
          <Badge variant="outline" className="px-4 py-2 cursor-pointer">Verified Only</Badge>
        </div>
      </div>

      <div className="bg-card rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business Name</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Verification</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               [1, 2, 3].map(i => (
                <TableRow key={i}><TableCell colSpan={6}><div className="h-10 bg-muted animate-pulse rounded" /></TableCell></TableRow>
               ))
            ) : filteredBusinesses.length ? (
              filteredBusinesses.map((biz) => (
                <TableRow key={biz.id}>
                  <TableCell className="font-bold">{biz.name}</TableCell>
                  <TableCell className="text-sm">{biz.ownerId}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{biz.categoryId || 'General'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={biz.status === 'active' ? 'outline' : 'secondary'} className="capitalize">
                      {biz.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {biz.isVerified ? (
                      <div className="flex items-center gap-1 text-primary">
                        <BadgeCheck className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">Verified</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Standard</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" title="View Profile"><Eye className="w-4 h-4" /></Button>
                      {!biz.isVerified && (
                        <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10" title="Verify Business">
                          <Star className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" title="Reject/Suspend">
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No businesses found matching "{searchTerm}".
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
