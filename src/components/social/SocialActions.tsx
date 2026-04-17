
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { 
  collection, 
  query, 
  where, 
  addDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  updateDoc
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, UserX, UserMinus, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SocialActionsProps {
  targetUserId: string;
  isBusiness?: boolean;
  className?: string;
  variant?: 'default' | 'minimal';
}

export function SocialActions({ targetUserId, isBusiness = false, className, variant = 'default' }: SocialActionsProps) {
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
  
  const outgoingRequest = requests?.find(r => r.senderId === user?.uid && r.receiverId === targetUserId && r.status === 'pending');
  const incomingRequest = requests?.find(r => r.receiverId === user?.uid && r.senderId === targetUserId && r.status === 'pending');

  // Friendship State
  const friendshipQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'friendships'), where('participants', 'array-contains', user.uid));
  }, [db, user, targetUserId]);
  const { data: friendships } = useCollection(friendshipQuery);
  const isFriend = friendships?.some(f => f.participants.includes(targetUserId));

  const createNotification = async (type: 'follow' | 'friend_request' | 'friend_accept', message: string) => {
    if (!db || !user) return;
    addDoc(collection(db, 'notifications'), {
      recipientId: targetUserId,
      actorId: user.uid,
      actorName: user.displayName || 'Someone',
      actorAvatar: user.photoURL || '',
      type,
      message,
      read: false,
      createdAt: new Date().toISOString()
    });
  };

  const handleFollow = async () => {
    if (!db || !user) return;
    if (isFollowing) {
      const snap = await getDocs(followQuery!);
      snap.forEach(d => deleteDoc(d.ref));
      toast({ title: "Unfollowed" });
    } else {
      addDoc(collection(db, 'follows'), {
        followerId: user.uid,
        followingId: targetUserId,
        createdAt: new Date().toISOString()
      });
      createNotification('follow', 'started following you');
      toast({ title: "Following" });
    }
  };

  const handleFriendRequest = async () => {
    if (!db || !user) return;
    if (outgoingRequest) {
      deleteDoc(doc(db, 'friend_requests', outgoingRequest.id));
      toast({ title: "Request Cancelled" });
    } else {
      addDoc(collection(db, 'friend_requests'), {
        senderId: user.uid,
        receiverId: targetUserId,
        participants: [user.uid, targetUserId],
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      createNotification('friend_request', 'sent you a friend request');
      toast({ title: "Friend Request Sent" });
    }
  };

  const acceptRequest = async () => {
    if (!db || !user || !incomingRequest) return;
    
    addDoc(collection(db, 'friendships'), {
      participants: [user.uid, targetUserId],
      createdAt: new Date().toISOString()
    });

    updateDoc(doc(db, 'friend_requests', incomingRequest.id), { status: 'accepted' });
    createNotification('friend_accept', 'accepted your friend request');
    toast({ title: "Friendship Established!" });
  };

  if (!user || user.uid === targetUserId) return null;

  const isMinimal = variant === 'minimal';

  return (
    <div className={cn("flex flex-wrap gap-2 items-center", className)}>
      {/* Follow Button */}
      <Button 
        variant={isFollowing ? "outline" : "default"} 
        size={isMinimal ? "sm" : "default"}
        onClick={handleFollow}
        className={cn("font-bold", isMinimal && "h-8 px-3 text-[10px]")}
      >
        {isFollowing ? <UserMinus className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
        {isFollowing ? "Unfollow" : "Follow"}
      </Button>

      {/* Friend Actions (Not for businesses) */}
      {!isBusiness && (
        <>
          {isFriend ? (
            <Button variant="secondary" size={isMinimal ? "sm" : "default"} className={cn("font-bold", isMinimal && "h-8 px-3 text-[10px]")} asChild>
              <Link href="/messages">
                <MessageSquare className="w-4 h-4 mr-2" /> Chat
              </Link>
            </Button>
          ) : incomingRequest ? (
            <Button variant="default" size={isMinimal ? "sm" : "default"} className={cn("bg-green-600 hover:bg-green-700 font-bold", isMinimal && "h-8 px-3 text-[10px]")} onClick={acceptRequest}>
              <UserCheck className="w-4 h-4 mr-2" /> Accept
            </Button>
          ) : (
            <Button 
              variant={outgoingRequest ? "outline" : "secondary"} 
              size={isMinimal ? "sm" : "default"} 
              onClick={handleFriendRequest}
              className={cn("font-bold", isMinimal && "h-8 px-3 text-[10px]")}
            >
              {outgoingRequest ? <UserX className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
              {outgoingRequest ? "Pending" : "Add Friend"}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
