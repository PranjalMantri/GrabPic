import Head from "next/head";

import { RegisterForm } from "@/components/auth";

export default function RegisterPage() {
  return (
    <>
      <Head>
        <title>GrabPic | Create Account</title>
        <meta
          name="description"
          content="Create a GrabPic account with your name, email, and password to start curating event photos."
        />
      </Head>
      <RegisterForm />
    </>
  );
}