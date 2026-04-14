import Head from "next/head";

import { LoginForm } from "@/components/auth";

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>GrabPic | Sign In</title>
        <meta
          name="description"
          content="Sign in to your GrabPic dashboard to find and curate event memories with AI."
        />
      </Head>
      <LoginForm />
    </>
  );
}