import { useCreateMirrorTypedDataMutation } from "../../graphql/generated";
import { useSDK, useAddress } from "@thirdweb-dev/react";
import { signTypedDataWithOmmittedTypename, splitSignature } from "./helpers";
import { POLYGON_CONTRACT_ABI, POLYGON_CONTRACT_ADDRESS } from "../constants/polygonContracts";
import { useMutation } from "@tanstack/react-query";
import { MUMBAI_CONTRACT_ABI, MUMBAI_CONTRACT_ADDRESS } from "../constants/mumbaiContracts";
import useLogin from "./auth/useLogin";

type MirrorPostArgs = {
    profileId: string;
    publicationId: string;
  };

export function useMirror() {
    const {mutateAsync: requestTypedData} = useCreateMirrorTypedDataMutation();
    const sdk = useSDK();
    const address = useAddress();
    const {mutateAsync: loginUser} = useLogin();

    async function mirror({
        profileId,
        publicationId
      }: MirrorPostArgs) {
        //Login the user
        await loginUser()

        //Get the typed data for the use to sign
        const typedData = await requestTypedData({
            request: {
                profileId: profileId,
                publicationId: publicationId
            }
        })

        const { domain, types, value } = typedData.createMirrorTypedData.typedData

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
        const result = await lensHubContract.call("mirrorWithSig", [{
            profileId: typedData.createMirrorTypedData.typedData.value.profileId,
            profileIdPointed: typedData.createMirrorTypedData.typedData.value.profileIdPointed,
            pubIdPointed: typedData.createMirrorTypedData.typedData.value.pubIdPointed,
            referenceModuleData: typedData.createMirrorTypedData.typedData.value.referenceModuleData,
            referenceModule: typedData.createMirrorTypedData.typedData.value.referenceModule,
            referenceModuleInitData: typedData.createMirrorTypedData.typedData.value.referenceModuleInitData,
            sig: {
              v,
              r,
              s,
              deadline: typedData.createMirrorTypedData.typedData.value.deadline,
            },
          }]);

        console.log(result)
    }

    return useMutation(mirror)
}