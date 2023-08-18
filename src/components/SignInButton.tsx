import React from 'react'
import { useAddress, useNetworkMismatch, useNetwork, ConnectWallet, ChainId, MediaRenderer } from "@thirdweb-dev/react"
import useLensUser from '../lib/auth/useLensUser';
import useLogin from '../lib/auth/useLogin';
import Link from 'next/link';


type Props = {};

function SignInButton({}: Props) {

    const address = useAddress();
    const isOnWrongNetwork = useNetworkMismatch();
    const [, switchNetwork] = useNetwork();
    const {isSignedInQuery, profileQuery} = useLensUser();
    const {mutate: requestLogin} = useLogin();

    if(!address) {
        return(
            <ConnectWallet />
        )
    }

    if(isOnWrongNetwork) {
        return(
            <button onClick={() => switchNetwork?.(ChainId.Mumbai)}>
                Switch Network
            </button>
        )
    }

    if(isSignedInQuery.isLoading){
        return <div>Loading...</div>
    }

    if(!isSignedInQuery.data){
        return(
            <button onClick={() => requestLogin()}>
                Sign In with Lens
            </button>
        )
    }

    if(!profileQuery.data?.defaultProfile){
        return <div>No Lens profile</div>
    }

    if(profileQuery.data?.defaultProfile){
        return(
            <Link href={"/profile/my-profile"}>
                <div>
                    Hello {profileQuery.data?.defaultProfile?.handle}
                    <MediaRenderer 
                        src={profileQuery?.data?.defaultProfile?.picture?.original?.url || ""}
                        alt={profileQuery?.data?.defaultProfile?.name || ""}
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%"
                        }}
                    />
                </div>
            </Link>
        ) 
    }

    return(
        <div>Something went wrong</div>
    )

}

export default SignInButton