import { useCreateFollowTypedDataMutation } from "../../graphql/generated";
import { useSDK, useAddress } from "@thirdweb-dev/react";
import { signTypedDataWithOmmittedTypename, splitSignature } from "./helpers";
import { POLYGON_CONTRACT_ABI, POLYGON_CONTRACT_ADDRESS } from "../constants/polygonContracts";
import { useMutation } from "@tanstack/react-query";
import { MUMBAI_CONTRACT_ABI, MUMBAI_CONTRACT_ADDRESS } from "../constants/mumbaiContracts";
import useLogin from "./auth/useLogin";

export function useFollow() {
    const {mutateAsync: requestTypedData} = useCreateFollowTypedDataMutation();
    const sdk = useSDK();
    const address = useAddress();
    const {mutateAsync: loginUser} = useLogin();

    async function follow(userId: string) {
        //Login the user
        await loginUser()

        //Get the typed data for the use to sign
        const typedData = await requestTypedData({
            request: {
                follow: [
                    {
                        profile: userId
                    }
                ]
            }
        })

        const { domain, types, value } = typedData.createFollowTypedData.typedData

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
        const lensHubContract = await sdk.getContractFromAbi(
            MUMBAI_CONTRACT_ADDRESS,
            MUMBAI_CONTRACT_ABI
        )

        //Call the smart contract function "followWithSig"
        const result = await lensHubContract.call("followWithSig", [{
            follower: address,
            profileIds: [userId],
            datas: value.datas,
            sig: {
              v,
              r,
              s,
              deadline: value.deadline,
            },
          }]);

        console.log(result)
    }

    return useMutation(follow)
}