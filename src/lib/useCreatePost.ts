import { useMutation } from "@tanstack/react-query";
import { PublicationMainFocus, useCreatePostTypedDataMutation } from "../../graphql/generated";
import useLensUser from "./auth/useLensUser";
import { useSDK, useStorageUpload } from "@thirdweb-dev/react";
import { signTypedDataWithOmmittedTypename, splitSignature } from "./helpers";
import { v4 as uuidv4 } from "uuid";
import { MUMBAI_CONTRACT_ABI, MUMBAI_CONTRACT_ADDRESS } from "../constants/mumbaiContracts";
import useLogin from "./auth/useLogin";

type CreatePostArgs = {
  image: File;
  title: string;
  description: string;
  content: string;
};

export default function useCreatePost() {
  const { mutateAsync: requestTypedData } = useCreatePostTypedDataMutation();
  const { mutateAsync: uploadToIpfs } = useStorageUpload();
  const { profileQuery } = useLensUser();
  const sdk = useSDK();
  const { mutateAsync: loginUser } = useLogin();

  async function createPost({
    image,
    title,
    description,
    content,
  }: CreatePostArgs) {

    //Login
    await loginUser();

    //Upload the image to IPFS
    const imageIpfsUrl = (await uploadToIpfs({ data: [image] }))[0];

    //Upload the content to IPFS (object containing title, descip, etc...)
    const postMetadata = {
      version: "2.0.0",
      mainContentFocus: PublicationMainFocus.TextOnly,
      metadata_id: uuidv4(),
      description: description,
      locale: "en-US",
      content: content,
      external_url: null,
      image: imageIpfsUrl,
      imageMimeType: null,
      name: title,
      attributes: [],
      tags: [],
    };

    const postMetadataIpfsUrl = (
      await uploadToIpfs({ data: [postMetadata] })
    )[0];

    //Ask Lens to provide the typed data
    const typedData = await requestTypedData({
      request: {
        collectModule: {
          freeCollectModule: {
            followerOnly: false,
          },
        },
        referenceModule: {
          followerOnlyReferenceModule: false,
        },
        contentURI: postMetadataIpfsUrl,
        profileId: profileQuery.data?.defaultProfile?.id,
      },
    });

    const { domain, types, value } = typedData.createPostTypedData.typedData;

    if (!sdk) return;

    //Sign the typed data
    const signature = await signTypedDataWithOmmittedTypename(
      sdk,
      domain,
      types,
      value
    );

    const { v, r, s } = splitSignature(signature.signature);

    //Use the signed typed data to send the transaction to the blockchain
    const lensHubContract = await sdk.getContractFromAbi(
      MUMBAI_CONTRACT_ADDRESS,
      MUMBAI_CONTRACT_ABI
    );

    // Destructure the stuff we need out of the typedData.value field
    const {
      collectModule,
      collectModuleInitData,
      contentURI,
      deadline,
      profileId,
      referenceModule,
      referenceModuleInitData,
    } = typedData.createPostTypedData.typedData.value;

    const result = await lensHubContract.call("postWithSig", [{
      profileId: profileId,
      contentURI: contentURI,
      collectModule,
      collectModuleInitData,
      referenceModule,
      referenceModuleInitData,
      sig: {
        v,
        r,
        s,
        deadline: deadline,
      },
    }]);

    console.log(result);
  }

  return useMutation(createPost);
}