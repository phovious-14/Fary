"use client";

import { useAccount, useConnect } from 'wagmi'
 
export default function ConnectButton() {
  const { isConnected, address } = useAccount()
  const { connect, connectors } = useConnect()
 
  if (isConnected) {
    return (
      <>
        <div>You're connected!</div>
        <div>Address: {address}</div>
      </>
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
