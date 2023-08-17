import { useAddress, useSDK } from "@thirdweb-dev/react";
import generateChallenge from "./generateChallenge";
import { useAuthenticateMutation } from "../../../graphql/generated";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setAccessToken } from "./helpers";

export default function useLogin() {
    // Make sure the user has a connected wallet
    const address = useAddress();
    const sdk = useSDK();

    const {mutateAsync: sendSignedMessage} = useAuthenticateMutation()
    const client = useQueryClient();

    async function login() {
        if(!address) return;

        //Generate challenge with the user's wallet
        const {challenge} = await generateChallenge(address);

        //Sign the chllange with the user's wallet
        const signature = await sdk?.wallet.sign(challenge.text);

        //Send the signed challenge to the Lens API and receive a access token from the Lens API if success
        const { authenticate } = await sendSignedMessage({
            request: {
                address,
                signature
            }
        })

        console.log("Authenticated:", authenticate);

        //Store the access token inside local storage
        const { accessToken, refreshToken } = authenticate;

        setAccessToken(accessToken, refreshToken);

        //Refresh ReactQuery, refetch cache key
        client.invalidateQueries(["lens-user", address]);
    }

    //Return the useMutation hook wrapping the async function
    return useMutation(login);
}