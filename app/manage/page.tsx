"use client"
import ManageStakeAccounts from "../../components/ManageStakeAccounts";
import { useRouter } from "next/navigation";

function Manage() {
  const router = useRouter(); // Instantiate useRouter

  const handleClose = () => {
    router.push("/"); // Navigate back to home
  };

  return (
    <>
      <ManageStakeAccounts onClose={handleClose} />
    </>
  );
}

export default Manage;
