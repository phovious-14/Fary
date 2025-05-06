"use client";

import { useAccount, useConnect } from 'wagmi'
 
export default function ConnectButton() {
  const { isConnected, address } = useAccount()
  const { connect, connectors } = useConnect()
 
  if (isConnected) {
    return (
      <div className="flex flex-col gap-2 text-black">
        <div>You're connected!</div>
        <div>Address: {address}</div>
      </div>
    )
  }
 
  return (
    <button
      type="button"
      onClick={() => connect({ connector: connectors[0] })}
    >
      Connect
    </button>
  )
}
