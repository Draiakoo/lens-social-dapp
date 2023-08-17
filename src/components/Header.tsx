import Link from "next/link"
import styles from "../styles/Header.module.css"
import SignInButton from "./SignInButton"

const Header = () => {
  return (
    <>
      <div className={styles.headerContainer}>
          <div className={styles.left}>
            <Link href={"/"}>
                <img src="/logo.jpg" alt="logo" className={styles.logo}/>
            </Link>

            <Link href={"/create"}>Create</Link>
          </div>
          
          <div className={styles.right}>
            <SignInButton />
          </div>
      </div>
      <div style={{height:64}}></div>
    </>
  )
}

export default Header