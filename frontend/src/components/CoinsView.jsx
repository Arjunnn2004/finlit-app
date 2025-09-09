import React, {useEffect, useState} from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';

export default function CoinsView(){
  const [coins, setCoins] = useState(0);
  const auth = getAuth();
  useEffect(()=>{
    const u = auth.currentUser;
    if(!u) return;
    const unsub = onSnapshot(doc(db,'users', u.uid), snap => {
      setCoins(snap.exists()? snap.data().coins || 0 : 0);
    });
    return ()=>unsub();
  }, [auth.currentUser]);
  return (
    <div>
      <h3 className="text-lg font-medium">Coins</h3>
      <p className="text-3xl font-bold">{coins}</p>
    </div>
  )
}
