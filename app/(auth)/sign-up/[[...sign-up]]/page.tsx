import { SignUp } from "@clerk/nextjs";


export const runtime = "edge";

export default function Page() {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <SignUp />
    </div>
  );
}
