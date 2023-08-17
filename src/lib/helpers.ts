import { ThirdwebSDK } from "@thirdweb-dev/sdk"
import { EIP712Domain } from "@thirdweb-dev/sdk/dist/declarations/src/evm/common/sign"
import { ethers } from "ethers"
import omitDeep from "omit-deep"

//Sign typed data with the omitted __typename values using omit-deep
export function omitTypename(object: any) {
    return omitDeep(object, ["__typename"])
}

export async function signTypedDataWithOmmittedTypename(
    sdk: ThirdwebSDK,
    domain: EIP712Domain,
    types: Record<string, any>,
    value: Record<string, any>
) {
    return await sdk.wallet.signTypedData(
        omitTypename(domain) as EIP712Domain,
        omitTypename(types) as Record<string, any>,
        omitTypename(value) as Record<string, any>
    )
}

//Split the signature to extract the "v", "r" and "s" values
export function splitSignature(signature: string){
    return ethers.utils.splitSignature(signature);
}