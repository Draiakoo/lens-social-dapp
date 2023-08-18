import { useCreateUnfollowTypedDataMutation } from "../../graphql/generated";
import { useSDK, useAddress } from "@thirdweb-dev/react";
import { signTypedDataWithOmmittedTypename, splitSignature } from "./helpers";
import { useMutation } from "@tanstack/react-query";
import useLogin from "./auth/useLogin";
import { LENS_FOLLOW_NFT_ABI } from "../constants/followNftAbi";

export function useUnfollow() {
    const {mutateAsync: requestTypedData} = useCreateUnfollowTypedDataMutation();
    const sdk = useSDK();
    const address = useAddress();
    const {mutateAsync: loginUser} = useLogin();

    async function unfollow(userId: string) {
        //Login the user
        await loginUser()

        //Get the typed data for the use to sign
        const typedData = await requestTypedData({
            request: {
                profile: userId
            }
        })

        const { domain, types, value } = typedData.createUnfollowTypedData.typedData

        if(!sdk) return;

        //Ask the user to sign that typed data
        const signature = await signTypedDataWithOmmittedTypename(
            sdk,
            domain,
            types,
            value
        )

        const { v, r, s } = splitSignature(signature.signature)

        //Send the typed data to the smart contract to perform the operation on the blockchain
        const followNftContract = await sdk.getContractFromAbi(
            domain.verifyingContract,
            LENS_FOLLOW_NFT_ABI
        )

        
        //Call the smart contract function "burnWithSig"
        const result = await followNftContract.call("burnWithSig", [
            value.tokenId,
            {
              v,
              r,
              s,
              deadline: value.deadline,
            },
          ]);

        console.log(result)
    }

    return useMutation(unfollow)
}