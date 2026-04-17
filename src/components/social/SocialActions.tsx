
'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { 
  collection, 
  query, 
  where, 
  addDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, UserX, UserMinus, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface SocialActionsProps {
  targetUserId: string;
  isBusiness?: boolean;
}

export function SocialActions({ targetUserId, isBusiness = false }: SocialActionsProps) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  // Follow State
  const followQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'follows'), where('followerId', '==', user.uid), where('followingId', '==', targetUserId));
  }, [db, user, targetUserId]);
  const { data: followDocs } = useCollection(followQuery);
  const isFollowing = (followDocs?.length || 0) > 0;

  // Friend Request State
  const requestQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'friend_requests'), 
      where('participants', 'array-contains', user.uid)
    );
  }, [db, user, targetUserId]);
  const { data: requests } = useCollection(requestQuery);
  
  const outgoingRequest = requests?.find(r => r.senderId === user?.uid && r.receiverId === targetUserId);
  const incomingRequest = requests?.find(r => r.receiverId === user?.uid && r.senderId === targetUserId);

  // Friendship State
  const friendshipQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'friendships'), where('participants', 'array-contains', user.uid));
  }, [db, user, targetUserId]);
  const { data: friendships } = useCollection(friendshipQuery);
  const isFriend = friendships?.some(f => f.participants.includes(targetUserId));

  const handleFollow = async () => {
    if (!db || !user) return;
    if (isFollowing) {
      const snap = await getDocs(followQuery!);
      snap.forEach(d => deleteDoc(d.ref));
      toast({ title: "Unfollowed" });
    } else {
      await addDoc(collection(db, 'follows'), {
        followerId: user.uid,
        followingId: targetUserId,
        createdAt: new Date().toISOString()
      });
      toast({ title: "Following" });
    }
  };

  const handleFriendRequest = async () => {
    if (!db || !user) return;
    if (outgoingRequest) {
      await deleteDoc(doc(db, 'friend_requests', outgoingRequest.id));
      toast({ title: "Request Cancelled" });
    } else {
      await addDoc(collection(db, 'friend_requests'), {
        senderId: user.uid,
        receiverId: targetUserId,
        participants: [user.uid, targetUserId],
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      toast({ title: "Friend Request Sent" });
    }
  };

  const acceptRequest = async () => {
    if (!db || !user || !incomingRequest) return;
    
    // 1. Create Friendship
    await addDoc(collection(db, 'friendships'), {
      participants: [user.uid, targetUserId],
      createdAt: new Date().toISOString()
    });

    // 2. Update Request Status
    await updateDoc(doc(db, 'friend_requests', incomingRequest.id), { status: 'accepted' });
    toast({ title: "Friendship Established!" });
  };

  if (!user || user.uid === targetUserId) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {/* Follow Button (Available for all) */}
      <Button 
        variant={isFollowing ? "outline" : "default"} 
        size="sm" 
        onClick={handleFollow}
        className="font-bold"
      >
        {isFollowing ? <UserMinus className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
        {isFollowing ? "Unfollow" : "Follow"}
      </Button>

      {/* Friend Actions (Not for businesses) */}
      {!isBusiness && (
        <>
          {isFriend ? (
            <Button variant="secondary" size="sm" className="font-bold" asChild>
              <Link href="/messages">
                <MessageSquare className="w-4 h-4 mr-2" /> Chat
              </Link>
            </Button>
          ) : incomingRequest ? (
            <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700 font-bold" onClick={acceptRequest}>
              <UserCheck className="w-4 h-4 mr-2" /> Accept Friend
            </Button>
          ) : (
            <Button 
              variant={outgoingRequest ? "outline" : "secondary"} 
              size="sm" 
              onClick={handleFriendRequest}
              className="font-bold"
            >
              {outgoingRequest ? <UserX className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
              {outgoingRequest ? "Cancel Request" : "Add Friend"}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
