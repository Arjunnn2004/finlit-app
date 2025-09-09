import React, {useEffect, useState} from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function Leaderboard(){
  const [rows, setRows] = useState([]);
  useEffect(()=>{
    const q = query(collection(db,'users'), orderBy('coins','desc'), limit(10));
    const unsub = onSnapshot(q, snap => setRows(snap.docs.map(d=>({id:d.id, ...d.data()}))));
    return ()=>unsub();
  }, []);
  return (
    <div>
      <h3 className="font-bold mb-2">Leaderboard</h3>
      <ol className="list-decimal pl-5">
        {rows.map((r)=> <li key={r.id}>{r.name||r.id} — {r.coins}</li>)}
      </ol>
    </div>
  );
}
