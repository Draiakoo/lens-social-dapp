import { Web3Button } from "@thirdweb-dev/react";
import styles from "../styles/Create.module.css"
import { useState } from "react"
import { MUMBAI_CONTRACT_ABI, MUMBAI_CONTRACT_ADDRESS } from "../constants/mumbaiContracts";
import useCreatePost from "../lib/useCreatePost";

const Create = () => {

    const [image, setImage] = useState<File | null>(null);
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [content, setContent] = useState<string>("");
    const {mutateAsync: createPost} = useCreatePost();

  return (
    <div className={styles.container}>
        <div className={styles.formContainer}>
            <div className={styles.inputContainer}>
                <input 
                    type="file"
                    onChange={(e) => {
                        if(e.target.files){
                            setImage(e.target.files[0])
                        }
                    }}    
                />
            </div>

            <div className={styles.inputContainer}>
                <input 
                    type="text"
                    placeholder="title"
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            <div className={styles.inputContainer}>
                <textarea 
                    placeholder="Description"
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            <div className={styles.inputContainer}>
                <textarea 
                    placeholder="Content"
                    onChange={(e) => setContent(e.target.value)}
                />
            </div>

            <Web3Button 
                contractAddress={MUMBAI_CONTRACT_ADDRESS}
                contractAbi={MUMBAI_CONTRACT_ABI}
                action={async () => {
                    if(!image) return;

                    return await createPost({
                        image,
                        title,
                        description,
                        content
                })}}
            >
                Create Post
            </Web3Button>

        </div>
    </div>
  )
}

export default Create