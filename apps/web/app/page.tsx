"use client"
import { useState } from "react";
import styles from "./page.module.css";
import { Button } from "../../../packages/ui/src/button";
import { useRouter } from "next/navigation";

export default function Home() {
  const [roomId, setRoomId] = useState('');
  const router = useRouter();

  // TODO: Add create room frontend

  return (
    <div className={styles.page} style={{display: "flex", justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw'}}>
      <div>
      <input style={{padding: '10px'}}  onChange={e => setRoomId(e.target.value)} value={roomId} type="text" name="roomId" id="roomId" placeholder="Enter Room ID"/>
      <Button style={{padding: '10px'}}  onClick={() => {
        router.push(`/room/${roomId}`)
      }}>Join Room</Button>

      </div>
    </div>
  );
}
