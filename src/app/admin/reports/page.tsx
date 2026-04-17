
'use client';

import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, CheckCircle2, User, MessageSquare } from 'lucide-react';

export default function ReportsManagement() {
  const db = useFirestore();

  const reportsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: reports, isLoading } = useCollection(reportsQuery);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-headline font-bold">Content Moderation Queue</h2>
        <div className="flex gap-2 text-xs">
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /> Critical</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500" /> Pending</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /> Resolved</span>
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="h-32 bg-muted animate-pulse rounded-xl" />
        ) : reports?.length ? (
          reports.map((report) => (
            <Card key={report.id} className="border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="destructive">{report.reportedEntityType}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {report.createdAt ? new Date(report.createdAt).toLocaleString() : 'Just now'}
                      </span>
                    </div>
                    <p className="font-bold text-lg">Reason: {report.reason}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        Reporter: {report.reporterId}
                      </div>
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Target ID: {report.reportedEntityId}
                      </div>
                    </div>
                  </div>
                  <div className="flex md:flex-col gap-2 justify-center">
                    <Button variant="outline" className="flex-1">View Content</Button>
                    <Button variant="default" className="flex-1 bg-green-600 hover:bg-green-700">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Resolve
                    </Button>
                    <Button variant="destructive" className="flex-1">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Take Action
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-card border rounded-xl border-dashed">
            <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
            <h3 className="text-xl font-bold">Inbox Zero!</h3>
            <p className="text-muted-foreground">No reports requiring attention at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
